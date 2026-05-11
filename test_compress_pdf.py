#!/usr/bin/env python3
"""
Test script for Compress PDF functionality.
Tests the backend endpoint directly to verify it works.
"""

import requests
import io
import tempfile
import os
from pathlib import Path

def create_test_pdf():
    """Create a simple test PDF file for testing."""
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Add some content to make the PDF non-empty
    c.drawString(100, 750, "Test PDF for Compression")
    c.drawString(100, 700, "This is a test PDF file.")
    c.drawString(100, 650, "It contains sample text for compression testing.")
    
    for i in range(5):
        c.drawString(100, 600 - i*50, f"Line {i+1}: Sample content for compression.")
    
    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()

def test_compress_pdf_endpoint():
    """Test the compress-pdf endpoint with different compression levels."""
    print("Testing Compress PDF endpoint...")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    print(f"Created test PDF: {len(pdf_bytes)} bytes")
    
    # Test each compression level
    for compression_level in ["low", "medium", "high"]:
        print(f"\nTesting compression level: {compression_level}")
        
        # Prepare form data
        files = {
            'file': ('test.pdf', pdf_bytes, 'application/pdf')
        }
        data = {
            'compressionLevel': compression_level
        }
        
        try:
            # Make request to backend
            response = requests.post(
                'http://localhost:8000/api/compress-pdf',
                files=files,
                data=data,
                timeout=30
            )
            
            print(f"  Status code: {response.status_code}")
            print(f"  Content-Type: {response.headers.get('Content-Type')}")
            print(f"  Content-Length: {len(response.content)} bytes")
            
            if response.status_code == 200:
                # Check if response is a PDF
                content_type = response.headers.get('Content-Type', '')
                if 'application/pdf' in content_type:
                    print(f"  [SUCCESS] Received compressed PDF ({len(response.content)} bytes)")
                    
                    # Check if file was actually compressed (size may vary)
                    original_size = len(pdf_bytes)
                    compressed_size = len(response.content)
                    compression_ratio = compressed_size / original_size * 100
                    
                    print(f"  Original size: {original_size} bytes")
                    print(f"  Compressed size: {compressed_size} bytes")
                    print(f"  Compression ratio: {compression_ratio:.1f}%")
                    
                    # Save for inspection
                    output_filename = f"test_compressed_{compression_level}.pdf"
                    with open(output_filename, 'wb') as f:
                        f.write(response.content)
                    print(f"  Saved to: {output_filename}")
                else:
                    print(f"  [ERROR] Expected PDF but got {content_type}")
                    print(f"  Response preview: {response.text[:200]}")
            else:
                print(f"  [ERROR] {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"  Error details: {error_data}")
                except:
                    print(f"  Error text: {response.text[:500]}")
                    
        except requests.exceptions.RequestException as e:
            print(f"  [ERROR] Request failed: {e}")
        except Exception as e:
            print(f"  [ERROR] Unexpected error: {e}")

def test_invalid_compression_level():
    """Test with invalid compression level."""
    print("\nTesting invalid compression level...")
    
    pdf_bytes = create_test_pdf()
    
    files = {
        'file': ('test.pdf', pdf_bytes, 'application/pdf')
    }
    data = {
        'compressionLevel': 'invalid'  # Invalid value
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/compress-pdf',
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"  Status code: {response.status_code}")
        if response.status_code == 422:
            print("  [SUCCESS] Correctly rejected invalid compression level")
        else:
            print(f"  [ERROR] Expected 422 but got {response.status_code}")
            
    except Exception as e:
        print(f"  [ERROR] Error: {e}")

def test_no_file():
    """Test without file upload."""
    print("\nTesting without file...")
    
    data = {
        'compressionLevel': 'medium'
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/compress-pdf',
            data=data,
            timeout=30
        )
        
        print(f"  Status code: {response.status_code}")
        if response.status_code == 422:
            print("  [SUCCESS] Correctly rejected missing file")
        else:
            print(f"  [ERROR] Expected 422 but got {response.status_code}")
            
    except Exception as e:
        print(f"  [ERROR] Error: {e}")

def main():
    """Run all tests."""
    print("=" * 60)
    print("Compress PDF Endpoint Tests")
    print("=" * 60)
    
    try:
        # Test basic functionality
        test_compress_pdf_endpoint()
        
        # Test error cases
        test_invalid_compression_level()
        test_no_file()
        
        print("\n" + "=" * 60)
        print("Tests completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[ERROR] Test suite failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())