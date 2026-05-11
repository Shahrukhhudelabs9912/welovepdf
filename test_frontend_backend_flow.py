#!/usr/bin/env python3
"""
Test the complete frontend-to-backend flow for Compress PDF.
This simulates what the frontend would send to verify the fix works end-to-end.
"""

import requests
import io
import tempfile
import os
from pathlib import Path

def create_test_pdf():
    """Create a simple test PDF file."""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(100, 750, "Test PDF for Compression")
    c.drawString(100, 730, "This is a test document to verify compression works.")
    c.drawString(100, 710, "Compression levels: low, medium, high")
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()

def test_frontend_backend_flow():
    """Test the complete flow as the frontend would send it."""
    print("=" * 60)
    print("Testing Frontend-to-Backend Flow for Compress PDF")
    print("=" * 60)
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    print(f"Created test PDF: {len(pdf_bytes)} bytes")
    
    # Test each compression level
    for level in ["low", "medium", "high"]:
        print(f"\nTesting compression level: {level}")
        
        # Create FormData as frontend would
        files = {
            'file': ('test.pdf', pdf_bytes, 'application/pdf')
        }
        data = {
            'compressionLevel': level
        }
        
        try:
            response = requests.post(
                'http://localhost:8000/api/compress-pdf',
                files=files,
                data=data,
                timeout=30
            )
            
            print(f"  Status code: {response.status_code}")
            print(f"  Content-Type: {response.headers.get('Content-Type', 'N/A')}")
            print(f"  Content-Length: {len(response.content) if response.content else 0} bytes")
            
            if response.status_code == 200:
                # Check if it's a PDF
                content_type = response.headers.get('Content-Type', '')
                if 'application/pdf' in content_type:
                    print(f"  [SUCCESS] Received compressed PDF")
                    
                    # Save for inspection
                    filename = f"frontend_test_{level}.pdf"
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    print(f"  Saved to: {filename}")
                    
                    # Check compression
                    original_size = len(pdf_bytes)
                    compressed_size = len(response.content)
                    ratio = (compressed_size / original_size) * 100
                    print(f"  Original: {original_size} bytes, Compressed: {compressed_size} bytes")
                    print(f"  Compression ratio: {ratio:.1f}%")
                else:
                    print(f"  [ERROR] Not a PDF: {content_type}")
                    print(f"  Response preview: {response.text[:200]}")
            elif response.status_code == 422:
                print(f"  [ERROR] Validation failed: {response.json()}")
            else:
                print(f"  [ERROR] Unexpected status: {response.text[:200]}")
                
        except Exception as e:
            print(f"  [ERROR] Request failed: {e}")
    
    # Test error cases
    print("\n" + "-" * 60)
    print("Testing error cases:")
    
    # Test without file
    print("\n1. Testing without file (should fail with 422):")
    try:
        response = requests.post(
            'http://localhost:8000/api/compress-pdf',
            data={'compressionLevel': 'medium'},
            timeout=10
        )
        print(f"  Status: {response.status_code} (expected: 422)")
        if response.status_code == 422:
            print("  [SUCCESS] Correctly rejected missing file")
    except Exception as e:
        print(f"  [ERROR] {e}")
    
    # Test invalid compression level
    print("\n2. Testing invalid compression level (should fail with 422):")
    try:
        files = {'file': ('test.pdf', pdf_bytes, 'application/pdf')}
        data = {'compressionLevel': 'invalid'}
        response = requests.post(
            'http://localhost:8000/api/compress-pdf',
            files=files,
            data=data,
            timeout=10
        )
        print(f"  Status: {response.status_code} (expected: 422)")
        if response.status_code == 422:
            print("  [SUCCESS] Correctly rejected invalid compression level")
    except Exception as e:
        print(f"  [ERROR] {e}")
    
    print("\n" + "=" * 60)
    print("Frontend-to-backend flow test completed!")
    print("=" * 60)

if __name__ == "__main__":
    test_frontend_backend_flow()