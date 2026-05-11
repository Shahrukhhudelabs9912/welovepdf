#!/usr/bin/env python3
"""
Test to understand why images aren't being extracted from complex PDFs.
"""
import io
import zipfile
import tempfile
from pathlib import Path
import PyPDF2
import pdfplumber
import fitz  # PyMuPDF
from pdf2docx import Converter

def test_pdf2docx_image_extraction():
    """Test pdf2docx image extraction capabilities"""
    print("=== Testing pdf2docx Image Extraction ===")
    
    # Create a test PDF with an image using reportlab
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import ImageReader
    import os
    
    # Create a simple image for testing
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (100, 100), color='red')
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 80, 80], fill='blue')
    draw.text((40, 40), "TEST", fill='white')
    
    # Save image to temp file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_img:
        img.save(tmp_img.name, 'PNG')
        img_path = tmp_img.name
    
    # Create PDF with the image
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_pdf:
        pdf_path = tmp_pdf.name
        c = canvas.Canvas(pdf_path, pagesize=letter)
        c.drawImage(img_path, 100, 500, width=200, height=200)
        c.drawString(100, 300, "This is text above the image")
        c.showPage()
        c.save()
    
    docx_path = None
    try:
        # Convert with pdf2docx
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp_docx:
            docx_path = tmp_docx.name
        
        cv = Converter(pdf_path)
        cv.convert(docx_path, multi_processing=False)
        cv.close()
        
        # Check if DOCX contains images
        with zipfile.ZipFile(docx_path, 'r') as zipf:
            image_files = [f for f in zipf.namelist() if 'media' in f and f.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
            print(f"pdf2docx created DOCX with {len(image_files)} images")
            for img_file in image_files:
                print(f"  - {img_file}")
        
        # Also check with PyMuPDF
        print("\n=== Checking PDF with PyMuPDF ===")
        pdf_doc = fitz.open(pdf_path)
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            images = page.get_images()
            print(f"Page {page_num + 1}: {len(images)} images found by PyMuPDF")
            for img_index, img_info in enumerate(images):
                print(f"  Image {img_index + 1}: xref={img_info[0]}, width={img_info[2]}, height={img_info[3]}")
        pdf_doc.close()
        
        # Check with pdfplumber
        print("\n=== Checking PDF with pdfplumber ===")
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                images = page.images
                print(f"Page {page_num + 1}: {len(images)} images found by pdfplumber")
                for img_index, img in enumerate(images):
                    print(f"  Image {img_index + 1}: x0={img['x0']}, y0={img['y0']}, width={img['width']}, height={img['height']}")
        
    finally:
        # Cleanup - close any open file handles first
        import time
        time.sleep(0.1)  # Give time for file handles to close
        try:
            os.unlink(img_path)
        except:
            pass
        try:
            os.unlink(pdf_path)
        except:
            pass
        if docx_path:
            try:
                os.unlink(docx_path)
            except:
                pass

def test_complex_pdf_image_extraction():
    """Test image extraction from the complex test PDF"""
    print("\n=== Testing Complex PDF Image Extraction ===")
    
    # Create complex PDF with tables and images
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image as RLImage
    from reportlab.lib import colors
    from PIL import Image, ImageDraw
    import os
    
    # Create test image
    img = Image.new('RGB', (150, 100), color='green')
    draw = ImageDraw.Draw(img)
    draw.rectangle([30, 20, 120, 80], fill='yellow')
    draw.text((60, 50), "CHART", fill='black')
    
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_img:
        img.save(tmp_img.name, 'PNG')
        img_path = tmp_img.name
    
    # Create PDF with complex content
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_pdf:
        pdf_path = tmp_pdf.name
        
        # Use SimpleDocTemplate for better control
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        elements = []
        
        # Add title
        from reportlab.platypus import Paragraph
        from reportlab.lib.styles import getSampleStyleSheet
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Complex PDF with Images and Tables", styles['Title']))
        
        # Add image
        elements.append(RLImage(img_path, width=200, height=133))
        
        # Add table
        data = [
            ['Product', 'Q1', 'Q2', 'Q3', 'Q4'],
            ['Widget A', '100', '150', '200', '250'],
            ['Widget B', '80', '120', '160', '200'],
            ['Widget C', '50', '75', '100', '125']
        ]
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        
        # Build PDF
        doc.build(elements)
    
    docx_path = None
    try:
        # Check with PyMuPDF
        print("\nChecking complex PDF with PyMuPDF:")
        pdf_doc = fitz.open(pdf_path)
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            images = page.get_images()
            print(f"Page {page_num + 1}: {len(images)} images found")
            for img_index, img_info in enumerate(images):
                print(f"  Image {img_index + 1}: xref={img_info[0]}")
        pdf_doc.close()
        
        # Convert with pdf2docx
        print("\nConverting complex PDF with pdf2docx:")
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp_docx:
            docx_path = tmp_docx.name
        
        cv = Converter(pdf_path)
        cv.convert(docx_path, multi_processing=False)
        cv.close()
        
        # Check DOCX for images
        with zipfile.ZipFile(docx_path, 'r') as zipf:
            image_files = [f for f in zipf.namelist() if 'media' in f and f.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
            print(f"pdf2docx created DOCX with {len(image_files)} images")
            for img_file in image_files:
                print(f"  - {img_file}")
                
        # Also list all files in DOCX to understand structure
        print("\nAll files in DOCX:")
        with zipfile.ZipFile(docx_path, 'r') as zipf:
            for file in zipf.namelist()[:20]:  # First 20 files
                print(f"  {file}")
        
    finally:
        # Cleanup
        import time
        time.sleep(0.1)
        try:
            os.unlink(img_path)
        except:
            pass
        try:
            os.unlink(pdf_path)
        except:
            pass
        if docx_path:
            try:
                os.unlink(docx_path)
            except:
                pass

if __name__ == "__main__":
    test_pdf2docx_image_extraction()
    test_complex_pdf_image_extraction()