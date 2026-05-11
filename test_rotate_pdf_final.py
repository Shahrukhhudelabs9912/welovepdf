#!/usr/bin/env python3
"""Test script to verify the Rotate PDF endpoint is working correctly."""

import requests
import json
import os
from pathlib import Path

def test_rotate_pdf_endpoint():
    """Test the rotate-pdf endpoint with a sample PDF file."""
    print("Testing Rotate PDF endpoint...")
    
    # Check if we have a test PDF file
    test_pdf_path = Path("test_rotate_pdf.py")
    if not test_pdf_path.exists():
        print("Creating a simple test PDF...")
        # Create a minimal PDF for testing
        import io
        from reportlab.pdfgen import canvas
        
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer)
        c.drawString(100, 750, "Test PDF for Rotation")
        c.drawString(100, 700, "This is a test document.")
        c.save()
        
        pdf_bytes = buffer.getvalue()
        test_file = ("test.pdf", pdf_bytes, "application/pdf")
    else:
        # Use the existing test file
        with open("test_rotate_pdf.py", "rb") as f:
            pdf_bytes = f.read()
        test_file = ("test.pdf", pdf_bytes, "application/pdf")
    
    # Test the endpoint
    url = "http://127.0.0.1:8000/api/pdf/rotate-pdf"
    
    # Test with angle=90
    print("\n1. Testing rotation with angle=90...")
    files = {'file': test_file}
    data = {'angle': '90'}
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"   Status Code: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        
        if response.status_code == 200:
            content_disposition = response.headers.get('Content-Disposition', '')
            print(f"   Content-Disposition: {content_disposition}")
            
            # Save the rotated PDF
            output_path = "test_rotated_90.pdf"
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"   ✓ Success! Rotated PDF saved to: {output_path}")
            print(f"   File size: {len(response.content)} bytes")
        else:
            print(f"   ✗ Failed! Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test with angle=180
    print("\n2. Testing rotation with angle=180...")
    data = {'angle': '180'}
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            output_path = "test_rotated_180.pdf"
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"   ✓ Success! Rotated PDF saved to: {output_path}")
            print(f"   File size: {len(response.content)} bytes")
        else:
            print(f"   ✗ Failed! Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test with invalid angle
    print("\n3. Testing invalid angle (45)...")
    data = {'angle': '45'}
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print(f"   ✓ Correctly rejected invalid angle")
        else:
            print(f"   ✗ Expected 400 but got {response.status_code}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test missing file
    print("\n4. Testing missing file...")
    try:
        response = requests.post(url, data={'angle': '90'})
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 422:
            print(f"   ✓ Correctly rejected missing file")
        else:
            print(f"   ✗ Expected 422 but got {response.status_code}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "="*50)
    print("Testing new optimization endpoints...")
    
    # Test fix-scanned-pdf endpoint
    print("\n5. Testing fix-scanned-pdf endpoint...")
    url = "http://127.0.0.1:8000/api/pdf/fix-scanned-pdf"
    
    try:
        response = requests.post(url, files={'file': test_file})
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            output_path = "test_fixed_scanned.pdf"
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"   ✓ Success! Fixed PDF saved to: {output_path}")
        else:
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test optimize-pdf endpoint
    print("\n6. Testing optimize-pdf endpoint...")
    url = "http://127.0.0.1:8000/api/pdf/optimize-pdf"
    
    try:
        response = requests.post(url, files={'file': test_file})
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            output_path = "test_optimized.pdf"
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"   ✓ Success! Optimized PDF saved to: {output_path}")
        else:
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test prepare-print-pdf endpoint
    print("\n7. Testing prepare-print-pdf endpoint...")
    url = "http://127.0.0.1:8000/api/pdf/prepare-print-pdf"
    
    try:
        response = requests.post(url, files={'file': test_file})
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            output_path = "test_print_ready.pdf"
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"   ✓ Success! Print-ready PDF saved to: {output_path}")
        else:
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "="*50)
    print("All tests completed!")

if __name__ == "__main__":
    test_rotate_pdf_endpoint()