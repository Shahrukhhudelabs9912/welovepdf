#!/usr/bin/env python3
"""
Test full integration: Frontend API route -> Backend endpoint -> Word document
"""

import requests
import io
import zipfile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_test_pdf():
    """Create a test PDF with content."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    c.drawString(100, 750, "Integration Test PDF")
    c.drawString(100, 730, "This tests the full frontend-backend integration.")
    c.drawString(100, 710, "PDF uploaded via frontend, processed by backend.")
    c.drawString(100, 690, "Word document should contain this text.")
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()

def test_frontend_api_route():
    """Test the frontend API route which proxies to backend."""
    print("=== Full Integration Test ===")
    print("Testing: Frontend API route -> Backend endpoint")
    
    pdf_content = create_test_pdf()
    print(f"Created test PDF: {len(pdf_content)} bytes")
    
    # Test frontend API route (which should proxy to backend)
    files = {'file': ('integration_test.pdf', pdf_content, 'application/pdf')}
    
    try:
        print("Calling frontend API route: /api/pdf-to-word")
        response = requests.post('http://localhost:3000/api/pdf-to-word', files=files)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            # Check response headers
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            print(f"Content-Type: {content_type}")
            print(f"Content-Disposition: {content_disposition}")
            
            # Save the file
            output_filename = 'integration_test_converted.docx'
            with open(output_filename, 'wb') as f:
                f.write(response.content)
            
            print(f"File saved: {output_filename} ({len(response.content)} bytes)")
            
            # Validate it's a proper .docx file
            try:
                with zipfile.ZipFile(io.BytesIO(response.content)) as zipf:
                    file_count = len(zipf.namelist())
                    print(f"Valid .docx file with {file_count} internal files")
                    
                    # Check for document content
                    if 'word/document.xml' in zipf.namelist():
                        xml_content = zipf.read('word/document.xml').decode('utf-8', errors='ignore')
                        if "Integration Test PDF" in xml_content:
                            print("[SUCCESS] PDF content found in Word document!")
                            return True
                        else:
                            print("[WARNING] Expected text not found in document.xml")
                    else:
                        print("[ERROR] document.xml not found in .docx file")
            except Exception as e:
                print(f"[ERROR] Invalid .docx file: {e}")
                return False
        else:
            print(f"[ERROR] Request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")
        return False

def test_direct_backend():
    """Also test direct backend endpoint for comparison."""
    print("\n=== Direct Backend Test (for comparison) ===")
    
    pdf_content = create_test_pdf()
    files = {'file': ('direct_backend_test.pdf', pdf_content, 'application/pdf')}
    
    try:
        print("Calling backend directly: http://localhost:8000/api/pdf-to-word")
        response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            print("[SUCCESS] Backend endpoint working directly")
            return True
        else:
            print(f"[ERROR] Backend direct call failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Backend request failed: {e}")
        return False

def main():
    """Run integration tests."""
    print("=" * 60)
    print("FULL STACK INTEGRATION TEST")
    print("=" * 60)
    
    # Check if services are running
    print("Checking services...")
    
    # Check frontend
    try:
        frontend_resp = requests.get('http://localhost:3000', timeout=5)
        if frontend_resp.status_code == 200:
            print("[OK] Frontend running on http://localhost:3000")
        else:
            print(f"[WARNING] Frontend returned {frontend_resp.status_code}")
    except Exception as e:
        print(f"[ERROR] Frontend not reachable: {e}")
        print("Make sure frontend is running: cd frontend && npm run dev")
        return
    
    # Check backend
    try:
        backend_resp = requests.get('http://localhost:8000/health', timeout=5)
        if backend_resp.status_code == 200:
            print("[OK] Backend running on http://localhost:8000")
        else:
            print(f"[WARNING] Backend health check returned {backend_resp.status_code}")
    except Exception as e:
        print(f"[ERROR] Backend not reachable: {e}")
        print("Make sure backend is running: cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000")
        return
    
    print("\n" + "=" * 60)
    
    # Run tests
    frontend_test = test_frontend_api_route()
    backend_test = test_direct_backend()
    
    print("\n" + "=" * 60)
    print("INTEGRATION TEST SUMMARY")
    print("=" * 60)
    
    if frontend_test and backend_test:
        print("[SUCCESS] Full stack integration working correctly!")
        print("- Frontend API route [OK]")
        print("- Backend endpoint [OK]")
        print("- PDF to Word conversion [OK]")
        print("\nThe improved PDF-to-Word converter is fully operational.")
    elif backend_test and not frontend_test:
        print("[PARTIAL] Backend works but frontend API route may have issues")
        print("Check frontend/api/pdf-to-word/route.ts configuration")
    else:
        print("[ISSUE] Integration tests failed - check service configurations")

if __name__ == "__main__":
    main()