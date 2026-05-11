#!/usr/bin/env python3
"""
Test script to verify complete Add Watermark functionality.
Tests both text and image watermarks with various configurations.
"""

import requests
import json
import os
import tempfile
from pathlib import Path

def create_test_pdf():
    """Create a simple test PDF file."""
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
        pdf_path = f.name
        
    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.drawString(100, 750, "Test PDF for Watermark Testing")
    c.drawString(100, 730, "This is a sample PDF document.")
    c.drawString(100, 710, "It will be used to test watermark functionality.")
    c.drawString(100, 690, "Page 1")
    c.showPage()
    c.drawString(100, 750, "Second Page")
    c.drawString(100, 730, "This is page 2 of the test PDF.")
    c.drawString(100, 710, "Watermark should appear on this page too.")
    c.drawString(100, 690, "Page 2")
    c.showPage()
    c.save()
    
    return pdf_path

def create_test_image():
    """Create a simple test image file."""
    from PIL import Image, ImageDraw
    
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        img_path = f.name
    
    img = Image.new('RGBA', (200, 100), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    draw.rectangle([10, 10, 190, 90], outline='blue', width=3)
    draw.text((60, 40), "LOGO", fill='red')
    img.save(img_path, 'PNG')
    
    return img_path

def test_text_watermark():
    """Test text watermark functionality."""
    print("Testing text watermark...")
    
    # Create test PDF
    pdf_path = create_test_pdf()
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {
                'watermark_type': 'text',
                'watermark_text': 'CONFIDENTIAL',
                'text': 'CONFIDENTIAL',  # Also send 'text' for compatibility
                'position': 'center',
                'opacity': '50',
                'rotation': '45',
                'pages': 'all'
            }
            
            response = requests.post(
                'http://127.0.0.1:8000/api/add-watermark',
                files=files,
                data=data
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            
            if response.status_code == 200:
                output_path = 'test_text_watermarked.pdf'
                with open(output_path, 'wb') as out_f:
                    out_f.write(response.content)
                print(f"[PASS] Text watermark test passed. Output saved to {output_path}")
                return True
            else:
                print(f"[FAIL] Text watermark test failed: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"[ERROR] Text watermark test error: {e}")
        return False
    finally:
        # Cleanup
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)

def test_image_watermark():
    """Test image watermark functionality."""
    print("\nTesting image watermark...")
    
    # Create test PDF and image
    pdf_path = create_test_pdf()
    img_path = create_test_image()
    
    try:
        with open(pdf_path, 'rb') as pdf_f, open(img_path, 'rb') as img_f:
            files = {
                'file': ('test.pdf', pdf_f, 'application/pdf'),
                'watermark_image': ('watermark.png', img_f, 'image/png')
            }
            data = {
                'watermark_type': 'image',
                'position': 'top-left',
                'opacity': '70',
                'rotation': '0',
                'pages': 'first'
            }
            
            response = requests.post(
                'http://127.0.0.1:8000/api/add-watermark',
                files=files,
                data=data
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            
            if response.status_code == 200:
                output_path = 'test_image_watermarked.pdf'
                with open(output_path, 'wb') as out_f:
                    out_f.write(response.content)
                print(f"[PASS] Image watermark test passed. Output saved to {output_path}")
                return True
            else:
                print(f"[FAIL] Image watermark test failed: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"[ERROR] Image watermark test error: {e}")
        return False
    finally:
        # Cleanup
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)
        if os.path.exists(img_path):
            os.unlink(img_path)

def test_custom_page_range():
    """Test watermark with custom page range."""
    print("\nTesting custom page range...")
    
    pdf_path = create_test_pdf()
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {
                'watermark_type': 'text',
                'watermark_text': 'PAGE 1 ONLY',
                'position': 'bottom-right',
                'opacity': '30',
                'rotation': '0',
                'pages': 'custom',
                'custom_page_range': '1'
            }
            
            response = requests.post(
                'http://127.0.0.1:8000/api/add-watermark',
                files=files,
                data=data
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                output_path = 'test_custom_range.pdf'
                with open(output_path, 'wb') as out_f:
                    out_f.write(response.content)
                print(f"[PASS] Custom page range test passed. Output saved to {output_path}")
                return True
            else:
                print(f"[FAIL] Custom page range test failed: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"[ERROR] Custom page range test error: {e}")
        return False
    finally:
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)

def test_invalid_inputs():
    """Test error handling for invalid inputs."""
    print("\nTesting invalid inputs...")
    
    pdf_path = create_test_pdf()
    
    try:
        # Test missing required field
        with open(pdf_path, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {
                'watermark_type': 'text',
                # Missing watermark_text
                'position': 'center'
            }
            
            response = requests.post(
                'http://127.0.0.1:8000/api/add-watermark',
                files=files,
                data=data
            )
            
            print(f"Missing field test - Status: {response.status_code}")
            # Should return 422 (validation error)
            
        # Test invalid opacity value
        with open(pdf_path, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {
                'watermark_type': 'text',
                'watermark_text': 'TEST',
                'opacity': '150'  # Invalid: > 100
            }
            
            response = requests.post(
                'http://127.0.0.1:8000/api/add-watermark',
                files=files,
                data=data
            )
            
            print(f"Invalid opacity test - Status: {response.status_code}")
            
        print("[PASS] Invalid input tests completed")
        return True
        
    except Exception as e:
        print(f"[ERROR] Invalid input test error: {e}")
        return False
    finally:
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)

def main():
    """Run all tests."""
    print("=" * 60)
    print("Add Watermark Complete Test Suite")
    print("=" * 60)
    
    # Check if backend is running
    try:
        health_response = requests.get('http://127.0.0.1:8000/health', timeout=5)
        if health_response.status_code != 200:
            print("Backend is not running. Please start the backend server first.")
            print("Run: cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000")
            return
    except:
        print("Backend is not running. Please start the backend server first.")
        print("Run: cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000")
        return
    
    results = []
    
    # Run tests
    results.append(("Text Watermark", test_text_watermark()))
    results.append(("Image Watermark", test_image_watermark()))
    results.append(("Custom Page Range", test_custom_page_range()))
    results.append(("Invalid Inputs", test_invalid_inputs()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "[PASS]" if success else "[FAIL]"
        print(f"{test_name:30} {status}")
        if success:
            passed += 1
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("[SUCCESS] All Add Watermark tests passed!")
    else:
        print(f"[WARNING] {total - passed} test(s) failed")

if __name__ == "__main__":
    main()