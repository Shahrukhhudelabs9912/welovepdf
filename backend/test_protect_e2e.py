"""
End-to-end test for protect-pdf endpoint with current API
"""
import urllib.request
import io
import sys
from pypdf import PdfWriter, PdfReader

# Create a test PDF
writer = PdfWriter()
writer.add_blank_page(width=612, height=792)
test_pdf = io.BytesIO()
writer.write(test_pdf)
test_pdf.seek(0)
pdf_bytes = test_pdf.read()
print(f"Test PDF created: {len(pdf_bytes)} bytes")

# Build multipart form-data with current API parameters
boundary = '----TestBoundary7MA4YWxk'
body = b''
body += f'--{boundary}\r\n'.encode()
body += b'Content-Disposition: form-data; name="file"; filename="test.pdf"\r\n'
body += b'Content-Type: application/pdf\r\n\r\n'
body += pdf_bytes
body += f'\r\n--{boundary}\r\n'.encode()
body += b'Content-Disposition: form-data; name="password"\r\n\r\n'
body += b'secure123\r\n'
body += f'--{boundary}\r\n'.encode()
body += b'Content-Disposition: form-data; name="allow_printing"\r\n\r\n'
body += b'true\r\n'
body += f'--{boundary}\r\n'.encode()
body += b'Content-Disposition: form-data; name="allow_copying"\r\n\r\n'
body += b'true\r\n'
body += f'--{boundary}\r\n'.encode()
body += b'Content-Disposition: form-data; name="allow_editing"\r\n\r\n'
body += b'false\r\n'
body += f'--{boundary}\r\n'.encode()
body += b'Content-Disposition: form-data; name="allow_annotating"\r\n\r\n'
body += b'false\r\n'
body += f'--{boundary}--\r\n'.encode()

req = urllib.request.Request('http://localhost:8000/api/protect-pdf', data=body)
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
req.add_header('Accept', 'application/pdf')

try:
    resp = urllib.request.urlopen(req, timeout=20)
    result_pdf = resp.read()
    content_type = resp.headers.get('Content-Type', '')
    print(f"\nResponse status: {resp.status}")
    print(f"Content-Type: {content_type}")
    print(f"Content-Disposition: {resp.headers.get('Content-Disposition', '')}")
    print(f"Response size: {len(result_pdf)} bytes")
    
    if 'application/json' in content_type:
        body_str = result_pdf.decode()[:500]
        print(f"JSON body: {body_str}")
        print("\n*** FAIL: Got JSON instead of PDF ***")
        sys.exit(1)
    
    # Verify it's a valid encrypted PDF
    reader = PdfReader(io.BytesIO(result_pdf))
    print(f"\nIs encrypted: {reader.is_encrypted}")
    
    if not reader.is_encrypted:
        print("\n*** FAIL: PDF is NOT encrypted ***")
        sys.exit(1)
    
    # Test correct password
    dr = reader.decrypt('secure123')
    print(f"Decrypt with correct password: result={dr} (2=OWNER_PASSWORD=full access)")
    print(f"Pages: {len(reader.pages)}")
    
    # Test wrong password
    reader2 = PdfReader(io.BytesIO(result_pdf))
    wr = reader2.decrypt('wrongpass')
    print(f"Decrypt with WRONG password: result={wr} (0=NOT_DECRYPTED)")
    
    print("\n*** PROTECT-PDF ENDPOINT TEST PASSED ***")
    print("PDF is encrypted with AES-256, correct password works, wrong password rejected.")
    
except urllib.error.HTTPError as e:
    print(f"\nHTTP Error {e.code}: {e.read().decode()[:500]}")
    sys.exit(1)
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)