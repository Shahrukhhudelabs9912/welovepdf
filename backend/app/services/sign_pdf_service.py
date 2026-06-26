"""Stamp a signature image onto one or more positions in a PDF.

Coordinates from the frontend are normalized (0..1) relative to the rendered
page; we convert to PDF points here based on the actual page mediabox.
"""
from __future__ import annotations

import io
import tempfile
import os
from typing import Iterable, List, Tuple

from app.utils import PDFProcessingError


Placement = Tuple[int, float, float, float, float]


class SignPdfService:
    @staticmethod
    def sign_pdf(
        pdf_bytes: bytes,
        signature_png_bytes: bytes,
        placements: Iterable[Placement],
    ) -> bytes:
        """Stamp the signature at every (page_index, x, y, w, h) in
        `placements`. Ratios are 0..1; origin top-left (matches DOM coords).
        """
        try:
            from pypdf import PdfReader, PdfWriter
            from reportlab.pdfgen import canvas as rl_canvas
            from PIL import Image
        except ImportError as e:
            raise PDFProcessingError(f"Missing dependency: {e}")

        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
        except Exception as e:
            raise PDFProcessingError(f"Could not read PDF: {e}")

        total = len(reader.pages)
        if total == 0:
            raise PDFProcessingError("PDF has no pages.")

        placements_list: List[Placement] = list(placements)
        if not placements_list:
            raise PDFProcessingError("No signature placements provided.")

        by_page: dict[int, List[Tuple[float, float, float, float]]] = {}
        for page_index, x_ratio, y_ratio, w_ratio, h_ratio in placements_list:
            if not (0 <= page_index < total):
                raise PDFProcessingError(
                    f"page_index {page_index} out of bounds (PDF has {total} pages)."
                )
            for name, val in (
                ("x", x_ratio), ("y", y_ratio),
                ("width", w_ratio), ("height", h_ratio),
            ):
                if not (0 <= val <= 1):
                    raise PDFProcessingError(f"{name} must be between 0 and 1.")
            by_page.setdefault(page_index, []).append(
                (x_ratio, y_ratio, w_ratio, h_ratio)
            )

        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                tmp.write(signature_png_bytes)
                tmp_path = tmp.name

            try:
                Image.open(tmp_path).verify()
            except Exception as e:
                raise PDFProcessingError(f"Signature image is not a valid PNG/JPG: {e}")

            overlay_pages: dict[int, object] = {}
            for page_index, rects in by_page.items():
                target_page = reader.pages[page_index]
                page_w = float(target_page.mediabox.width)
                page_h = float(target_page.mediabox.height)

                overlay_buf = io.BytesIO()
                c = rl_canvas.Canvas(overlay_buf, pagesize=(page_w, page_h))
                for x_ratio, y_ratio, w_ratio, h_ratio in rects:
                    sig_w = w_ratio * page_w
                    sig_h = h_ratio * page_h
                    x = x_ratio * page_w
                    y = page_h - (y_ratio * page_h) - sig_h
                    c.drawImage(tmp_path, x, y, width=sig_w, height=sig_h, mask="auto")
                c.showPage()
                c.save()
                overlay_buf.seek(0)

                overlay_pages[page_index] = PdfReader(overlay_buf).pages[0]

            writer = PdfWriter()
            for i, page in enumerate(reader.pages):
                if i in overlay_pages:
                    page.merge_page(overlay_pages[i])
                writer.add_page(page)

            out = io.BytesIO()
            writer.write(out)
            return out.getvalue()
        finally:
            if tmp_path:
                try:
                    os.unlink(tmp_path)
                except OSError:
                    pass
