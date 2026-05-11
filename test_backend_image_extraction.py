#!/usr/bin/env python3
"""
Test backend endpoint for image extraction.
"""
import requests
import tempfile
from pathlib import Path
import zipfile
import os

def test_backend_image_extraction():
    """Test if backend extracts images from PDFs"""
    print("=== Testing Backend Image Extraction ===")
    
    # First, create a simple PDF with an image
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from PIL import Image, ImageDraw
    
    # Create a simple image
    img = Image.new('RGB', (100, 100), color='red')
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 80, 80], fill='blue')
    draw.text((40, 40), "TEST", fill='white')
    
    # Save image to temp file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_img:
        img_path = tmp_img.name
        img.save(img_path, 'PNG')
    
    # Create PDF with the image
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_pdf:
        pdf_path = tmp_pdf.name
        c = canvas.Canvas(pdf_path, pagesize=letter)
        c.drawImage(img_path, 100, 500, width=200, height=200)
        c.drawString(100, 300, "This is text above the image")
        c.showPage()
        c.save()
    
    try:
        # Send to backend
        url = "http://localhost:8000/api/pdf-to-word"
        
        with open(pdf_path, 'rb') as f:
            files = {'file': ('test_image.pdf', f, 'application/pdf')}
            
            print("Sending PDF with image to backend...")
            response = requests.post(url, files=files, timeout=30)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                # Save the DOCX
                output_path = Path("test_image_output.docx")
                with open(output_path, 'wb') as out_f:
                    out_f.write(response.content)
                
                print(f"DOCX saved: {output_path} ({len(response.content)} bytes)")
                
                # Analyze the DOCX
                with zipfile.ZipFile(output_path, 'r') as zipf:
                    # List all files
                    all_files = zipf.namelist()
                    print(f"\nTotal files in DOCX: {len(all_files)}")
                    
                    # Find image files
                    image_files = [f for f in all_files if 'media' in f and f.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
                    print(f"Images found: {len(image_files)}")
                    for img_file in image_files:
                        info = zipf.getinfo(img_file)
                        print(f"  - {img_file} ({info.file_size} bytes)")
                    
                    # Check document.xml for image references
                    if 'word/document.xml' in all_files:
                        with zipf.open('word/document.xml') as f:
                            content = f.read().decode('utf-8', errors='ignore')
                            
                            # Count image references
                            import re
                            drawing_refs = len(re.findall(r'<wp:docPr', content))
                            blip_refs = len(re.findall(r'<a:blip', content))
                            embed_refs = len(re.findall(r'r:embed="[^"]+"', content))
                            
                            print(f"\nDocument XML analysis:")
                            print(f"  Drawing references: {drawing_refs}")
                            print(f"  Blip references: {blip_refs}")
                            print(f"  Embed references: {embed_refs}")
                            
                            # Look for specific patterns
                            if blip_refs > 0:
                                # Extract r:embed values
                                embeds = re.findall(r'r:embed="([^"]+)"', content)
                                print(f"  Embed IDs: {embeds}")
                                
                                # Check relationships
                                if 'word/_rels/document.xml.rels' in all_files:
                                    with zipf.open('word/_rels/document.xml.rels') as rels_f:
                                        rels_content = rels_f.read().decode('utf-8', errors='ignore')
                                        for embed_id in embeds:
                                            pattern = f'Id="{embed_id}"[^>]*Target="([^"]+)"'
                                            matches = re.findall(pattern, rels_content)
                                            for match in matches:
                                                print(f"    - {embed_id} -> {match}")
                    
                    # List first 20 files to see structure
                    print(f"\nFirst 20 files in DOCX:")
                    for file in all_files[:20]:
                        print(f"  {file}")
                
                return len(image_files) > 0
            else:
                print(f"Error: {response.status_code} - {response.text[:200]}")
                return False
                
    finally:
        # Cleanup
        try:
            os.unlink(img_path)
            os.unlink(pdf_path)
        except:
            pass

if __name__ == "__main__":
    success = test_backend_image_extraction()
    print(f"\n=== RESULT: Backend {'DID' if success else 'DID NOT'} extract images ===")