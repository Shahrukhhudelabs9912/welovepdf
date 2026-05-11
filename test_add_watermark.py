#!/usr/bin/env python3
"""Test the add-watermark endpoint to understand current issues."""

import requests
import io

def create_test_pdf():
    """Create a simple test PDF using reportlab."""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        pdf_stream = io.BytesIO()
        c = canvas.Canvas(pdf_stream, pagesize=letter)
        c.drawString(100, 700, "Test PDF for Watermark")
        c.drawString(100, 680, "This is a test document.")
        c.drawString(100, 660, "It will be watermarked.")
        c.save()
        
        pdf_stream.seek(0)
        return pdf_stream.getvalue()
    except ImportError:
        # Create a minimal PDF manually
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n2 0 obj\n<<>>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\ntrailer\n<<>>\nstartxref\n68\n%%EOF"
        return pdf_content

def test_current_endpoint():
    """Test the current add-watermark endpoint."""
    print("Testing current add-watermark endpoint...")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    print(f"Created test PDF: {len(pdf_bytes)} bytes")
    
    # Prepare request
    files = {
        'file': ('test.pdf', pdf_bytes, 'application/pdf')
    }
    
    data = {
        'text': 'CONFIDENTIAL'
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/add-watermark',
            files=files,
            data=data
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {response.headers.get('Content-Type')}")
        
        if response.status_code == 200:
            print("SUCCESS: Endpoint returned 200 OK")
            content_length = len(response.content)
            print(f"Response content length: {content_length} bytes")
            
            if content_length > 0:
                print("SUCCESS: Received non-empty PDF response")
                # Save for inspection
                with open('test_watermarked_output.pdf', 'wb') as f:
                    f.write(response.content)
                print("Saved watermarked PDF to test_watermarked_output.pdf")
            else:
                print("ERROR: Empty response body")
                
        elif response.status_code == 422:
            print("ERROR: 422 Unprocessable Entity")
            try:
                error_detail = response.json()
                print(f"Error detail: {error_detail}")
            except:
                print(f"Response text: {response.text[:200]}")
        else:
            print(f"ERROR: Unexpected status code {response.status_code}")
            print(f"Response text: {response.text[:200]}")
            
    except Exception as e:
        print(f"Exception during request: {type(e).__name__}: {str(e)}")

def test_with_frontend_parameters():
    """Test with parameters that frontend sends."""
    print("\nTesting with frontend parameters...")
    
    # Create test PDF
    pdf_bytes = create_test_pdf()
    
    # Prepare request with frontend parameters
    files = {
        'file': ('test.pdf', pdf_bytes, 'application/pdf')
    }
    
    # These are the parameters frontend sends
    data = {
        'watermark_type': 'text',
        'watermark_text': 'CONFIDENTIAL',
        'position': 'center',
        'opacity': '50',
        'rotation': '0',
        'pages': 'all'
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/add-watermark',
            files=files,
            data=data
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS: Endpoint accepted frontend parameters")
        else:
            print(f"Response text: {response.text[:200]}")
            
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("Add Watermark Endpoint Test")
    print("=" * 60)
    
    test_current_endpoint()
    test_with_frontend_parameters()
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)