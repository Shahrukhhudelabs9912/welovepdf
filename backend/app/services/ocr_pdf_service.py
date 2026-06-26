"""OCR a scanned PDF to make it searchable.

Uses ocrmypdf which orchestrates Ghostscript + Tesseract under the hood.
Returns a new PDF with an invisible text layer mapped to the visible
glyphs — same approach iLovePDF / SmallPDF use.

System prerequisites (must be on PATH):
- Ghostscript (gswin64c.exe on Windows, gs on Linux)
- Tesseract (already used by pdf-to-word OCR fallback)
"""
from __future__ import annotations

import io
import asyncio

from app.utils import PDFProcessingError


SUPPORTED_LANGUAGES = {"eng", "hin"}


def _ocr_blocking(pdf_bytes: bytes, language: str) -> bytes:
    try:
        import ocrmypdf
    except ImportError as e:
        raise PDFProcessingError(
            f"ocrmypdf is not installed on the server ({e}). Run: pip install ocrmypdf"
        )

    if language not in SUPPORTED_LANGUAGES:
        raise PDFProcessingError(
            f"Unsupported OCR language '{language}'. Supported: {sorted(SUPPORTED_LANGUAGES)}"
        )

    in_buf = io.BytesIO(pdf_bytes)
    out_buf = io.BytesIO()
    try:
        ocrmypdf.ocr(
            in_buf,
            out_buf,
            language=language,
            # skip_text: keep pages that already have a text layer untouched
            # instead of erroring out — matches user expectation when mixed PDFs come in.
            skip_text=True,
            # Faster than default; image preprocessing for typical scans.
            optimize=1,
            progress_bar=False,
        )
    except Exception as e:
        msg = str(e)
        # Ghostscript missing is the most common failure mode on Windows.
        if "ghostscript" in msg.lower() or "gswin" in msg.lower():
            raise PDFProcessingError(
                "Ghostscript is not installed or not on PATH. "
                "Install from https://ghostscript.com/releases/gsdnld.html"
            )
        raise PDFProcessingError(f"OCR failed: {msg}")

    return out_buf.getvalue()


class OcrPdfService:
    @staticmethod
    async def ocr_pdf(pdf_bytes: bytes, language: str = "eng") -> bytes:
        """Run OCR on a PDF and return a searchable PDF (async wrapper)."""
        return await asyncio.to_thread(_ocr_blocking, pdf_bytes, language)
