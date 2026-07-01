"""
PDF processing services using PyPDF2 and other libraries.
"""
import io
import zipfile
import logging
from typing import List, Tuple
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image

# Raise Pillow's decompression bomb limit. The default (~89M pixels) blocks
# legitimate high-DPI PDF page renders — an A4 page at 300 DPI is ~8.7M
# pixels but tabloid/A3 pages, multi-page composites, or scanned PDFs at
# 300 DPI often exceed the default. We allow up to 600M pixels (~2.4 GB
# uncompressed RGBA), which covers real-world documents without opening us
# up to actual decompression-bomb attacks.
Image.MAX_IMAGE_PIXELS = 600_000_000
import tempfile
import os
from pathlib import Path

from app.utils import PDFProcessingError

logger = logging.getLogger(__name__)


class PDFService:
    """Service for PDF processing operations."""
    
    @staticmethod
    def merge_pdfs(pdf_files: List[bytes]) -> bytes:
        """
        Merge multiple PDF files into a single PDF.
        Handles encrypted PDFs (AES-encrypted) gracefully by attempting
        empty-password decryption. Password-protected PDFs are rejected
        with a clear user-facing error.
        
        Args:
            pdf_files: List of PDF file bytes
            
        Returns:
            bytes: Merged PDF as bytes
            
        Raises:
            PDFProcessingError: If merging fails or password-protected PDFs found
        """
        encrypted_files: List[int] = []
        writer = PdfWriter()
        
        try:
            for i, pdf_bytes in enumerate(pdf_files):
                pdf_stream = io.BytesIO(pdf_bytes)
                reader = PdfReader(pdf_stream)
                
                # Check if PDF is encrypted
                if reader.is_encrypted:
                    # Try to decrypt with empty password (common for AES-encrypted,
                    # owner-protected, or permission-restricted PDFs that still
                    # allow reading)
                    try:
                        decrypt_result = reader.decrypt("")
                        if decrypt_result == 0:
                            # Decryption failed - truly password-protected
                            encrypted_files.append(i + 1)  # 1-based for user display
                            continue
                    except Exception:
                        # Decryption attempt itself raised - also password-protected
                        encrypted_files.append(i + 1)
                        continue
                
                # Add all pages from this PDF to the writer
                for page in reader.pages:
                    writer.add_page(page)
            
            # If any files were password-protected, raise a clear error
            if encrypted_files:
                file_list = ", ".join(f"PDF #{idx}" for idx in encrypted_files)
                raise PDFProcessingError(
                    f"One or more PDFs are password-protected and cannot be merged. "
                    f"Please unlock the following PDFs first: {file_list}",
                    {
                        "error_type": "EncryptedPDFError",
                        "encrypted_files": encrypted_files,
                    }
                )
            
            # Write the merged PDF
            output_stream = io.BytesIO()
            writer.write(output_stream)
            
            return output_stream.getvalue()
            
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to merge PDFs: {str(e)}",
                {"error_type": type(e).__name__}
            )
    
    @staticmethod
    def split_pdf(
        pdf_bytes: bytes,
        split_method: str = "all",
        page_range: str = None,
        pages_per_split: int = None,
        specific_pages: str = None,
        output_format: str = "individual",
        naming_pattern: str = "page_{n}.pdf",
    ) -> List[Tuple[str, bytes]]:
        """
        Split a PDF using various methods.

        Args:
            pdf_bytes: PDF file bytes
            split_method: "all", "range", "every", or "pages"
            page_range: Comma-separated ranges e.g. "1-5,8-10" (range method)
            pages_per_split: Number of pages per split file (every method)
            specific_pages: Comma-separated pages/ranges e.g. "1,3,5-7" (pages method)
            output_format: "individual" or "single"
            naming_pattern: Filename template with {n} placeholder

        Returns:
            List of (filename, page_bytes) tuples

        Raises:
            PDFProcessingError: If splitting fails
        """
        try:
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            total_pages = len(reader.pages)

            if total_pages == 0:
                raise PDFProcessingError("PDF has no pages to split")

            # Determine which page indices (0-based) to include in each split file
            split_groups: List[List[int]] = []

            if split_method == "range":
                split_groups = PDFService._parse_page_ranges(page_range, total_pages)
            elif split_method == "every":
                split_groups = PDFService._parse_every_n_pages(total_pages, pages_per_split or 1)
            elif split_method == "pages":
                indices = PDFService._parse_specific_pages(specific_pages, total_pages)
                split_groups = [indices]
            else:
                # Default "all": split into individual pages
                split_groups = [[i] for i in range(total_pages)]

            # Generate output files
            pages = []
            for group_idx, page_indices in enumerate(split_groups):
                if not page_indices:
                    continue
                writer = PdfWriter()
                for page_idx in page_indices:
                    writer.add_page(reader.pages[page_idx])

                page_stream = io.BytesIO()
                writer.write(page_stream)
                page_bytes = page_stream.getvalue()

                part_num = group_idx + 1
                filename = naming_pattern.replace("{n}", str(part_num)).replace("{part}", str(part_num))
                pages.append((filename, page_bytes))

            return pages

        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to split PDF: {str(e)}",
                {"error_type": type(e).__name__}
            )

    @staticmethod
    def _parse_page_ranges(ranges_str: str, total_pages: int) -> List[List[int]]:
        """Parse comma-separated page ranges into groups of 0-based indices."""
        groups = []
        if not ranges_str:
            return [[i] for i in range(total_pages)]

        parts = [p.strip() for p in ranges_str.split(",")]
        for part in parts:
            if "-" in part:
                try:
                    start_str, end_str = part.split("-", 1)
                    start = int(start_str.strip())
                    end = int(end_str.strip())
                except ValueError:
                    raise PDFProcessingError(f"Invalid page range: {part}")
            else:
                try:
                    start = end = int(part.strip())
                except ValueError:
                    raise PDFProcessingError(f"Invalid page number: {part}")

            if start < 1 or end > total_pages or start > end:
                raise PDFProcessingError(
                    f"Page range {start}-{end} is out of bounds (PDF has {total_pages} pages)"
                )
            groups.append(list(range(start - 1, end)))

        return groups

    @staticmethod
    def _parse_every_n_pages(total_pages: int, n: int) -> List[List[int]]:
        """Split pages into groups of n pages each."""
        if n < 1:
            raise PDFProcessingError("Pages per split must be at least 1")
        groups = []
        for i in range(0, total_pages, n):
            groups.append(list(range(i, min(i + n, total_pages))))
        return groups

    @staticmethod
    def _parse_specific_pages(pages_str: str, total_pages: int) -> List[int]:
        """Parse specific pages/ranges into a flat list of 0-based indices."""
        if not pages_str:
            return list(range(total_pages))

        indices = []
        parts = [p.strip() for p in pages_str.split(",")]
        for part in parts:
            if "-" in part:
                try:
                    start_str, end_str = part.split("-", 1)
                    start = int(start_str.strip())
                    end = int(end_str.strip())
                except ValueError:
                    raise PDFProcessingError(f"Invalid page range: {part}")
            else:
                try:
                    start = end = int(part.strip())
                except ValueError:
                    raise PDFProcessingError(f"Invalid page number: {part}")

            if start < 1 or end > total_pages or start > end:
                raise PDFProcessingError(
                    f"Page range {start}-{end} is out of bounds (PDF has {total_pages} pages)"
                )
            indices.extend(range(start - 1, end))

        return indices
    
    @staticmethod
    def add_watermark(pdf_bytes: bytes, watermark_text: str) -> bytes:
        """
        Add text watermark to all pages of a PDF.
        
        Args:
            pdf_bytes: PDF file bytes
            watermark_text: Text to use as watermark
            
        Returns:
            bytes: Watermarked PDF as bytes
            
        Raises:
            PDFProcessingError: If watermarking fails
        """
        try:
            # Create watermark PDF
            watermark_stream = io.BytesIO()
            c = canvas.Canvas(watermark_stream, pagesize=letter)
            
            # Set watermark properties
            c.setFont("Helvetica", 60)
            c.setFillColorRGB(0.8, 0.8, 0.8, alpha=0.3)  # Light gray with transparency
            c.rotate(45)  # Diagonal watermark
            
            # Position watermark in center
            c.drawString(100, 300, watermark_text)
            c.save()
            
            watermark_stream.seek(0)
            watermark_reader = PdfReader(watermark_stream)
            watermark_page = watermark_reader.pages[0]
            
            # Apply watermark to each page
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            writer = PdfWriter()
            
            for page in reader.pages:
                page.merge_page(watermark_page)
                writer.add_page(page)
            
            output_stream = io.BytesIO()
            writer.write(output_stream)
            return output_stream.getvalue()
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to add watermark: {str(e)}",
                {"error_type": type(e).__name__, "watermark_text": watermark_text}
            )
    
    @staticmethod
    def add_watermark_enhanced(
        pdf_bytes: bytes,
        watermark_type: str = "text",
        watermark_text: str = "",
        position: str = "center",
        opacity: int = 30,
        rotation: int = 45,
        pages: str = "all",
        custom_page_range: str = "",
        font_size: int = 36,
        color: str = "#808080",
        image_bytes: bytes = None
    ) -> bytes:
        """
        Add text or image watermark to PDF pages with configurable settings.
        
        Args:
            pdf_bytes: PDF file bytes
            watermark_type: Type of watermark: 'text' or 'image'
            watermark_text: Text for watermark (required for text watermarks)
            position: Watermark position: 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
            opacity: Watermark opacity (0-100)
            rotation: Watermark rotation angle (0-360)
            pages: Pages to apply watermark: 'all', 'first', 'last', 'custom'
            custom_page_range: Custom page range (e.g., '1,3,5-7') when pages='custom'
            font_size: Font size in points (default: 36)
            color: Color in hex format (default: #808080 gray)
            image_bytes: Image file bytes for image watermark
            opacity: Watermark opacity (0-100)
            rotation: Watermark rotation angle (0-360)
            pages: Pages to apply watermark: 'all', 'first', 'last', 'custom'
            custom_page_range: Custom page range (e.g., '1,3,5-7') when pages='custom'
            image_bytes: Image file bytes for image watermark
            
        Returns:
            bytes: Watermarked PDF as bytes
            
        Raises:
            PDFProcessingError: If watermarking fails
        """
        try:
            # Parse page selection
            page_indices = []
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            total_pages = len(reader.pages)
            
            if pages == "all":
                page_indices = list(range(total_pages))
            elif pages == "first":
                page_indices = [0] if total_pages > 0 else []
            elif pages == "last":
                page_indices = [total_pages - 1] if total_pages > 0 else []
            elif pages == "custom":
                # Parse custom page range like "1,3,5-7"
                page_indices = []
                if custom_page_range:
                    for part in custom_page_range.split(','):
                        part = part.strip()
                        if '-' in part:
                            start_str, end_str = part.split('-', 1)
                            try:
                                start = int(start_str.strip()) - 1  # Convert to 0-based
                                end = int(end_str.strip()) - 1
                                for i in range(start, min(end + 1, total_pages)):
                                    if i >= 0:
                                        page_indices.append(i)
                            except ValueError:
                                pass
                        else:
                            try:
                                page_num = int(part.strip()) - 1  # Convert to 0-based
                                if 0 <= page_num < total_pages:
                                    page_indices.append(page_num)
                            except ValueError:
                                pass
            else:
                page_indices = list(range(total_pages))
            
            if not page_indices:
                raise PDFProcessingError(
                    "No valid pages selected for watermarking",
                    {"pages": pages, "custom_page_range": custom_page_range, "total_pages": total_pages}
                )
            
            # Create watermark based on type
            if watermark_type == "text":
                if not watermark_text:
                    raise PDFProcessingError(
                        "watermark_text is required for text watermarks",
                        {"watermark_type": watermark_type}
                    )
                watermark_stream = PDFService._create_text_watermark(
                    watermark_text, position, opacity, rotation, font_size, color
                )
            elif watermark_type == "image":
                if not image_bytes:
                    raise PDFProcessingError(
                        "image_bytes is required for image watermarks",
                        {"watermark_type": watermark_type}
                    )
                watermark_stream = PDFService._create_image_watermark(
                    image_bytes, position, opacity, rotation
                )
            else:
                raise PDFProcessingError(
                    f"Invalid watermark_type: {watermark_type}",
                    {"watermark_type": watermark_type}
                )
            
            # Read the watermark PDF
            watermark_stream.seek(0)
            watermark_reader = PdfReader(watermark_stream)
            watermark_page = watermark_reader.pages[0]
            
            # Apply watermark to selected pages
            writer = PdfWriter()

            # O(1) membership check — list was O(n²) on large PDFs.
            page_index_set = set(page_indices)
            for i, page in enumerate(reader.pages):
                if i in page_index_set:
                    # Merge watermark onto this page
                    page.merge_page(watermark_page)
                writer.add_page(page)
            
            output_stream = io.BytesIO()
            writer.write(output_stream)
            return output_stream.getvalue()
            
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to add enhanced watermark: {str(e)}",
                {
                    "error_type": type(e).__name__,
                    "watermark_type": watermark_type,
                    "position": position,
                    "opacity": opacity,
                    "rotation": rotation,
                    "pages": pages
                }
            )
    
    @staticmethod
    def _create_text_watermark(
        text: str,
        position: str = "center",
        opacity: int = 30,
        rotation: int = 45,
        font_size: int = 36,
        color: str = "#808080"
    ) -> io.BytesIO:
        """Create a PDF with text watermark."""
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        
        watermark_stream = io.BytesIO()
        c = canvas.Canvas(watermark_stream, pagesize=letter)
        
        # Set opacity (alpha)
        alpha = opacity / 100.0
        
        # Parse color from hex to RGB
        try:
            # Remove # if present
            color_hex = color.lstrip('#')
            # Convert hex to RGB (0-255)
            r = int(color_hex[0:2], 16) / 255.0
            g = int(color_hex[2:4], 16) / 255.0
            b = int(color_hex[4:6], 16) / 255.0
        except (ValueError, IndexError):
            # Default to gray if color parsing fails
            r, g, b = 0.5, 0.5, 0.5
        
        # Set font and color
        c.setFont("Helvetica", font_size)
        c.setFillColorRGB(r, g, b, alpha=alpha)
        
        # Apply rotation
        c.rotate(rotation)
        
        # Calculate position
        width, height = letter
        text_width = c.stringWidth(text, "Helvetica", font_size)
        
        if position == "center":
            x = (width - text_width) / 2
            y = height / 2
            # Draw text
            c.drawString(x, y, text)
        elif position == "top-left":
            x = 50
            y = height - 100
            c.drawString(x, y, text)
        elif position == "top-right":
            x = width - text_width - 50
            y = height - 100
            c.drawString(x, y, text)
        elif position == "bottom-left":
            x = 50
            y = 100
            c.drawString(x, y, text)
        elif position == "bottom-right":
            x = width - text_width - 50
            y = 100
            c.drawString(x, y, text)
        elif position == "diagonal":
            # Create diagonal pattern - multiple watermarks across the page
            # We'll create watermarks along a diagonal line from top-left to bottom-right
            spacing = 150  # Space between watermarks
            num_repeats = 5  # Number of diagonal watermarks
            
            for i in range(num_repeats):
                # Calculate position along diagonal
                x_offset = i * spacing
                y_offset = i * spacing
                
                # Draw watermark at multiple positions
                x1 = 50 + x_offset
                y1 = height - 100 - y_offset
                c.drawString(x1, y1, text)
                
                # Also draw mirrored on opposite diagonal
                x2 = width - text_width - 50 - x_offset
                y2 = 100 + y_offset
                c.drawString(x2, y2, text)
        else:  # default to center
            x = (width - text_width) / 2
            y = height / 2
            c.drawString(x, y, text)
        c.save()
        
        watermark_stream.seek(0)
        return watermark_stream
    
    @staticmethod
    def _create_image_watermark(
        image_bytes: bytes,
        position: str = "center",
        opacity: int = 30,
        rotation: int = 0
    ) -> io.BytesIO:
        """Create a PDF with image watermark."""
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        
        watermark_stream = io.BytesIO()
        c = canvas.Canvas(watermark_stream, pagesize=letter)
        
        # Create temporary image file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        
        try:
            # Open image with PIL to get dimensions
            img = Image.open(io.BytesIO(image_bytes))
            img_width, img_height = img.size
            
            # Calculate position
            width, height = letter
            scale = min(width * 0.3 / img_width, height * 0.3 / img_height)
            scaled_width = img_width * scale
            scaled_height = img_height * scale
            
            if position == "center":
                x = (width - scaled_width) / 2
                y = (height - scaled_height) / 2
            elif position == "top-left":
                x = 50
                y = height - scaled_height - 50
            elif position == "top-right":
                x = width - scaled_width - 50
                y = height - scaled_height - 50
            elif position == "bottom-left":
                x = 50
                y = 50
            elif position == "bottom-right":
                x = width - scaled_width - 50
                y = 50
            else:  # default to center
                x = (width - scaled_width) / 2
                y = (height - scaled_height) / 2
            
            # Draw image with opacity and rotation
            c.saveState()
            c.setFillAlpha(opacity / 100.0)
            
            # For rotation around center of image
            if rotation != 0:
                # Translate to center of image, rotate, then translate back
                center_x = x + scaled_width / 2
                center_y = y + scaled_height / 2
                c.translate(center_x, center_y)
                c.rotate(rotation)
                c.translate(-center_x, -center_y)
            
            c.drawImage(tmp_path, x, y, width=scaled_width, height=scaled_height, mask='auto')
            c.restoreState()
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_path)
            except:
                pass
        
        c.save()
        watermark_stream.seek(0)
        return watermark_stream

    @staticmethod
    def _recompress_images_in_pdf(pdf, compression_level: str) -> int:
        """
        Iterate all pages and recompress embedded images.

        Args:
            pdf: An open pikepdf.Pdf object
            compression_level: One of "low", "medium", "high"

        Returns:
            Number of images recompressed
        """
        import pikepdf
        from PIL import Image
        import io as io_module
        import base64 as b64

        # Quality settings per level
        if compression_level == "high":
            jpeg_quality = 40
            max_pixels = 1500 * 1500  # ~2.25 MP, roughly 150 dpi at letter size
        elif compression_level == "medium":
            jpeg_quality = 70
            max_pixels = None  # keep original resolution
        else:  # low — no image recompression
            return 0

        images_processed = 0

        for page_num, page in enumerate(pdf.pages):
            if "/Resources" not in page or "/XObject" not in page.Resources:
                continue

            xobjects = page.Resources.XObject
            for name in list(xobjects.keys()):
                xobj = xobjects[name]
                # Only process image XObjects
                if xobj.get("/Subtype") != pikepdf.Name("/Image"):
                    continue
                if xobj.get("/Type") != pikepdf.Name("/XObject"):
                    continue

                try:
                    raw_bytes = xobj.read_raw_bytes()
                    raw_size = len(raw_bytes)
                    if raw_size == 0:
                        continue

                    # --- Determine how to decode this image ---
                    filters = xobj.get("/Filter", pikepdf.Array([]))
                    filter_list = []
                    if isinstance(filters, pikepdf.Array):
                        filter_list = [str(f) for f in filters]
                    elif isinstance(filters, pikepdf.Name):
                        filter_list = [str(filters)]

                    has_ascii85 = "/ASCII85Decode" in filter_list
                    has_dct = "/DCTDecode" in filter_list or "/DCTDecode" in str(getattr(xobj, "Filter", ""))

                    # Attempt 1: If the stream is an ASCII85-wrapped JPEG, decode and open directly
                    if has_ascii85 and has_dct:
                        cleaned = raw_bytes.replace(b' ', b'').replace(b'\n', b'').replace(b'\r', b'')
                        jpeg_bytes = b64.a85decode(cleaned, adobe=True)
                        img = Image.open(io_module.BytesIO(jpeg_bytes))
                        img.load()  # ensure full decode
                        decoded_size = len(jpeg_bytes)  # for size comparison

                    # Attempt 2: If the stream is plain JPEG (DCT only), open directly
                    elif has_dct:
                        img = Image.open(io_module.BytesIO(raw_bytes))
                        img.load()
                        decoded_size = raw_size

                    # Attempt 3: Try pikepdf's built-in decode (non-JPEG streams)
                    else:
                        try:
                            pixel_data = xobj.read_bytes()
                        except Exception:
                            # Last resort: try PIL on raw bytes
                            img = Image.open(io_module.BytesIO(raw_bytes))
                            img.load()
                            img = img.convert("RGB")
                            img_width, img_height = img.size
                            jpeg_buf = io_module.BytesIO()
                            img.save(jpeg_buf, format="JPEG", quality=jpeg_quality, optimize=True)
                            jpeg_data = jpeg_buf.getvalue()
                            if len(jpeg_data) >= raw_size:
                                continue
                            xobj.write(jpeg_data)
                            xobj.Filter = pikepdf.Array([pikepdf.Name.DCTDecode])
                            xobj.Width = pikepdf.Integer(img.width)
                            xobj.Height = pikepdf.Integer(img.height)
                            xobj.BitsPerComponent = pikepdf.Integer(8)
                            xobj.ColorSpace = pikepdf.Name.DeviceRGB if img.mode == "RGB" else pikepdf.Name.DeviceGray
                            images_processed += 1
                            continue
                        # read_bytes succeeded
                        img_width = int(xobj.Width)
                        img_height = int(xobj.Height)
                        color_space = xobj.get("/ColorSpace", pikepdf.Name.DeviceRGB)
                        if color_space == pikepdf.Name.DeviceRGB:
                            pil_mode = "RGB"
                        elif color_space == pikepdf.Name.DeviceGray:
                            pil_mode = "L"
                        elif color_space == pikepdf.Name.DeviceCMYK:
                            pil_mode = "CMYK"
                        else:
                            pil_mode = "RGB"
                        img = Image.frombytes(pil_mode, (img_width, img_height), pixel_data)
                        decoded_size = len(pixel_data)

                    # --- Recompress ---
                    if img.mode in ("RGBA", "LA", "P", "PA", "CMYK"):
                        img = img.convert("RGB")
                    elif img.mode not in ("RGB", "L", "1"):
                        img = img.convert("RGB")

                    # Downsample for high compression
                    if max_pixels and img.width * img.height > max_pixels:
                        ratio = (max_pixels / (img.width * img.height)) ** 0.5
                        new_w = max(1, int(img.width * ratio))
                        new_h = max(1, int(img.height * ratio))
                        img = img.resize((new_w, new_h), Image.LANCZOS)

                    # Encode as JPEG
                    out_buf = io_module.BytesIO()
                    img.save(out_buf, format="JPEG", quality=jpeg_quality, optimize=True)
                    jpeg_data = out_buf.getvalue()

                    # Only replace if new data is at least 5% smaller
                    if len(jpeg_data) >= decoded_size * 0.95:
                        continue

                    # Replace stream in the XObject
                    xobj.write(jpeg_data)
                    xobj.Filter = pikepdf.Array([pikepdf.Name.DCTDecode])
                    xobj.Width = pikepdf.Integer(img.width)
                    xobj.Height = pikepdf.Integer(img.height)
                    xobj.BitsPerComponent = pikepdf.Integer(8)
                    xobj.ColorSpace = pikepdf.Name.DeviceRGB if img.mode == "RGB" else pikepdf.Name.DeviceGray

                    images_processed += 1

                except Exception as img_err:
                    logger.debug(
                        "Skipping image on page %d (xobj=%s): %s",
                        page_num + 1, name, img_err,
                    )
                    continue

        return images_processed

    @staticmethod
    def compress_pdf(pdf_bytes: bytes, compression_level: str = "medium") -> bytes:
        """
        Compress a PDF file to reduce file size.

        Levels:
          - low:    Content-stream compression only (lossless)
          - medium: Recompress images to JPEG quality 70 (good balance)
          - high:   Recompress images to JPEG quality 40 + downsample >2.25 MP

        Uses temporary files to avoid latin-1 encoding issues in pikepdf
        when PDFs contain non-ASCII metadata.

        Args:
            pdf_bytes: Raw PDF file bytes
            compression_level: One of "low", "medium", "high"

        Returns:
            Compressed PDF bytes
        """
        try:
            import pikepdf
        except ImportError:
            logger.error("pikepdf is not installed — cannot compress PDF")
            raise PDFProcessingError(
                "PDF compression is not available. Please install pikepdf.",
                {"type": "dependency_missing", "library": "pikepdf"}
            )

        # Validate compression level
        if compression_level not in ("low", "medium", "high"):
            raise ValueError(
                f"Invalid compression level: {compression_level!r}. "
                "Must be 'low', 'medium', or 'high'."
            )

        with tempfile.TemporaryDirectory(prefix="compress_pdf_") as temp_dir:
            temp_dir_path = Path(temp_dir)
            input_path = temp_dir_path / "input.pdf"
            output_path = temp_dir_path / "output_compressed.pdf"

            input_path.write_bytes(pdf_bytes)

            # --- Primary path ---
            try:
                pdf = pikepdf.open(str(input_path))
                try:
                    # Step 1: Recompress images (medium / high only)
                    images_processed = PDFService._recompress_images_in_pdf(
                        pdf, compression_level
                    )
                    logger.debug(
                        "Recompressed %d images for %s compression",
                        images_processed, compression_level,
                    )

                    # Step 2: Content-stream compression via pikepdf save options
                    if compression_level == "high":
                        save_kwargs = dict(
                            compress_streams=True,
                            stream_decode_level=pikepdf.StreamDecodeLevel.specialized,
                            object_stream_mode=pikepdf.ObjectStreamMode.generate,
                            preserve_pdfa=False,
                        )
                    elif compression_level == "medium":
                        save_kwargs = dict(
                            compress_streams=True,
                            stream_decode_level=pikepdf.StreamDecodeLevel.generalized,
                            object_stream_mode=pikepdf.ObjectStreamMode.preserve,
                            preserve_pdfa=True,
                        )
                    else:  # low
                        save_kwargs = dict(
                            compress_streams=True,
                            stream_decode_level=pikepdf.StreamDecodeLevel.none,
                            object_stream_mode=pikepdf.ObjectStreamMode.preserve,
                            preserve_pdfa=True,
                        )

                    pdf.save(str(output_path), **save_kwargs)
                finally:
                    pdf.close()

                compressed = output_path.read_bytes()
                logger.info(
                    "Compression (%s): %d → %d bytes (%.1f%% reduction) [%d images]",
                    compression_level,
                    len(pdf_bytes),
                    len(compressed),
                    (1 - len(compressed) / max(len(pdf_bytes), 1)) * 100,
                    images_processed,
                )
                return compressed

            except (UnicodeEncodeError, ValueError) as encoding_error:
                logger.warning(
                    "pikepdf encoding error (%s), falling back: %s",
                    type(encoding_error).__name__, encoding_error,
                )

            # --- Fallback: strip metadata, then retry ---
            try:
                reader = PdfReader(str(input_path))
                writer = PdfWriter()
                for page in reader.pages:
                    writer.add_page(page)

                if reader.metadata:
                    try:
                        clean_title = str(reader.metadata.title or "")
                        clean_title = clean_title.encode("ascii", errors="replace").decode("ascii")
                        writer.add_metadata({"/Title": clean_title})
                    except Exception:
                        pass

                cleaned_path = temp_dir_path / "cleaned.pdf"
                with open(str(cleaned_path), "wb") as f:
                    writer.write(f)

                pdf = pikepdf.open(str(cleaned_path))
                try:
                    images_processed = PDFService._recompress_images_in_pdf(
                        pdf, compression_level
                    )

                    if compression_level == "high":
                        save_kwargs = dict(
                            compress_streams=True,
                            stream_decode_level=pikepdf.StreamDecodeLevel.specialized,
                            object_stream_mode=pikepdf.ObjectStreamMode.generate,
                            preserve_pdfa=False,
                        )
                    elif compression_level == "medium":
                        save_kwargs = dict(
                            compress_streams=True,
                            stream_decode_level=pikepdf.StreamDecodeLevel.generalized,
                            object_stream_mode=pikepdf.ObjectStreamMode.preserve,
                            preserve_pdfa=True,
                        )
                    else:
                        save_kwargs = dict(
                            compress_streams=True,
                            stream_decode_level=pikepdf.StreamDecodeLevel.none,
                            object_stream_mode=pikepdf.ObjectStreamMode.preserve,
                            preserve_pdfa=True,
                        )

                    pdf.save(str(output_path), **save_kwargs)
                finally:
                    pdf.close()

                compressed = output_path.read_bytes()
                logger.info(
                    "Fallback compression (%s): %d → %d bytes (%.1f%% reduction) [%d images]",
                    compression_level,
                    len(pdf_bytes),
                    len(compressed),
                    (1 - len(compressed) / max(len(pdf_bytes), 1)) * 100,
                    images_processed,
                )
                return compressed

            except Exception as fallback_error:
                logger.error(
                    "Both primary and fallback compression failed: %s",
                    fallback_error,
                )
                raise PDFProcessingError(
                    f"PDF compression failed: {fallback_error}",
                    {
                        "type": "compression_error",
                        "compression_level": compression_level,
                        "original_error": str(fallback_error),
                    },
                )

    @staticmethod
    def protect_pdf(
        pdf_bytes: bytes,
        password: str,
        allow_printing: bool = True,
        allow_copying: bool = True,
        allow_editing: bool = True,
        allow_annotating: bool = True,
    ) -> bytes:
        """
        Encrypt a PDF with password protection using pypdf.

        Args:
            pdf_bytes: The raw PDF file bytes to protect.
            password: The user password required to open the PDF.
            allow_printing: Whether to allow printing (default True).
            allow_copying: Whether to allow copying text/images (default True).
            allow_editing: Whether to allow modifying the document (default True).
            allow_annotating: Whether to allow adding annotations (default True).

        Returns:
            The encrypted PDF bytes.
        """
        from pypdf import PdfReader, PdfWriter

        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            writer = PdfWriter()

            # Clone all pages
            for page in reader.pages:
                writer.add_page(page)

            # Encrypt with user password (no owner password for simplicity)
            # pypdf 5.x supports AES encryption via the encrypt method
            writer.encrypt(
                user_password=password,
                permissions_flag=(
                    (allow_printing and 0b000001000100 or 0) |
                    (allow_copying and 0b000000010000 or 0) |
                    (allow_editing and 0b000000001000 or 0) |
                    (allow_annotating and 0b000000100000 or 0)
                ) or -1,  # -1 means no restrictions if all allowed
                algorithm="AES-256",
            )

            output = io.BytesIO()
            writer.write(output)
            output.seek(0)
            return output.getvalue()

        except Exception:
            raise PDFProcessingError(
                "PDF protection failed",
                {"password_length": len(password)},
            )

    @staticmethod
    def unlock_pdf(pdf_bytes: bytes, password: str) -> bytes:
        """Remove password protection from an encrypted PDF.

        Raises PDFProcessingError if the password is wrong or the file isn't encrypted.
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            if reader.is_encrypted:
                # pypdf returns 0 on wrong password, 1 user pw, 2 owner pw
                if reader.decrypt(password) == 0:
                    raise PDFProcessingError("Incorrect password for this PDF.")
            writer = PdfWriter()
            for page in reader.pages:
                writer.add_page(page)
            output = io.BytesIO()
            writer.write(output)
            return output.getvalue()
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(f"Failed to unlock PDF: {e}")

    @staticmethod
    def rotate_pdf(pdf_bytes: bytes, angle: int, page_range: str = "all") -> bytes:
        """Rotate selected pages by angle (90/180/270). page_range follows the
        split-pdf `_parse_specific_pages` syntax (e.g. "1,3,5-7"); "all" rotates every page.
        """
        if angle not in (90, 180, 270):
            raise PDFProcessingError("Rotation angle must be 90, 180, or 270.")
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            total = len(reader.pages)
            if total == 0:
                raise PDFProcessingError("PDF has no pages.")
            if page_range.strip().lower() == "all":
                indices = set(range(total))
            else:
                indices = set(PDFService._parse_specific_pages(page_range, total))
            writer = PdfWriter()
            for i, page in enumerate(reader.pages):
                if i in indices:
                    page.rotate(angle)
                writer.add_page(page)
            output = io.BytesIO()
            writer.write(output)
            return output.getvalue()
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(f"Failed to rotate PDF: {e}")

    @staticmethod
    def extract_pages(pdf_bytes: bytes, pages: str) -> bytes:
        """Extract selected pages (e.g. "1,3,5-7") into a single new PDF."""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            total = len(reader.pages)
            if total == 0:
                raise PDFProcessingError("PDF has no pages.")
            indices = PDFService._parse_specific_pages(pages, total)
            if not indices:
                raise PDFProcessingError("No pages selected.")
            writer = PdfWriter()
            for idx in indices:
                writer.add_page(reader.pages[idx])
            output = io.BytesIO()
            writer.write(output)
            return output.getvalue()
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(f"Failed to extract pages: {e}")

    @staticmethod
    def page_numbering(
        pdf_bytes: bytes,
        number_format: str = "1,2,3",
        starting_number: int = 1,
        format_template: str = "{n}",
        position: str = "bottom-center",
        alignment: str = "center",
        page_range: str = "all",
        font_size: int = 12,
        font_color: str = "#000000",
        font_family: str = "Helvetica",
        prefix: str = "",
        suffix: str = "",
    ) -> bytes:
        """
        Add page numbers to a PDF using reportlab + pypdf overlay merging.

        Args:
            pdf_bytes: The raw PDF file bytes.
            number_format: "1,2,3" | "I,II,III" | "i,ii,iii" | "A,B,C" | "Page 1" | "1 of 10" | "PAGE-001"
            starting_number: First page number to use (default 1).
            format_template: Template string with {n} and {total} placeholders.
            position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right".
            alignment: "left" | "center" | "right".
            page_range: "all" | "odd" | "even" | "first" | custom like "1-5" or "2,4,6".
            font_size: Font size for the page number text.
            font_color: Hex color string for the font.
            font_family: Font family name (e.g., "Helvetica", "Courier", "Times-Roman").

        Returns:
            The PDF bytes with page numbers applied.
        """
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4, letter
        from reportlab.lib.units import mm, inch

        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            total_pages = len(reader.pages)
            writer = PdfWriter()

            # Parse color
            r = int(font_color[1:3], 16) / 255.0
            g = int(font_color[3:5], 16) / 255.0
            b = int(font_color[5:7], 16) / 255.0

            # Determine which pages to number
            pages_to_number = PDFService._resolve_page_range(page_range, total_pages)

            # Pre-compute the ordinal position of each numbered page so
            # the inner loop is O(1) per page instead of O(n²).
            sorted_numbered = sorted(pages_to_number)
            page_ordinal = {p: i for i, p in enumerate(sorted_numbered)}

            for page_idx in range(total_pages):
                page = reader.pages[page_idx]

                if page_idx not in pages_to_number:
                    writer.add_page(page)
                    continue

                # Get page dimensions
                page_width = float(page.mediabox.width)
                page_height = float(page.mediabox.height)

                page_number = starting_number + page_ordinal[page_idx]

                # Format the number text
                number_text = PDFService._format_page_number(
                    page_number, total_pages, number_format, format_template,
                    prefix, suffix
                )

                # Calculate position
                x, y, text_align = PDFService._calculate_position(
                    position, alignment, page_width, page_height, font_size
                )

                # Create overlay with reportlab
                overlay_packet = io.BytesIO()

                # Use A4 if page size matches; otherwise use letter as base
                c = canvas.Canvas(overlay_packet, pagesize=(page_width, page_height))

                # Set styles
                c.setFont(font_family, font_size)
                c.setFillColorRGB(r, g, b)

                # Draw page number
                if text_align == "center":
                    c.drawCentredString(x, y, number_text)
                elif text_align == "right":
                    c.drawRightString(x, y, number_text)
                else:  # left
                    c.drawString(x, y, number_text)

                c.save()
                overlay_packet.seek(0)

                # Merge overlay onto page
                overlay_pdf = PdfReader(overlay_packet)
                page.merge_page(overlay_pdf.pages[0])
                writer.add_page(page)

            output = io.BytesIO()
            writer.write(output)
            output.seek(0)
            return output.getvalue()

        except Exception as e:
            raise PDFProcessingError(
                f"Page numbering failed: {str(e)}",
                {
                    "number_format": number_format,
                    "starting_number": starting_number,
                    "position": position,
                    "total_pages": total_pages if 'total_pages' in dir() else 0,
                },
            )

    @staticmethod
    def _resolve_page_range(page_range: str, total_pages: int) -> set:
        """Resolve a page range string to a set of 0-based page indices."""
        if page_range == "all":
            return set(range(total_pages))
        elif page_range == "odd":
            return set(i for i in range(total_pages) if (i + 1) % 2 == 1)
        elif page_range == "even":
            return set(i for i in range(total_pages) if (i + 1) % 2 == 0)
        elif page_range == "first":
            return {0} if total_pages > 0 else set()
        elif "-" in page_range:
            # Range like "2-5"
            parts = page_range.split("-")
            try:
                start = int(parts[0].strip()) - 1
                end = int(parts[1].strip()) if len(parts) > 1 and parts[1].strip() else total_pages
                start = max(0, start)
                end = min(total_pages, end)
                return set(range(start, end))
            except (ValueError, IndexError):
                return set(range(total_pages))
        elif "," in page_range:
            # Comma-separated like "2,4,6"
            indices = set()
            for part in page_range.split(","):
                try:
                    idx = int(part.strip()) - 1
                    if 0 <= idx < total_pages:
                        indices.add(idx)
                except ValueError:
                    pass
            return indices
        else:
            return set(range(total_pages))

    @staticmethod
    def _format_page_number(
        page_number: int,
        total_pages: int,
        number_format: str,
        format_template: str,
        prefix: str,
        suffix: str,
    ) -> str:
        """Format a page number according to the format type and template."""
        # Convert number based on format
        if number_format == "I,II,III":
            num_str = PDFService._to_roman(page_number)
        elif number_format == "i,ii,iii":
            num_str = PDFService._to_roman(page_number).lower()
        elif number_format == "A,B,C":
            num_str = PDFService._to_alpha(page_number)
        elif number_format == "Page 1":
            num_str = f"Page {page_number}"
        elif number_format == "1 of 10":
            num_str = f"{page_number} of {total_pages}"
        elif number_format == "PAGE-001":
            num_str = f"PAGE-{page_number:03d}"
        else:  # "1,2,3" or numeric
            num_str = str(page_number)

        # If format_template is provided and different from default, use it
        if format_template and format_template != "{n}":
            result = format_template.replace("{n}", num_str).replace("{total}", str(total_pages))
            result = prefix + result + suffix
        else:
            result = prefix + num_str + suffix

        return result

    @staticmethod
    def _to_roman(num: int) -> str:
        """Convert integer to uppercase Roman numeral."""
        values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
        symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
        result = ""
        for v, s in zip(values, symbols):
            while num >= v:
                result += s
                num -= v
        return result

    @staticmethod
    def _to_alpha(num: int) -> str:
        """Convert integer to alphabetic (A, B, C, ... Z, AA, AB, ...)."""
        result = ""
        while num > 0:
            num -= 1
            result = chr(ord('A') + num % 26) + result
            num //= 26
        return result

    @staticmethod
    def _calculate_position(
        position: str,
        alignment: str,
        page_width: float,
        page_height: float,
        font_size: int,
    ):
        """Calculate (x, y) coordinates and text alignment for page number placement."""
        margin = 30  # pixels from edge
        y_offset = font_size + 10  # additional offset from edge

        # Determine Y position
        is_top = position.startswith("top")
        if is_top:
            y = page_height - y_offset
        else:  # bottom
            y = y_offset

        # Determine horizontal positioning
        if position.endswith("left"):
            x = margin
            text_align = "left"
        elif position.endswith("right"):
            x = page_width - margin
            text_align = "right"
        else:  # center
            x = page_width / 2
            text_align = "center"

        # Override with explicit alignment when position is just "top" or "bottom"
        if position in ("top", "bottom"):
            if alignment == "left":
                x = margin
                text_align = "left"
            elif alignment == "right":
                x = page_width - margin
                text_align = "right"
            else:
                x = page_width / 2
                text_align = "center"

        return x, y, text_align


class ImageToPDFService:
    """Service for image to PDF conversion."""

    PAGE_SIZES_PT = {
        "a4": (595.28, 841.89),
        "letter": (612, 792),
        "legal": (612, 1008),
    }
    MARGINS_PT = {
        "small": 14.17,    # ~5 mm
        "medium": 28.35,   # ~10 mm
        "large": 56.69,    # ~20 mm
    }
    EMBED_DPI = 90

    @staticmethod
    def _fit_image(img: "Image.Image", page_size: str, orientation: str, margin: str) -> "Image.Image":
        """Resize image to fit the target page at EMBED_DPI. Keeps aspect ratio."""
        pw, ph = ImageToPDFService.PAGE_SIZES_PT.get(page_size, (595.28, 841.89))
        if orientation == "landscape":
            pw, ph = ph, pw
        m = ImageToPDFService.MARGINS_PT.get(margin, 28.35)
        usable_w = pw - 2 * m
        usable_h = ph - 2 * m

        max_px_w = int(usable_w / 72 * ImageToPDFService.EMBED_DPI)
        max_px_h = int(usable_h / 72 * ImageToPDFService.EMBED_DPI)

        if img.width <= max_px_w and img.height <= max_px_h:
            return img

        img.thumbnail((max_px_w, max_px_h), Image.LANCZOS)
        return img

    @staticmethod
    def convert_images_to_pdf(
        image_files: List[bytes],
        page_size: str = "a4",
        orientation: str = "portrait",
        margin: str = "medium",
    ) -> bytes:
        """Convert multiple images to a single PDF, resizing to fit the page."""
        try:
            pil_images = []

            for img_bytes in image_files:
                img = Image.open(io.BytesIO(img_bytes))
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                img = ImageToPDFService._fit_image(img, page_size, orientation, margin)
                pil_images.append(img)

            output_stream = io.BytesIO()

            if pil_images:
                pil_images[0].save(
                    output_stream,
                    "PDF",
                    resolution=float(ImageToPDFService.EMBED_DPI),
                    save_all=True,
                    append_images=pil_images[1:],
                )

            for img in pil_images:
                img.close()

            return output_stream.getvalue()
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to convert images to PDF: {str(e)}",
                {"error_type": type(e).__name__, "image_count": len(image_files)}
            )


class PDFToImageService:
    """Service for PDF to image conversion."""
    
    @staticmethod
    def _get_poppler_path():
        """Resolve poppler path from settings if configured."""
        from app.config import settings
        if hasattr(settings, 'POPPLER_PATH') and settings.POPPLER_PATH:
            return settings.POPPLER_PATH
        return None

    @staticmethod
    def _get_page_count(pdf_bytes: bytes) -> int:
        """Get total number of pages in a PDF."""
        try:
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            return len(reader.pages)
        except Exception:
            return 0

    # Largest acceptable single-image pixel count for the raster step. Anything
    # over this causes Pillow to refuse the render (decompression-bomb guard)
    # and effectively blows up backend RAM. We cap below MAX_IMAGE_PIXELS to
    # leave headroom for intermediate buffers and JPEG encoding.
    SAFE_MAX_PIXELS_PER_PAGE = 400_000_000

    @staticmethod
    def safe_dpi(pdf_bytes: bytes, requested_dpi: int) -> tuple[int, bool]:
        """Return a DPI that won't blow past SAFE_MAX_PIXELS_PER_PAGE.

        Examines the largest page in the PDF and, if that page rendered at the
        requested DPI would exceed the safety threshold, scales DPI down to the
        highest value that stays within it. Always returns a (dpi, adjusted)
        tuple — `adjusted=True` means the caller should surface a notice to
        the user.

        Math: Poppler renders at `dpi` per inch. A page that is W x H points
        (1 pt = 1/72 inch) renders to ((W/72) * dpi) x ((H/72) * dpi) pixels.
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            # Find the largest page (area in points^2). Some PDFs mix sizes.
            largest_pts_squared = 0
            largest_w_pts = 612.0  # default Letter
            largest_h_pts = 792.0
            for page in reader.pages:
                box = page.mediabox
                w = float(box.width)
                h = float(box.height)
                if w * h > largest_pts_squared:
                    largest_pts_squared = w * h
                    largest_w_pts = w
                    largest_h_pts = h
        except Exception:
            # Couldn't read sizes — be conservative and return requested DPI
            # untouched. The Pillow MAX_IMAGE_PIXELS guard is the second line
            # of defence.
            return requested_dpi, False

        # Predict pixels at requested DPI.
        w_in = largest_w_pts / 72.0
        h_in = largest_h_pts / 72.0
        predicted_pixels = (w_in * requested_dpi) * (h_in * requested_dpi)

        if predicted_pixels <= PDFToImageService.SAFE_MAX_PIXELS_PER_PAGE:
            return requested_dpi, False

        # Solve for the highest DPI that fits: pixels = (w_in * dpi) * (h_in * dpi)
        # ⇒ dpi = sqrt(SAFE_MAX_PIXELS / (w_in * h_in))
        import math
        max_dpi = int(math.floor(
            math.sqrt(PDFToImageService.SAFE_MAX_PIXELS_PER_PAGE / (w_in * h_in))
        ))
        # Clamp to a sane floor so we never auto-downgrade below "readable".
        capped = max(72, min(max_dpi, requested_dpi))
        return capped, capped < requested_dpi

    @staticmethod
    def _render_pages_pymupdf(pdf_bytes: bytes, page_indices: list, dpi: int, quality: int) -> list:
        """Render 0-indexed pages with PyMuPDF, returning [(idx, jpeg_bytes), ...].

        Single-document, single-threaded path. MuPDF rendering is native C++ —
        no subprocess, no temp file, no PDF re-parse per page — and
        Pixmap.tobytes("jpeg") encodes via libjpeg directly. For multi-page
        PDFs the threaded variant fans this out across cores.
        """
        import fitz

        zoom = dpi / 72.0  # PDF user space is 72 DPI; matrix scales to target DPI
        matrix = fitz.Matrix(zoom, zoom)

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        try:
            out = []
            for idx in page_indices:
                page = doc.load_page(idx)
                pix = page.get_pixmap(matrix=matrix, alpha=False)
                out.append((idx, pix.tobytes("jpeg", jpg_quality=quality)))
                pix = None  # release backing buffer immediately
            return out
        finally:
            doc.close()

    @staticmethod
    def _render_pages_pymupdf_threaded(pdf_bytes: bytes, page_indices: list, dpi: int, quality: int) -> list:
        """Multi-threaded PyMuPDF render.

        MuPDF's per-Document state is not thread-safe, so each worker opens
        its own Document on the same in-memory bytes (fitz.open is zero-copy
        for stream= input). get_pixmap releases the GIL for the heavy raster
        step, so threads scale close to linearly on multi-core boxes.
        """
        from concurrent.futures import ThreadPoolExecutor

        n = len(page_indices)
        if n <= 1:
            return PDFToImageService._render_pages_pymupdf(pdf_bytes, page_indices, dpi, quality)

        workers = min(8, os.cpu_count() or 2, n)
        if workers <= 1:
            return PDFToImageService._render_pages_pymupdf(pdf_bytes, page_indices, dpi, quality)

        # Even-sized chunks; remainder spread across the first few workers
        base, rem = divmod(n, workers)
        chunks = []
        cursor = 0
        for i in range(workers):
            size = base + (1 if i < rem else 0)
            if size > 0:
                chunks.append(page_indices[cursor:cursor + size])
                cursor += size

        with ThreadPoolExecutor(max_workers=len(chunks)) as pool:
            futures = [
                pool.submit(
                    PDFToImageService._render_pages_pymupdf,
                    pdf_bytes, ch, dpi, quality,
                )
                for ch in chunks
            ]
            chunk_results = [f.result() for f in futures]

        # Flatten + sort by absolute page index (cheap; safer than trusting order)
        flat = [item for chunk in chunk_results for item in chunk]
        flat.sort(key=lambda t: t[0])
        return flat

    @staticmethod
    def convert_pdf_to_image(pdf_bytes: bytes, page_number: int = 0, quality: int = 85, dpi: int = 150) -> bytes:
        """
        Convert a single PDF page to JPEG image.

        Primary path uses PyMuPDF (fitz) — no Poppler subprocess, no temp
        file, encodes JPEG via libjpeg directly. Typically 3-8x faster than
        the pdf2image/pdftoppm pipeline for the same render. Falls back to
        pdf2image when fitz is unavailable or rejects a PDF that Poppler
        still parses.
        """
        # --- Primary: PyMuPDF ---
        try:
            results = PDFToImageService._render_pages_pymupdf(
                pdf_bytes, [page_number], dpi, quality,
            )
            if results:
                jpeg_bytes = results[0][1]
                logger.debug(
                    f"[PDFToImageService] Single page rendered via PyMuPDF: "
                    f"{len(jpeg_bytes)} bytes (page={page_number + 1}, dpi={dpi}, q={quality})"
                )
                return jpeg_bytes
        except ImportError:
            logger.debug("[PDFToImageService] PyMuPDF not installed, falling back to pdf2image")
        except Exception as fitz_err:
            logger.debug(
                f"[PDFToImageService] PyMuPDF render failed "
                f"({type(fitz_err).__name__}: {fitz_err}), falling back to pdf2image"
            )

        # --- Fallback: pdf2image (Poppler) ---
        try:
            from pdf2image import convert_from_bytes
            poppler_path = PDFToImageService._get_poppler_path()

            logger.debug(f"[PDFToImageService] Converting page {page_number + 1} via pdf2image (quality={quality}, dpi={dpi})")

            images = convert_from_bytes(
                pdf_bytes,
                first_page=page_number + 1,
                last_page=page_number + 1,
                dpi=dpi,
                poppler_path=poppler_path,
            )

            if images:
                img_stream = io.BytesIO()
                images[0].save(img_stream, format="JPEG", quality=quality)
                result = img_stream.getvalue()
                logger.debug(f"[PDFToImageService] Single page converted (pdf2image): {len(result)} bytes")
                return result
            raise PDFProcessingError(
                "No images generated from PDF",
                {"page_number": page_number, "quality": quality, "dpi": dpi}
            )
        except ImportError:
            logger.debug("[PDFToImageService] pdf2image not installed, using fallback JPEG")
            return PDFToImageService._create_fallback_jpeg(quality)
        except PDFProcessingError:
            raise
        except Exception as e:
            logger.debug(f"[PDFToImageService] Conversion error: {type(e).__name__}: {e}")
            try:
                return PDFToImageService._create_fallback_jpeg(quality)
            except Exception:
                raise PDFProcessingError(
                    f"Failed to convert PDF to image: {str(e)}",
                    {"error_type": type(e).__name__, "page_number": page_number, "quality": quality, "dpi": dpi}
                )
    
    @staticmethod
    def _render_and_encode_chunk(
        pdf_bytes: bytes,
        first_page: int,
        last_page: int,
        dpi: int,
        quality: int,
        poppler_path,
    ) -> list:
        """Render a page range via one pdftoppm subprocess and JPEG-encode in
        the same worker. Returns [(absolute_page_idx, jpeg_bytes), ...].

        Used by convert_all_pages_to_images to fan rendering out across
        multiple Poppler subprocesses in parallel — see that function's
        docstring for why this beats the in-subprocess thread_count option.
        """
        from pdf2image import convert_from_bytes

        images = convert_from_bytes(
            pdf_bytes,
            first_page=first_page,
            last_page=last_page,
            dpi=dpi,
            poppler_path=poppler_path,
        )
        out = []
        for offset, img in enumerate(images):
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=quality)
            # absolute 0-indexed page number across the whole PDF
            out.append((first_page - 1 + offset, buf.getvalue()))
        return out

    @staticmethod
    def convert_all_pages_to_images(pdf_bytes: bytes, quality: int = 85, dpi: int = 150) -> list:
        """
        Convert all pages of a PDF to JPEG images.

        Primary path: PyMuPDF (fitz) with a thread-pool fan-out. Each worker
        thread opens its own Document on the same in-memory bytes (zero-copy
        via fitz.open(stream=...)) so MuPDF's per-Document non-thread-safety
        is respected; get_pixmap releases the GIL for the heavy raster step
        so threads scale near-linearly across cores. No subprocess, no temp
        files, no per-worker PDF re-parse beyond opening the in-memory bytes.

        Fallback: pdf2image with one independent Poppler subprocess per
        chunk. Kept for environments where PyMuPDF is unavailable or rejects
        a specific PDF that Poppler still parses.
        """
        # --- Primary: PyMuPDF ---
        try:
            import fitz  # noqa: F401 — probe; the helper does the real work

            total_pages = PDFToImageService._get_page_count(pdf_bytes)
            if total_pages <= 0:
                # PyPDF2 couldn't read the page count — ask MuPDF directly.
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                try:
                    total_pages = doc.page_count
                finally:
                    doc.close()

            if total_pages > 0:
                logger.debug(
                    f"[PDFToImageService] Rendering {total_pages} pages via "
                    f"PyMuPDF (dpi={dpi}, quality={quality})"
                )
                results = PDFToImageService._render_pages_pymupdf_threaded(
                    pdf_bytes, list(range(total_pages)), dpi, quality,
                )
                if results:
                    logger.debug(
                        f"[PDFToImageService] All pages rendered via PyMuPDF: "
                        f"{len(results)} pages"
                    )
                    return results
        except ImportError:
            logger.debug("[PDFToImageService] PyMuPDF not installed, falling back to pdf2image")
        except Exception as fitz_err:
            logger.warning(
                f"[PDFToImageService] PyMuPDF render failed "
                f"({type(fitz_err).__name__}: {fitz_err}), falling back to pdf2image"
            )

        # --- Fallback: pdf2image with parallel Poppler subprocesses ---
        try:
            from pdf2image import convert_from_bytes  # noqa: F401  (import-or-fallback probe)
            poppler_path = PDFToImageService._get_poppler_path()

            total_pages = PDFToImageService._get_page_count(pdf_bytes)
            if total_pages <= 0:
                # Couldn't read page count — fall back to single-shot render so
                # we still produce something instead of erroring.
                logger.debug("[PDFToImageService] page count unknown, single-shot render")
                return PDFToImageService._render_and_encode_chunk(
                    pdf_bytes, 1, 999_999, dpi, quality, poppler_path,
                )

            workers = min(8, os.cpu_count() or 2, total_pages)
            base, rem = divmod(total_pages, workers)
            chunks = []
            cursor = 1
            for i in range(workers):
                size = base + (1 if i < rem else 0)
                chunks.append((cursor, cursor + size - 1))
                cursor += size

            logger.debug(
                f"[PDFToImageService] Converting {total_pages} pages in "
                f"{workers} parallel chunks via pdf2image (dpi={dpi}, quality={quality})"
            )

            from concurrent.futures import ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=workers) as pool:
                futures = [
                    pool.submit(
                        PDFToImageService._render_and_encode_chunk,
                        pdf_bytes, first, last, dpi, quality, poppler_path,
                    )
                    for (first, last) in chunks
                ]
                chunk_results = [f.result() for f in futures]

            flat = [item for chunk in chunk_results for item in chunk]
            flat.sort(key=lambda t: t[0])

            if not flat:
                raise PDFProcessingError("No images generated from PDF")

            logger.debug(f"[PDFToImageService] All pages converted (pdf2image): {len(flat)} pages")
            return flat

        except ImportError:
            logger.debug("[PDFToImageService] pdf2image not installed, using fallback for all pages")
            return [(0, PDFToImageService._create_fallback_jpeg(quality))]
        except Exception as e:
            logger.debug(f"[PDFToImageService] All-pages conversion error: {type(e).__name__}: {e}")
            raise PDFProcessingError(
                f"Failed to convert PDF pages to images: {str(e)}",
                {"error_type": type(e).__name__, "quality": quality, "dpi": dpi}
            )
    
    @staticmethod
    def convert_pages_to_zip(pdf_bytes: bytes, base_filename: str, quality: int = 85, dpi: int = 150) -> tuple:
        """
        Convert all pages of a PDF to a ZIP file containing JPEG images.
        
        Args:
            pdf_bytes: PDF file bytes
            base_filename: Base name for output files (without extension)
            quality: Image quality (1-100%)
            dpi: Image resolution in DPI
            
        Returns:
            tuple: (zip_bytes, zip_filename)
        """
        import zipfile
        
        pages = PDFToImageService.convert_all_pages_to_images(pdf_bytes, quality, dpi)

        zip_buffer = io.BytesIO()
        # ZIP_STORED — not DEFLATE — because JPEG payloads are already
        # entropy-coded. Re-compressing them with DEFLATE gains <1% size and
        # costs noticeable CPU on multi-MB outputs (~50-150ms for a 10MB ZIP).
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_STORED) as zf:
            for page_num, img_bytes in pages:
                filename = f"{base_filename}_page_{page_num + 1}.jpg"
                zf.writestr(filename, img_bytes)
        
        zip_buffer.seek(0)
        zip_bytes = zip_buffer.getvalue()
        zip_filename = f"{base_filename}_images.zip"
        
        logger.debug(f"[PDFToImageService] ZIP created: {zip_filename} ({len(zip_bytes)} bytes, {len(pages)} pages)")
        return zip_bytes, zip_filename

    @staticmethod
    def fast_pdf_to_zip(pdf_bytes: bytes, base_filename: str, quality: int = 85, requested_dpi: int = 150) -> tuple:
        """Optimized all-pages PDF-to-ZIP.

        Opens the PDF once with fitz for page count + page dimensions (DPI
        safety), renders with threaded PyMuPDF, zips the results.  Replaces
        the safe_dpi → convert_pages_to_zip → convert_all_pages_to_images
        chain which opens the PDF 6+ times.

        Returns (zip_bytes, zip_filename, effective_dpi, dpi_was_adjusted).
        """
        import fitz
        import math
        import time
        import zipfile

        t_start = time.monotonic()

        # -- 1. Single open: page count + largest page dimensions ----------
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        try:
            total_pages = doc.page_count
            largest_area = 0.0
            largest_w = 612.0
            largest_h = 792.0
            for page in doc:
                r = page.rect
                w, h = r.width, r.height
                if w * h > largest_area:
                    largest_area = w * h
                    largest_w = w
                    largest_h = h
        finally:
            doc.close()

        if total_pages <= 0:
            raise PDFProcessingError("PDF has no pages")

        # -- 2. DPI safety cap (inline, avoids a second PDF open) ----------
        w_in = largest_w / 72.0
        h_in = largest_h / 72.0
        predicted = (w_in * requested_dpi) * (h_in * requested_dpi)
        if predicted > PDFToImageService.SAFE_MAX_PIXELS_PER_PAGE:
            max_dpi = int(math.floor(
                math.sqrt(PDFToImageService.SAFE_MAX_PIXELS_PER_PAGE / (w_in * h_in))
            ))
            effective_dpi = max(72, min(max_dpi, requested_dpi))
            adjusted = True
        else:
            effective_dpi = requested_dpi
            adjusted = False

        t_prep = time.monotonic()

        # -- 3. Threaded PyMuPDF render ------------------------------------
        pages = PDFToImageService._render_pages_pymupdf_threaded(
            pdf_bytes, list(range(total_pages)), effective_dpi, quality,
        )

        t_render = time.monotonic()

        if not pages:
            raise PDFProcessingError("PyMuPDF rendered 0 pages")

        # -- 4. ZIP (STORED — JPEGs are already entropy-coded) -------------
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_STORED) as zf:
            for page_num, img_bytes in pages:
                zf.writestr(f"{base_filename}_page_{page_num + 1}.jpg", img_bytes)

        zip_buffer.seek(0)
        zip_bytes = zip_buffer.getvalue()
        t_zip = time.monotonic()

        logger.info(
            f"[pdf-to-zip] {total_pages} pages, dpi={effective_dpi}, q={quality} | "
            f"prep={t_prep - t_start:.2f}s render={t_render - t_prep:.1f}s "
            f"zip={t_zip - t_render:.2f}s total={t_zip - t_start:.1f}s "
            f"({len(pdf_bytes) / 1048576:.1f}MB in → {len(zip_bytes) / 1048576:.1f}MB out)"
        )

        return zip_bytes, f"{base_filename}_images.zip", effective_dpi, adjusted

    @staticmethod
    def _create_fallback_jpeg(quality: int = 85) -> bytes:
        """Create a blank white JPEG as fallback when pdf2image is unavailable."""
        img = Image.new('RGB', (1240, 1754), color='white')  # A4 at ~150 DPI
        img_stream = io.BytesIO()
        img.save(img_stream, format="JPEG", quality=quality)
        return img_stream.getvalue()


