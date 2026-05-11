#!/usr/bin/env python3
"""
Test to see if backend is using pdf2docx or falling back.
"""
import requests
import tempfile
from pathlib import Path
import os

def test_backend_with_verbose_logging():
    """Test backend with request to see logs"""
    print("=== Testing Backend with Verbose Logging ===")
    
    # Create a simple PDF
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_pdf:
        pdf_path = tmp_pdf.name
        c = canvas.Canvas(pdf_path, pagesize=letter)
        c.drawString(100, 700, "Test PDF for backend logging")
        c.drawString(100, 680, "This should show which conversion method is used")
        c.showPage()
        c.save()
    
    try:
        # Send to backend
        url = "http://localhost:8000/api/pdf-to-word"
        
        with open(pdf_path, 'rb') as f:
            files = {'file': ('test_logging.pdf', f, 'application/pdf')}
            
            print("Sending test PDF to backend...")
            print("Check Terminal 1 for backend logs")
            print("-" * 50)
            
            response = requests.post(url, files=files, timeout=30)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"Success! DOCX size: {len(response.content)} bytes")
                
                # Save it
                output_path = Path("test_logging_output.docx")
                with open(output_path, 'wb') as out_f:
                    out_f.write(response.content)
                print(f"Saved to: {output_path}")
            else:
                print(f"Error: {response.status_code}")
                print(f"Response: {response.text[:500]}")
                
    finally:
        # Cleanup
        try:
            os.unlink(pdf_path)
        except:
            pass

if __name__ == "__main__":
    test_backend_with_verbose_logging()
    print("\n" + "=" * 50)
    print("Check Terminal 1 for detailed backend logs")
    print("Look for messages like:")
    print("  - 'Starting pdf2docx conversion...'")
    print("  - 'pdf2docx conversion completed successfully'")
    print("  - 'pdf2docx conversion failed, falling back to pdfplumber'")
    print("  - 'Using pdfplumber + python-docx for conversion...'")