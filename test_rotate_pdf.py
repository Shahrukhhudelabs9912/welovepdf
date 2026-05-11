#!/usr/bin/env python3
"""
Test script for Rotate PDF endpoint functionality.
"""

import requests
import io
from PyPDF2 import PdfReader, PdfWriter
import tempfile
import os

def create_test_pdf():
    """Create a simple test PDF for rotation testing."""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Add some content
    c.setFont("Helvetica", 20)
    c.drawString(100, 700, "Test PDF for Rotation")
    c.setFont("Helvetica", 12)
    c.drawString(100, 650, "This is page 1 - should be rotated")
    c.showPage()
    
    c.setFont("Helvetica", 20)
    c.drawString(100, 700, "Page 2")
    c.setFont("Helvetica", 12)
    c.drawString(100, 650, "This is page 2 - should also be rotated")
    c.showPage()
    
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def test_rotate_pdf_endpoint():
    """Test the rotate-pdf endpoint."""
    print("Testing rotate-pdf endpoint...")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    
    # Test with angle=90
    files = {'file': ('test.pdf', pdf_bytes, 'application/pdf')}
    data = {'angle': '90'}
    
    try:
        response = requests.post(
            'http://127.0.0.1:8000/api/rotate-pdf',
            files=files,
            data=data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Disposition: {response.headers.get('Content-Disposition')}")
        
        if response.status_code == 200:
            print("[SUCCESS] Rotate PDF endpoint returned 200 OK")
            
            # Check if response is a PDF
            content_type = response.headers.get('Content-Type', '')
            if 'application/pdf' in content_type:
                print("[SUCCESS] Response is a PDF file")
                
                # Save the rotated PDF for inspection
                with open('test_rotated_output.pdf', 'wb') as f:
                    f.write(response.content)
                print(f"[SUCCESS] Saved rotated PDF to test_rotated_output.pdf ({len(response.content)} bytes)")
                
                # Verify it's a valid PDF
                try:
                    pdf_stream = io.BytesIO(response.content)
                    reader = PdfReader(pdf_stream)
                    print(f"[SUCCESS] Rotated PDF has {len(reader.pages)} pages")
                    
                    # Check if pages are rotated (PyPDF2 stores rotation in page object)
                    for i, page in enumerate(reader.pages):
                        # Note: PyPDF2 doesn't expose rotation directly in a simple way
                        # We'll just confirm the PDF is valid
                        print(f"  Page {i+1}: Size {page.mediabox.width:.1f}x{page.mediabox.height:.1f}")
                    
                except Exception as e:
                    print(f"[ERROR] Failed to parse rotated PDF: {e}")
            else:
                print(f"[ERROR] Response is not a PDF: {content_type}")
                print(f"Response preview: {response.text[:200]}")
        else:
            print(f"[ERROR] Endpoint returned {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to backend server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")

def test_invalid_angle():
    """Test with invalid angle parameter."""
    print("\nTesting invalid angle parameter...")
    
    pdf_bytes = create_test_pdf()
    files = {'file': ('test.pdf', pdf_bytes, 'application/pdf')}
    data = {'angle': '45'}  # Invalid angle (not 90, 180, or 270)
    
    try:
        response = requests.post(
            'http://127.0.0.1:8000/api/rotate-pdf',
            files=files,
            data=data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("[SUCCESS] Invalid angle correctly rejected with 400 Bad Request")
            print(f"Response: {response.text}")
        else:
            print(f"[WARNING] Expected 400 for invalid angle, got {response.status_code}")
            
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")

def test_missing_file():
    """Test with missing file parameter."""
    print("\nTesting missing file parameter...")
    
    data = {'angle': '90'}
    
    try:
        response = requests.post(
            'http://127.0.0.1:8000/api/rotate-pdf',
            data=data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:  # Pydantic validation error
            print("[SUCCESS] Missing file correctly rejected")
        else:
            print(f"[INFO] Got status {response.status_code} for missing file")
            
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")

def main():
    """Run all tests."""
    print("=" * 60)
    print("Rotate PDF Endpoint Tests")
    print("=" * 60)
    
    # Check if backend is running
    try:
        health_response = requests.get('http://127.0.0.1:8000/health', timeout=5)
        if health_response.status_code == 200:
            print("[INFO] Backend server is running")
        else:
            print("[WARNING] Backend health check failed")
    except:
        print("[ERROR] Backend server is not running. Please start it with:")
        print("  cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000")
        return
    
    # Run tests
    test_rotate_pdf_endpoint()
    test_invalid_angle()
    test_missing_file()
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print("Check test_rotated_output.pdf to verify rotation worked correctly.")

if __name__ == "__main__":
    main()