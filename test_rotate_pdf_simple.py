#!/usr/bin/env python3
"""Simple test script to verify the Rotate PDF endpoint."""

import requests
import os

def test_endpoint():
    """Test the rotate-pdf endpoint."""
    print("Testing Rotate PDF endpoint...")
    
    # First, let's check what endpoints are available
    print("\n1. Checking available endpoints...")
    try:
        response = requests.get("http://127.0.0.1:8000/api/docs")
        print(f"   Docs status: {response.status_code}")
        
        # Try to get the OpenAPI spec
        response = requests.get("http://127.0.0.1:8000/api/openapi.json")
        if response.status_code == 200:
            import json
            spec = response.json()
            paths = list(spec.get('paths', {}).keys())
            print(f"   Found {len(paths)} endpoints")
            for path in sorted(paths):
                if 'rotate' in path.lower():
                    print(f"   - {path}")
    except Exception as e:
        print(f"   Error checking docs: {e}")
    
    # Create a simple test PDF
    print("\n2. Creating test PDF...")
    try:
        from reportlab.pdfgen import canvas
        import io
        
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer)
        c.drawString(100, 750, "Test PDF for Rotation")
        c.drawString(100, 700, "This is a test document.")
        c.save()
        
        pdf_bytes = buffer.getvalue()
        test_file = ("test.pdf", pdf_bytes, "application/pdf")
        print(f"   Created test PDF: {len(pdf_bytes)} bytes")
    except ImportError:
        print("   ReportLab not available, using dummy file")
        # Create a minimal PDF manually
        pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000010 00000 n\ntrailer\n<<>>\nstartxref\n20\n%%EOF"
        test_file = ("test.pdf", pdf_bytes, "application/pdf")
    
    # Test different endpoint paths
    test_paths = [
        "/api/pdf/rotate-pdf",
        "/api/rotate-pdf", 
        "/rotate-pdf",
        "/pdf/rotate-pdf"
    ]
    
    print("\n3. Testing endpoint paths...")
    for path in test_paths:
        url = f"http://127.0.0.1:8000{path}"
        print(f"   Testing {path}...")
        try:
            response = requests.post(url, files={'file': test_file}, data={'angle': '90'}, timeout=5)
            print(f"     Status: {response.status_code}")
            if response.status_code == 200:
                print(f"     Success! Content-Type: {response.headers.get('Content-Type')}")
                print(f"     Content-Disposition: {response.headers.get('Content-Disposition')}")
                with open("test_output.pdf", "wb") as f:
                    f.write(response.content)
                print(f"     Saved to test_output.pdf ({len(response.content)} bytes)")
                break
            elif response.status_code == 404:
                print(f"     Not found")
            else:
                print(f"     Response: {response.text[:100]}")
        except Exception as e:
            print(f"     Error: {e}")
    
    print("\n4. Testing frontend API endpoint...")
    # Check what the frontend is using
    try:
        with open("frontend/lib/api-client.ts", "r") as f:
            content = f.read()
            if "rotate-pdf" in content:
                print("   Found 'rotate-pdf' in api-client.ts")
    except:
        print("   Could not read api-client.ts")
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_endpoint()