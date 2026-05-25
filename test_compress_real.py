#!/usr/bin/env python3
"""Test: compress with all 3 levels, verify sizes differ on realistic images."""
import requests, io, os, tempfile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from PIL import Image, ImageDraw
import numpy as np

print("Creating test PDF with realistic images...")
temp_dir = tempfile.mkdtemp()

# Create a colorful gradient image (compresses very well with JPEG)
def make_gradient_image(size, colors):
    """Create a gradient image that JPEG can compress well."""
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

img2 = make_gradient_image((1600, 1200), ((120, 30, 80), (50, 200, 180)))
img2_path = os.path.join(temp_dir, "img2.jpg")
img2.save(img2_path, "JPEG", quality=95)

# Build PDF with images
buf = io.BytesIO()
c = canvas.Canvas(buf, pagesize=letter)
c.drawString(100, 750, "Page 1 - Gradient Sky")
c.drawImage(img1_path, 50, 100, width=500, height=375)
c.showPage()
c.drawString(100, 750, "Page 2 - Gradient Ocean")
c.drawImage(img2_path, 50, 100, width=450, height=337)
c.showPage()
c.save()
buf.seek(0)
pdf_bytes = buf.getvalue()

# Cleanup temp images
os.remove(img1_path)
os.remove(img2_path)
os.rmdir(temp_dir)

print(f"Original: {len(pdf_bytes):>8} bytes ({len(pdf_bytes)/1024:6.1f} KB)\n")

results = {}
for level in ["low", "medium", "high"]:
    r = requests.post(
        "http://localhost:8000/api/compress-pdf",
        files={"file": ("test.pdf", pdf_bytes, "application/pdf")},
        data={"compressionLevel": level},
        timeout=60,
    )
    results[level] = len(r.content)
    reduction = (1 - len(r.content) / len(pdf_bytes)) * 100
    print(f"  {level:>6}: {len(r.content):>8} bytes ({len(r.content)/1024:6.1f} KB) | -{reduction:.1f}% | HTTP {r.status_code}")

print()
# Verify: medium should be smaller than low, high smaller than medium
if results["high"] < results["medium"] < results["low"]:
    print(f"[PASS] Compression levels produce measurably different sizes")
    print(f"       low→medium: -{(1 - results['medium']/results['low'])*100:.1f}%")
    print(f"       medium→high: -{(1 - results['high']/results['medium'])*100:.1f}%")
elif results["high"] < results["low"] and results["medium"] < results["low"]:
    print(f"[WARN] Both medium & high are smaller than low, but medium not > high")
    print(f"       low={results['low']}, medium={results['medium']}, high={results['high']}")
else:
    print(f"[FAIL] low={results['low']}, medium={results['medium']}, high={results['high']}")

# Test consecutive calls (no crashes)
print()
all_ok = True
for i in range(3):
    r = requests.post(
        "http://localhost:8000/api/compress-pdf",
        files={"file": ("test.pdf", pdf_bytes, "application/pdf")},
        data={"compressionLevel": "medium"},
        timeout=60,
    )
    ok = r.status_code == 200
    all_ok = all_ok and ok
    status = "OK" if ok else f"FAIL({r.status_code})"
    print(f"  Run {i+1}: HTTP {r.status_code} {status} ({len(r.content)} bytes)")

if all_ok:
    print("[PASS] Consecutive compressions stable")
else:
    print("[FAIL] Some runs returned errors")
print("Done.")