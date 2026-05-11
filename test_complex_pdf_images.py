#!/usr/bin/env python3
"""
Test to check if the complex test PDF actually contains extractable images.
"""
import os
import tempfile
from pathlib import Path
import fitz  # PyMuPDF
import pdfplumber
import zipfile

def check_complex_pdf_for_images():
    """Check if the complex test PDF contains images"""
    print("=== Checking Complex Test PDF for Images ===")
    
    # First, create the complex PDF
    from test_complex_pdf_conversion import create_complex_test_pdf
    pdf_path, temp_dir = create_complex_test_pdf()
    
    if not pdf_path:
        print("Failed to create test PDF")
        return False
    
    # Read the PDF bytes
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    
    try:
        # Check with PyMuPDF
        print("\n1. Checking with PyMuPDF (fitz):")
        pdf_doc = fitz.open(pdf_path)
        total_images = 0
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            images = page.get_images()
            print(f"  Page {page_num + 1}: {len(images)} images found")
            total_images += len(images)
            
            for img_index, img_info in enumerate(images):
                xref = img_info[0]
                width = img_info[2]
                height = img_info[3]
                print(f"    Image {img_index + 1}: xref={xref}, width={width}, height={height}")
                
                # Try to extract the image
                try:
                    img_xref = img_info[0]
                    base_image = pdf_doc.extract_image(img_xref)
                    if base_image:
                        print(f"      Extracted: {len(base_image.get('image', ''))} bytes, format: {base_image.get('ext', 'unknown')}")
                except Exception as e:
                    print(f"      Extraction failed: {e}")
        
        pdf_doc.close()
        print(f"\n  Total images found by PyMuPDF: {total_images}")
        
        # Check with pdfplumber
        print("\n2. Checking with pdfplumber:")
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                images = page.images
                print(f"  Page {page_num + 1}: {len(images)} images found")
                for img_index, img in enumerate(images):
                    print(f"    Image {img_index + 1}: x0={img['x0']}, y0={img['y0']}, width={img['width']}, height={img['height']}")
        
        # Now convert with pdf2docx and check
        print("\n3. Converting with pdf2docx and checking output:")
        from pdf2docx import Converter
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp_docx:
            docx_path = tmp_docx.name
        
        cv = Converter(pdf_path)
        cv.convert(docx_path, multi_processing=False)
        cv.close()
        
        # Check DOCX for images
        with zipfile.ZipFile(docx_path, 'r') as zipf:
            image_files = [f for f in zipf.namelist() if 'media' in f and f.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
            print(f"  pdf2docx created DOCX with {len(image_files)} images")
            for img_file in image_files:
                print(f"    - {img_file}")
                
            # Also check document.xml for image references
            if 'word/document.xml' in zipf.namelist():
                with zipf.open('word/document.xml') as f:
                    content = f.read().decode('utf-8', errors='ignore')
                    # Count image references
                    import re
                    drawing_refs = len(re.findall(r'<wp:docPr', content))
                    blip_refs = len(re.findall(r'<a:blip', content))
                    print(f"  Document XML contains {drawing_refs} drawing references and {blip_refs} blip references")
        
        return total_images > 0
        
    finally:
        # Cleanup
        import shutil
        try:
            if 'docx_path' in locals():
                os.unlink(docx_path)
        except:
            pass
        # The temp directory will be cleaned up by the test_complex_pdf_conversion function

if __name__ == "__main__":
    has_images = check_complex_pdf_for_images()
    print(f"\n=== RESULT: Complex test PDF {'DOES contain' if has_images else 'DOES NOT contain'} extractable images ===")