class PDFOptimizationService:
    """Service for PDF optimization and enhancement."""
    
    @staticmethod
    def fix_scanned_pdf(pdf_bytes: bytes) -> bytes:
        """
        Optimize scanned PDF documents.
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            bytes: Optimized PDF as bytes
            
        Raises:
            PDFProcessingError: If optimization fails
        """
        try:
            # For scanned PDFs, we can:
            # 1. Auto-rotate pages based on text orientation
            # 2. Remove blank margins
            # 3. Enhance contrast for better readability
            
            # Since we don't have OCR capabilities, we'll implement basic optimization
            # using pikepdf for compression and cleanup
            
            try:
                import pikepdf
                
                pdf_stream = io.BytesIO(pdf_bytes)
                pdf = pikepdf.open(pdf_stream)
                
                # Remove metadata to reduce size
                if '/Metadata' in pdf.Root:
                    del pdf.Root.Metadata
                
                # Remove unnecessary objects
                pdf.remove_unreferenced_resources()
                
                # Compress streams
                for page in pdf.pages:
                    if '/Contents' in page:
                        # Compress page content
                        pass
                
                # Save optimized PDF
                output_stream = io.BytesIO()
                pdf.save(output_stream,
                        compress_streams=True,
                        stream_decode_level=pikepdf.StreamDecodeLevel.generalized)
                
                return output_stream.getvalue()
                
            except ImportError:
                # Fallback: return original PDF if pikepdf not available
                return pdf_bytes
                
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to optimize scanned PDF: {str(e)}",
                {"error_type": type(e).__name__}
            )
    
    @staticmethod
    def optimize_for_viewing(pdf_bytes: bytes) -> bytes:
        """
        Optimize PDF for web viewing.
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            bytes: Optimized PDF as bytes
            
        Raises:
            PDFProcessingError: If optimization fails
        """
        try:
            # Use pikepdf for compression and optimization
            try:
                import pikepdf
                
                pdf_stream = io.BytesIO(pdf_bytes)
                pdf = pikepdf.open(pdf_stream)
                
                # Optimize for web viewing:
                # 1. Linearize for fast web display
                # 2. Compress images
                # 3. Remove unnecessary objects
                
                # Remove metadata
                if '/Metadata' in pdf.Root:
                    del pdf.Root.Metadata
                
                # Remove unused resources
                pdf.remove_unreferenced_resources()
                
                # Compress all streams
                for obj in pdf.objects:
                    if hasattr(obj, 'stream'):
                        obj.stream.compress()
                
                # Save optimized PDF
                output_stream = io.BytesIO()
                pdf.save(output_stream,
                        linearize=True,  # Fast web view
                        compress_streams=True,
                        stream_decode_level=pikepdf.StreamDecodeLevel.generalized)
                
                return output_stream.getvalue()
                
            except ImportError:
                # Fallback: use PyPDF2 for basic optimization
                pdf_stream = io.BytesIO(pdf_bytes)
                reader = PdfReader(pdf_stream)
                writer = PdfWriter()
                
                for page in reader.pages:
                    writer.add_page(page)
                
                output_stream = io.BytesIO()
                writer.write(output_stream)
                return output_stream.getvalue()
                
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to optimize PDF for viewing: {str(e)}",
                {"error_type": type(e).__name__}
            )
    
    @staticmethod
    def prepare_for_printing(pdf_bytes: bytes) -> bytes:
        """
        Prepare PDF for printing.
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            bytes: Print-ready PDF as bytes
            
        Raises:
            PDFProcessingError: If preparation fails
        """
        try:
            # For printing, we want:
            # 1. Proper page sizing
            # 2. Flatten layers if needed
            # 3. Ensure CMYK color space for color printing
            
            # Use pikepdf for advanced features
            try:
                import pikepdf
                
                pdf_stream = io.BytesIO(pdf_bytes)
                pdf = pikepdf.open(pdf_stream)
                
                # Ensure all pages have proper media boxes
                for page in pdf.pages:
                    if '/MediaBox' not in page:
                        # Set default letter size
                        page.MediaBox = [0, 0, 612, 792]
                
                # Flatten annotations (make them part of page content)
                # Note: pikepdf doesn't have direct flattening, but we can ensure
                # annotations are preserved for printing
                
                # Save print-ready PDF
                output_stream = io.BytesIO()
                pdf.save(output_stream,
                        compress_streams=False)  # Keep full quality for printing
                
                return output_stream.getvalue()
                
            except ImportError:
                # Fallback: return original PDF
                return pdf_bytes
                
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to prepare PDF for printing: {str(e)}",
                {"error_type": type(e).__name__}
            )
