#!/usr/bin/env python3
"""Test: import PDFService._recompress_images_in_pdf and test it directly."""
import sys, os, io, tempfile

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from PIL import Image
import numpy as np
import pikepdf

temp_dir = tempfile.mkdtemp()

def make_gradient(size, colors):
    w, h = size
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        ratio = y / h
        r = int(colors[0][0] * (1 - ratio) + colors[1][0] * ratio)
        g = int(colors[0][1] * (1 - ratio) + colors[1][1] * ratio)
        b = int(colors[0][2] * (1 - ratio) + colors[1][2] * ratio)
        arr[y, :] = [r, g, b]
    return Image.fromarray(arr)

img = make_gradient((2048, 1536), ((20, 60, 120), (200, 180, 50)))
img_path = os.path.join(temp_dir, "img.jpg")
img.save(img_path, "JPEG", quality=95)

buf = io.BytesIO()
c = canvas.Canvas(buf, pagesize=letter)
c.drawImage(img_path, 50, 100, width=500, height=375)
c.showPage()
c.save()
buf.seek(0)
os.remove(img_path)
os.rmdir(temp_dir)

input_pdf = buf.getvalue()
print(f"Input PDF: {len(input_pdf)} bytes")

# Now test _recompress_images_in_pdf DIRECTLY
from app.services.pdf_service import PDFService

# Save to temp file (mimics the service's approach)
with tempfile.TemporaryDirectory(prefix="test_direct_") as td:
    tdp = __import__('pathlib').Path(td)
    inp = tdp / "input.pdf"
    outp = tdp / "output.pdf"
    inp.write_bytes(input_pdf)
    
    pdf = pikepdf.open(str(inp))
    print(f"\nCalling _recompress_images_in_pdf with compression_level='high'...")
    images_processed = PDFService._recompress_images_in_pdf(pdf, "high")
    print(f"Images processed: {images_processed}")
    
    pdf.save(str(outp), compress_streams=True)
    pdf.close()
    
    result = outp.read_bytes()
    print(f"Output PDF: {len(result)} bytes")
    print(f"Reduction: {(1 - len(result)/len(input_pdf))*100:.1f}%")

print("\nNow testing with 'medium'...")
with tempfile.TemporaryDirectory(prefix="test_direct_") as td:
    tdp = __import__('pathlib').Path(td)
    inp = tdp / "input.pdf"
    outp = tdp / "output.pdf"
    inp.write_bytes(input_pdf)
    
    pdf = pikepdf.open(str(inp))
    images_processed = PDFService._recompress_images_in_pdf(pdf, "medium")
    print(f"Images processed: {images_processed}")
    
    pdf.save(str(outp), compress_streams=True)
    pdf.close()
    
    result = outp.read_bytes()
    print(f"Output PDF: {len(result)} bytes")
    print(f"Reduction: {(1 - len(result)/len(input_pdf))*100:.1f}%")

print("\nNow testing with 'low'...")
with tempfile.TemporaryDirectory(prefix="test_direct_") as td:
    tdp = __import__('pathlib').Path(td)
    inp = tdp / "input.pdf"
    outp = tdp / "output.pdf"
    inp.write_bytes(input_pdf)
    
    pdf = pikepdf.open(str(inp))
    images_processed = PDFService._recompress_images_in_pdf(pdf, "low")
    print(f"Images processed: {images_processed}")
    
    pdf.save(str(outp), compress_streams=True)
    pdf.close()
    
    result = outp.read_bytes()
    print(f"Output PDF: {len(result)} bytes")
    print(f"Reduction: {(1 - len(result)/len(input_pdf))*100:.1f}%")

print("\nDone.")