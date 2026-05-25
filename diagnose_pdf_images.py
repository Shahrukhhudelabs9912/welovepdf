#!/usr/bin/env python3
"""Diagnose: inspect PDF structure to see how images are embedded."""
import io, os, tempfile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from PIL import Image, ImageDraw
import numpy as np

# Create the same test PDF
temp_dir = tempfile.mkdtemp()

def make_gradient_image(size, colors):
    w, h = size
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        ratio = y / h
        r = int(colors[0][0] * (1 - ratio) + colors[1][0] * ratio)
        g = int(colors[0][1] * (1 - ratio) + colors[1][1] * ratio)
        b = int(colors[0][2] * (1 - ratio) + colors[1][2] * ratio)
        arr[y, :] = [r, g, b]
    return Image.fromarray(arr)

img1 = make_gradient_image((2048, 1536), ((20, 60, 120), (200, 180, 50)))
img1_path = os.path.join(temp_dir, "img1.jpg")
img1.save(img1_path, "JPEG", quality=95)

buf = io.BytesIO()
c = canvas.Canvas(buf, pagesize=letter)
c.drawString(100, 750, "Page 1 - Gradient Sky")
c.drawImage(img1_path, 50, 100, width=500, height=375)
c.showPage()
c.save()
buf.seek(0)

os.remove(img1_path)
os.rmdir(temp_dir)

# Now inspect with pikepdf
import pikepdf
pdf = pikepdf.open(buf)

for page_num, page in enumerate(pdf.pages):
    print(f"Page {page_num + 1}:")
    print(f"  Keys: {list(page.keys())}")
    if "/Resources" in page:
        resources = page.Resources
        print(f"  Resources keys: {list(resources.keys())}")
        if "/XObject" in resources:
            xobjects = resources.XObject
            print(f"  XObject count: {len(list(xobjects.keys()))}")
            for name in list(xobjects.keys()):
                xobj = xobjects[name]
                print(f"    {name}:")
                print(f"      Type: {xobj.get('/Type')}")
                print(f"      Subtype: {xobj.get('/Subtype')}")
                print(f"      Filter: {xobj.get('/Filter')}")
                print(f"      Width: {xobj.get('/Width')}")
                print(f"      Height: {xobj.get('/Height')}")
                print(f"      BitsPerComponent: {xobj.get('/BitsPerComponent')}")
                print(f"      ColorSpace: {xobj.get('/ColorSpace')}")
                raw = xobj.read_raw_bytes()
                print(f"      Stream length: {len(raw)}")
                # Try opening with PIL
                try:
                    img = Image.open(io.BytesIO(raw))
                    print(f"      PIL mode: {img.mode}, size: {img.size}")
                    # Recompress test
                    jpg_buf = io.BytesIO()
                    img.convert("RGB").save(jpg_buf, format="JPEG", quality=40, optimize=True)
                    jpg_len = len(jpg_buf.getvalue())
                    print(f"      Recompressed Q40: {jpg_len} bytes ({jpg_len/len(raw)*100:.1f}% of original)")
                    jpg_buf = io.BytesIO()
                    img.convert("RGB").save(jpg_buf, format="JPEG", quality=70, optimize=True)
                    jpg_len = len(jpg_buf.getvalue())
                    print(f"      Recompressed Q70: {jpg_len} bytes ({jpg_len/len(raw)*100:.1f}% of original)")
                except Exception as e:
                    print(f"      PIL error: {e}")
        else:
            print("  No XObject in Resources")
    else:
        print("  No Resources")
    print()

pdf.close()
print("Done.")