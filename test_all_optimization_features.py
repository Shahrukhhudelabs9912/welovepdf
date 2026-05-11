#!/usr/bin/env python3
"""
Comprehensive test for all PDF optimization features:
1. Rotate PDF (with angle parameter)
2. Fix Scanned PDF
3. Optimize PDF for Web Viewing
4. Prepare PDF for Printing
"""

import requests
import io
import tempfile
import os
from pathlib import Path

# Test configuration
BASE_URL = "http://127.0.0.1:8000/api"
TEST_PDF_PATH = "test_rotate_pdf_simple.py"  # We'll create a simple test PDF

def create_test_pdf():
    """Create a simple test PDF for testing."""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Add some content
    c.drawString(100, 750, "Test PDF for Optimization Features")
    c.drawString(100, 730, "Rotate PDF Test")
    c.drawString(100, 710, "Fix Scanned PDF Test")
    c.drawString(100, 690, "Optimize for Web Viewing Test")
    c.drawString(100, 670, "Prepare for Printing Test")
    
    # Add a simple shape
    c.rect(100, 500, 200, 100, stroke=1, fill=0)
    
    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()

def test_rotate_pdf():
    """Test the rotate-pdf endpoint."""
    print("\n=== Testing Rotate PDF Endpoint ===")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    
    # Prepare request
    files = {'file': ('test_rotate.pdf', pdf_bytes, 'application/pdf')}
    data = {'angle': '90'}
    
    try:
        response = requests.post(
            f"{BASE_URL}/rotate-pdf",
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Length: {response.headers.get('Content-Length')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/pdf' in content_type:
                print("[OK] Rotate PDF endpoint working correctly")
                return True
            else:
                print(f"[ERROR] Unexpected content type: {content_type}")
                return False
        else:
            print(f"[ERROR] Request failed with status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Exception during rotate-pdf test: {e}")
        return False

def test_fix_scanned_pdf():
    """Test the fix-scanned-pdf endpoint."""
    print("\n=== Testing Fix Scanned PDF Endpoint ===")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    
    # Prepare request
    files = {'file': ('test_scanned.pdf', pdf_bytes, 'application/pdf')}
    
    try:
        response = requests.post(
            f"{BASE_URL}/fix-scanned-pdf",
            files=files,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Length: {response.headers.get('Content-Length')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/pdf' in content_type:
                print("✓ Fix Scanned PDF endpoint working correctly")
                return True
            else:
                print(f"✗ Unexpected content type: {content_type}")
                return False
        else:
            print(f"✗ Request failed with status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"✗ Exception during fix-scanned-pdf test: {e}")
        return False

def test_optimize_pdf():
    """Test the optimize-pdf endpoint."""
    print("\n=== Testing Optimize PDF Endpoint ===")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    
    # Prepare request
    files = {'file': ('test_optimize.pdf', pdf_bytes, 'application/pdf')}
    
    try:
        response = requests.post(
            f"{BASE_URL}/optimize-pdf",
            files=files,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Length: {response.headers.get('Content-Length')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/pdf' in content_type:
                print("✓ Optimize PDF endpoint working correctly")
                return True
            else:
                print(f"✗ Unexpected content type: {content_type}")
                return False
        else:
            print(f"✗ Request failed with status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"✗ Exception during optimize-pdf test: {e}")
        return False

def test_prepare_print_pdf():
    """Test the prepare-print-pdf endpoint."""
    print("\n=== Testing Prepare Print PDF Endpoint ===")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    
    # Prepare request
    files = {'file': ('test_print.pdf', pdf_bytes, 'application/pdf')}
    
    try:
        response = requests.post(
            f"{BASE_URL}/prepare-print-pdf",
            files=files,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Length: {response.headers.get('Content-Length')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/pdf' in content_type:
                print("✓ Prepare Print PDF endpoint working correctly")
                return True
            else:
                print(f"✗ Unexpected content type: {content_type}")
                return False
        else:
            print(f"✗ Request failed with status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"✗ Exception during prepare-print-pdf test: {e}")
        return False

def test_invalid_angle():
    """Test rotate-pdf with invalid angle parameter."""
    print("\n=== Testing Invalid Angle Validation ===")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    
    # Prepare request with invalid angle
    files = {'file': ('test_invalid.pdf', pdf_bytes, 'application/pdf')}
    data = {'angle': '45'}  # Invalid angle (should be 90, 180, or 270)
    
    try:
        response = requests.post(
            f"{BASE_URL}/rotate-pdf",
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✓ Invalid angle correctly rejected with 400 Bad Request")
            return True
        else:
            print(f"✗ Expected 400 for invalid angle, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Exception during invalid angle test: {e}")
        return False

def main():
    """Run all tests."""
    print("Starting comprehensive PDF optimization features test...")
    print(f"Base URL: {BASE_URL}")
    
    results = []
    
    # Test each endpoint
    results.append(("Rotate PDF", test_rotate_pdf()))
    results.append(("Fix Scanned PDF", test_fix_scanned_pdf()))
    results.append(("Optimize PDF", test_optimize_pdf()))
    results.append(("Prepare Print PDF", test_prepare_print_pdf()))
    results.append(("Invalid Angle Validation", test_invalid_angle()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{test_name:30} {status}")
        if not passed:
            all_passed = False
    
    print("="*60)
    
    if all_passed:
        print("SUCCESS: All PDF optimization features are working correctly!")
        return 0
    else:
        print("FAILURE: Some tests failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    # Check if reportlab is available for PDF creation
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        exit(main())
    except ImportError:
        print("Error: reportlab is required for this test.")
        print("Install it with: pip install reportlab")
        exit(1)