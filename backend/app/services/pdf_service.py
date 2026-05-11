"""
PDF processing services using PyPDF2 and other libraries.
"""
import io
import zipfile
from typing import List, Tuple
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image
import tempfile
import os

from app.utils import PDFProcessingError


class PDFService:
    """Service for PDF processing operations."""
    
    @staticmethod
    def merge_pdfs(pdf_files: List[bytes]) -> bytes:
        """
        Merge multiple PDF files into a single PDF.
        
        Args:
            pdf_files: List of PDF file bytes
            
        Returns:
            bytes: Merged PDF as bytes
            
        Raises:
            PDFProcessingError: If merging fails
        """
        try:
            merger = PdfMerger()
            
            for pdf_bytes in pdf_files:
                pdf_stream = io.BytesIO(pdf_bytes)
                merger.append(pdf_stream)
            
            output_stream = io.BytesIO()
            merger.write(output_stream)
            merger.close()
            
            return output_stream.getvalue()
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to merge PDFs: {str(e)}",
                {"error_type": type(e).__name__}
            )
    
    @staticmethod
    def split_pdf(pdf_bytes: bytes) -> List[Tuple[str, bytes]]:
        """
        Split a PDF into individual pages.
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            List of (filename, page_bytes) tuples
            
        Raises:
            PDFProcessingError: If splitting fails
        """
        try:
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            
            pages = []
            for i, page in enumerate(reader.pages):
                writer = PdfWriter()
                writer.add_page(page)
                
                page_stream = io.BytesIO()
                writer.write(page_stream)
                page_bytes = page_stream.getvalue()
                
                filename = f"page_{i + 1}.pdf"
                pages.append((filename, page_bytes))
            
            return pages
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to split PDF: {str(e)}",
                {"error_type": type(e).__name__}
            )
    
    @staticmethod
    def rotate_pdf(pdf_bytes: bytes, angle: int) -> bytes:
        """
        Rotate all pages of a PDF by specified angle.
        
        Args:
            pdf_bytes: PDF file bytes
            angle: Rotation angle (90, 180, or 270)
            
        Returns:
            bytes: Rotated PDF as bytes
            
        Raises:
            PDFProcessingError: If rotation fails
        """
        if angle not in [90, 180, 270]:
            raise PDFProcessingError(
                f"Invalid rotation angle: {angle}. Must be 90, 180, or 270.",
                {"angle": angle}
            )
        
        try:
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            writer = PdfWriter()
            
            for page in reader.pages:
                rotated_page = page
                rotated_page.rotate(angle)
                writer.add_page(rotated_page)
            
            output_stream = io.BytesIO()
            writer.write(output_stream)
            return output_stream.getvalue()
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to rotate PDF: {str(e)}",
                {"error_type": type(e).__name__, "angle": angle}
            )
    
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
            
            for i, page in enumerate(reader.pages):
                if i in page_indices:
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


class ImageToPDFService:
    """Service for image to PDF conversion."""
    
    @staticmethod
    def convert_images_to_pdf(image_files: List[bytes]) -> bytes:
        """
        Convert multiple images to a single PDF.
        
        Args:
            image_files: List of image file bytes
            
        Returns:
            bytes: PDF containing all images
            
        Raises:
            PDFProcessingError: If conversion fails
        """
        try:
            # Create temporary directory for images
            with tempfile.TemporaryDirectory() as temp_dir:
                images = []
                
                for i, img_bytes in enumerate(image_files):
                    img_stream = io.BytesIO(img_bytes)
                    img = Image.open(img_stream)
                    
                    # Convert to RGB if necessary
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    
                    # Save as temporary file
                    temp_path = os.path.join(temp_dir, f"image_{i}.jpg")
                    img.save(temp_path, "JPEG", quality=95)
                    images.append(temp_path)
                
                # Create PDF from images
                output_stream = io.BytesIO()
                
                if images:
                    # Convert first image to PDF
                    first_img = Image.open(images[0])
                    first_img.save(output_stream, "PDF", resolution=100.0)
                    
                    # Append remaining images
                    for img_path in images[1:]:
                        img = Image.open(img_path)
                        img.save(output_stream, "PDF", resolution=100.0, append=True)
                
                return output_stream.getvalue()
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to convert images to PDF: {str(e)}",
                {"error_type": type(e).__name__, "image_count": len(image_files)}
            )


class PDFToImageService:
    """Service for PDF to image conversion."""
    
    @staticmethod
    def convert_pdf_to_image(pdf_bytes: bytes, page_number: int = 0, quality: int = 85, dpi: int = 150) -> bytes:
        """
        Convert a PDF page to JPEG image.
        
        Args:
            pdf_bytes: PDF file bytes
            page_number: Page number to convert (0-indexed)
            quality: Image quality (1-100%)
            dpi: Image resolution in DPI
            
        Returns:
            bytes: JPEG image as bytes
            
        Raises:
            PDFProcessingError: If conversion fails
        """
        try:
            # Try to use pdf2image if available
            try:
                from pdf2image import convert_from_bytes
                from app.config import settings
                
                # Use poppler path from settings if available
                poppler_path = None
                print(f"[PDFToImageService] Checking settings.POPPLER_PATH: {hasattr(settings, 'POPPLER_PATH')}")
                if hasattr(settings, 'POPPLER_PATH'):
                    print(f"[PDFToImageService] settings.POPPLER_PATH value: {settings.POPPLER_PATH}")
                    if settings.POPPLER_PATH:
                        poppler_path = settings.POPPLER_PATH
                        print(f"[PDFToImageService] Using poppler path: {poppler_path}")
                    else:
                        print(f"[PDFToImageService] POPPLER_PATH is empty or None")
                else:
                    print(f"[PDFToImageService] POPPLER_PATH attribute not found in settings")
                
                try:
                    print(f"[PDFToImageService] Calling convert_from_bytes with poppler_path={poppler_path}")
                    images = convert_from_bytes(
                        pdf_bytes,
                        first_page=page_number + 1,
                        last_page=page_number + 1,
                        dpi=dpi,
                        poppler_path=poppler_path
                    )
                    
                    if images:
                        img_stream = io.BytesIO()
                        images[0].save(img_stream, format="JPEG", quality=quality)
                        return img_stream.getvalue()
                    else:
                        raise PDFProcessingError(
                            "No images generated from PDF",
                            {"page_number": page_number, "quality": quality, "dpi": dpi}
                        )
                except Exception as e:
                    print(f"[PDFToImageService] convert_from_bytes failed: {e}")
                    print(f"[PDFToImageService] poppler_path type: {type(poppler_path)}, value: {poppler_path}")
                    # Re-raise the exception
                    raise
            except ImportError:
                # Fallback to PyPDF2 and reportlab for basic conversion
                pdf_stream = io.BytesIO(pdf_bytes)
                reader = PdfReader(pdf_stream)
                
                if page_number >= len(reader.pages):
                    raise PDFProcessingError(
                        f"Page number {page_number + 1} out of range. PDF has {len(reader.pages)} pages.",
                        {"page_number": page_number, "total_pages": len(reader.pages)}
                    )
                
                # Create a simple image representation
                # This is a basic fallback - in production, pdf2image should be installed
                img_stream = io.BytesIO()
                img = Image.new('RGB', (800, 600), color='white')
                img.save(img_stream, format="JPEG", quality=quality)
                return img_stream.getvalue()
                
        except Exception as e:
            raise PDFProcessingError(
                f"Failed to convert PDF to image: {str(e)}",
                {"error_type": type(e).__name__, "page_number": page_number, "quality": quality, "dpi": dpi}
            )


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