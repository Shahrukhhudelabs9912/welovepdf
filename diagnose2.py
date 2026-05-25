#!/usr/bin/env python3
"""Test pikepdf image decoding directly."""
import io, os, tempfile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from PIL import Image
import numpy as np
import pikepdf

# Create gradient test PDF
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
c.drawString(100, 750, "Page 1")
c.drawImage(img_path, 50, 100, width=500, height=375)
c.showPage()
c.save()
buf.seek(0)

os.remove(img_path)
os.rmdir(temp_dir)

# Now test with pikepdf
pdf = pikepdf.open(buf)

for page in pdf.pages:
    if "/Resources" in page and "/XObject" in page.Resources:
        for name, xobj in page.Resources.XObject.items():
            if xobj.get("/Subtype") == pikepdf.Name("/Image"):
                print(f"Found image: {name}")
                print(f"  Filter: {xobj.get('/Filter')}")
                print(f"  Width={xobj.Width}, Height={xobj.Height}")
                
                raw = xobj.read_raw_bytes()
                print(f"  raw_bytes len: {len(raw)}")
                
                try:
                    decoded = xobj.read_bytes()
                    print(f"  read_bytes() len: {len(decoded)} (decoded)")
                    expected = int(xobj.Width) * int(xobj.Height) * 3
                    print(f"  Expected RGB: {expected}")
                    
                    # Try making PIL image from decoded bytes
                    pil_img = Image.frombytes("RGB", (int(xobj.Width), int(xobj.Height)), decoded)
                    print(f"  PIL from decoded: OK, size={pil_img.size}, mode={pil_img.mode}")
                    
                    # Recompress
                    jpg_buf = io.BytesIO()
                    pil_img.save(jpg_buf, format="JPEG", quality=40, optimize=True)
                    jpg_data = jpg_buf.getvalue()
                    print(f"  Recompressed Q40: {len(jpg_data)} bytes (vs raw {len(raw)})")
                    
                    # Actually replace
                    old_size = len(raw)
                    xobj.write(jpg_data, pikepdf.Stream())
                    xobj.Filter = pikepdf.Array([pikepdf.Name.DCTDecode])
                    xobj.Width = pikepdf.Integer(pil_img.width)
                    xobj.Height = pikepdf.Integer(pil_img.height)
                    xobj.BitsPerComponent = pikepdf.Integer(8)
                    xobj.ColorSpace = pikepdf.Name.DeviceRGB
                    print(f"  Replaced! Stream should be smaller now.")
                    
                except Exception as e:
                    print(f"  read_bytes() FAILED: {e}")
                    
                    # Try PIL on raw
                    try:
                        pil_img = Image.open(io.BytesIO(raw))
                        print(f"  PIL from raw: OK, size={pil_img.size}")
                    except Exception as e2:
                        print(f"  PIL from raw FAILED: {e2}")

# Save and check size
out = io.BytesIO()
pdf.save(out, compress_streams=True)
pdf.close()
print(f"\nOutput PDF size: {len(out.getvalue())} bytes")
print(f"Input PDF size:  {len(buf.getvalue())} bytes")
print(f"Reduction: {(1 - len(out.getvalue())/len(buf.getvalue()))*100:.1f}%")