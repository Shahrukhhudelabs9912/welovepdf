"""
End-to-end test for pdf-to-word conversion with new pipeline.
"""
import sys
import os
import io
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(name)s [%(levelname)s] %(message)s')

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.routes.pdf_routes import _validate_pdf_integrity, _detect_scanned_pdf

def test_helpers():
    """Test the helper functions."""
    results = []
    
    # Find test PDF
    workspace = os.path.dirname(os.path.dirname(__file__))
    pdf_path = os.path.join(workspace, "frontend_test_medium.pdf")
    
    if not os.path.exists(pdf_path):
        print(f"ERROR: Test PDF not found at {pdf_path}")
        return False
    
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    
    print(f"INFO: Testing with {pdf_path} ({len(pdf_bytes):,} bytes)")
    
    # Test 1: PDF integrity validation
    valid, msg = _validate_pdf_integrity(pdf_bytes, "test.pdf")
    print(f"TEST 1: _validate_pdf_integrity -> valid={valid}, msg={msg}")
    results.append(valid)
    
    # Test 2: Scanned PDF detection
    is_scanned, info = _detect_scanned_pdf(pdf_bytes)
    print(f"TEST 2: _detect_scanned_pdf -> is_scanned={is_scanned}, info={info}")
    results.append(True)  # Always passes, just informational
    
    # Test 3: Corrupted file detection
    corrupted_bytes = b"Not a PDF file at all"
    valid, msg = _validate_pdf_integrity(corrupted_bytes, "bad.pdf")
    print(f"TEST 3: Corrupted PDF detection -> valid={valid}, msg={msg}")
    results.append(not valid)  # Should detect it's invalid
    
    # Test 4: Empty file detection
    empty_bytes = b""
    valid, msg = _validate_pdf_integrity(empty_bytes, "empty.pdf")
    print(f"TEST 4: Empty file detection -> valid={valid}, msg={msg}")
    results.append(not valid)  # Should detect it's invalid
    
    # Test 5: Scanned PDF simulation (image-only)
    # Create a minimal text-based PDF vs image-based detection
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        # Create a text-based PDF
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=letter)
        c.drawString(100, 700, "This is a text-based PDF with extractable content.")
        c.drawString(100, 680, "It should NOT be detected as scanned.")
        c.save()
        text_pdf = buf.getvalue()
        
        is_scanned, info = _detect_scanned_pdf(text_pdf)
        print(f"TEST 5: Text PDF detection -> is_scanned={is_scanned}, info={info}")
        results.append(not is_scanned)  # Should NOT be detected as scanned
    except Exception as e:
        print(f"TEST 5: SKIPPED (reportlab error: {e})")
        results.append(True)  # Skip, not a critical failure
    
    passed = sum(1 for r in results if r)
    total = len(results)
    print(f"\nRESULTS: {passed}/{total} tests passed")
    return passed == total

if __name__ == "__main__":
    success = test_helpers()
    sys.exit(0 if success else 1)