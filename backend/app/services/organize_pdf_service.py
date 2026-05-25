"""
Organize PDF Service - Rearrange, delete, and sort PDF pages.
"""
import io
import logging
from typing import List, Optional
from pypdf import PdfReader, PdfWriter

from app.utils import PDFProcessingError

logger = logging.getLogger(__name__)


class OrganizePDFService:
    """Service for organizing/rearranging PDF pages."""

    @staticmethod
    def organize_pdf(
        pdf_bytes: bytes,
        page_order: Optional[List[int]] = None,
        deleted_pages: Optional[List[int]] = None,
    ) -> bytes:
        """
        Reorganize PDF pages based on provided page_order and deleted_pages.

        Args:
            pdf_bytes: Original PDF file bytes
            page_order: List of 1-based page numbers in desired order.
                       If provided, pages are reordered according to this list.
            deleted_pages: List of 1-based page numbers to remove.
                          These pages are excluded from the output.

        Returns:
            bytes: Reorganized PDF as bytes

        Raises:
            PDFProcessingError: If reorganization fails
        """
        try:
            logger.info(
                f"Starting PDF organization: page_order={page_order}, "
                f"deleted_pages={deleted_pages}"
            )

            # Read the PDF
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            total_pages = len(reader.pages)
            logger.info(f"Read PDF with {total_pages} pages")

            # Determine which pages to keep (1-based)
            deleted_set = set(deleted_pages or [])

            if page_order:
                # Use the provided page order, filter out deleted pages
                pages_to_keep = [p for p in page_order if p not in deleted_set]
                logger.info(f"Using custom page order. Pages to keep: {pages_to_keep}")
            elif deleted_pages:
                # No custom order, just remove deleted pages
                pages_to_keep = [
                    i + 1 for i in range(total_pages)
                    if (i + 1) not in deleted_set
                ]
                logger.info(f"Original order minus deleted. Pages to keep: {pages_to_keep}")
            else:
                # No changes requested — return original
                pages_to_keep = list(range(1, total_pages + 1))
                logger.info(f"No changes. Keeping all {total_pages} pages")

            if not pages_to_keep:
                raise ValueError("All pages were deleted. At least one page must remain.")

            # Validate page numbers
            for p in pages_to_keep:
                if p < 1 or p > total_pages:
                    raise ValueError(
                        f"Invalid page number {p}. PDF has {total_pages} pages."
                    )

            # Create new PDF with reorganized pages
            writer = PdfWriter()
            for page_num in pages_to_keep:
                writer.add_page(reader.pages[page_num - 1])  # Convert to 0-based

            # Write output
            output_stream = io.BytesIO()
            writer.write(output_stream)
            result = output_stream.getvalue()

            output_pages = len(writer.pages)
            logger.info(
                f"PDF organized successfully. "
                f"Input: {total_pages} pages, {len(pdf_bytes)} bytes. "
                f"Output: {output_pages} pages, {len(result)} bytes"
            )

            return result

        except ValueError as ve:
            logger.error(f"Validation error: {str(ve)}")
            raise PDFProcessingError(
                str(ve),
                {"error_type": "ValidationError", "page_order": page_order, "deleted_pages": deleted_pages},
            )
        except Exception as e:
            logger.error(f"Failed to organize PDF: {str(e)}", exc_info=True)
            raise PDFProcessingError(
                f"Failed to organize PDF: {str(e)}",
                {"error_type": type(e).__name__},
            )