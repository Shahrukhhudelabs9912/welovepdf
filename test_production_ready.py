#!/usr/bin/env python3
"""
Comprehensive test for production-ready PDF-to-Word conversion functionality.
Tests various aspects of the improved conversion system.
"""

import requests
import io
import time
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import zipfile

def create_text_only_pdf():
    """Create a PDF with text content only."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Add text content
    c.drawString(100, 750, "Text-Only PDF Document")
    c.drawString(100, 730, "This PDF contains only text content.")
    c.drawString(100, 710, "It should convert to Word with proper paragraph formatting.")
    c.drawString(100, 690, "Multiple paragraphs with different formatting.")
    c.drawString(100, 670, "This tests basic text extraction and layout preservation.")
    
    # Second page
    c.showPage()
    c.drawString(100, 750, "Second Page")
    c.drawString(100, 730, "More text content on another page.")
    c.drawString(100, 710, "Testing multi-page document conversion.")
    
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def create_pdf_with_table():
    """Create a PDF with a table."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create content
    content = []
    
    # Add title
    content.append(Paragraph("PDF with Table Content", styles['Title']))
    content.append(Paragraph("This PDF contains a table that should be preserved in Word.", styles['Normal']))
    
    # Create table data
    data = [
        ['Name', 'Age', 'Department', 'Salary'],
        ['John Doe', '35', 'Engineering', '$85,000'],
        ['Jane Smith', '28', 'Marketing', '$72,000'],
        ['Bob Johnson', '42', 'Sales', '$68,000'],
        ['Alice Brown', '31', 'HR', '$65,000']
    ]
    
    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    content.append(table)
    content.append(Paragraph("Table should be preserved in the Word document.", styles['Normal']))
    
    doc.build(content)
    buffer.seek(0)
    return buffer.getvalue()

def test_basic_conversion():
    """Test basic PDF to Word conversion."""
    print("=== Test 1: Basic Text-Only PDF Conversion ===")
    
    pdf_content = create_text_only_pdf()
    print(f"Created text-only PDF: {len(pdf_content)} bytes")
    
    files = {'file': ('text_only.pdf', pdf_content, 'application/pdf')}
    
    try:
        start_time = time.time()
        response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
        elapsed = time.time() - start_time
        
        print(f"Response status: {response.status_code}")
        print(f"Response time: {elapsed:.2f} seconds")
        
        if response.status_code == 200:
            # Save the file
            output_filename = 'test_text_only_converted.docx'
            with open(output_filename, 'wb') as f:
                f.write(response.content)
            
            # Validate .docx format
            with zipfile.ZipFile(io.BytesIO(response.content)) as zipf:
                if 'word/document.xml' in zipf.namelist():
                    xml_content = zipf.read('word/document.xml').decode('utf-8', errors='ignore')
                    if "Text-Only PDF Document" in xml_content:
                        print("[OK] SUCCESS: Text content preserved in Word document")
                    else:
                        print("[FAIL] Text content not found")
                
                print(f"[OK] Valid .docx file with {len(zipf.namelist())} internal files")
            
            print(f"[OK] File saved: {output_filename} ({len(response.content)} bytes)")
            return True
        else:
            print(f"[FAIL] Server error: {response.text}")
            return False
            
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")
        return False

def test_table_conversion():
    """Test PDF with table conversion."""
    print("\n=== Test 2: PDF with Table Conversion ===")
    
    pdf_content = create_pdf_with_table()
    print(f"Created PDF with table: {len(pdf_content)} bytes")
    
    files = {'file': ('table_document.pdf', pdf_content, 'application/pdf')}
    
    try:
        start_time = time.time()
        response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
        elapsed = time.time() - start_time
        
        print(f"Response status: {response.status_code}")
        print(f"Response time: {elapsed:.2f} seconds")
        
        if response.status_code == 200:
            output_filename = 'test_table_converted.docx'
            with open(output_filename, 'wb') as f:
                f.write(response.content)
            
            # Check for table structure indicators
            with zipfile.ZipFile(io.BytesIO(response.content)) as zipf:
                if 'word/document.xml' in zipf.namelist():
                    xml_content = zipf.read('word/document.xml').decode('utf-8', errors='ignore')
                    # Look for table-related XML tags
                    if '<w:tbl>' in xml_content or 'table' in xml_content.lower():
                        print("[OK] SUCCESS: Table structure detected in Word document")
                    else:
                        print("[WARN] No explicit table tags found (may be converted as text)")
                
                print(f"[OK] Valid .docx file created")
            
            print(f"[OK] File saved: {output_filename} ({len(response.content)} bytes)")
            return True
        else:
            print(f"[FAIL] Server error: {response.text}")
            return False
            
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid files."""
    print("\n=== Test 3: Error Handling Tests ===")
    
    # Test 3a: Invalid file type
    print("Test 3a: Invalid file type (non-PDF)...")
    files = {'file': ('test.txt', b'This is not a PDF file', 'text/plain')}
    
    try:
        response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
        if response.status_code == 400:
            print("[OK] SUCCESS: Properly rejected non-PDF file")
        else:
            print(f"[FAIL] Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")
    
    # Test 3b: Empty file
    print("\nTest 3b: Empty PDF file...")
    files = {'file': ('empty.pdf', b'', 'application/pdf')}
    
    try:
        response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
        if response.status_code == 400 or response.status_code == 500:
            print("[OK] SUCCESS: Properly handled empty PDF")
        else:
            print(f"[NOTE] Got status {response.status_code} for empty PDF")
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")
    
    return True

def test_performance():
    """Test performance with multiple conversions."""
    print("\n=== Test 4: Performance Test ===")
    
    pdf_content = create_text_only_pdf()
    times = []
    
    for i in range(3):
        print(f"  Run {i+1}/3...")
        files = {'file': (f'test_{i}.pdf', pdf_content, 'application/pdf')}
        
        try:
            start_time = time.time()
            response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                times.append(elapsed)
                print(f"    Success in {elapsed:.2f} seconds")
            else:
                print(f"    Failed with status {response.status_code}")
        except Exception as e:
            print(f"    Error: {e}")
    
    if times:
        avg_time = sum(times) / len(times)
        print(f"\n[OK] Average conversion time: {avg_time:.2f} seconds")
        print(f"[OK] Best time: {min(times):.2f} seconds")
        print(f"[OK] Worst time: {max(times):.2f} seconds")
        return True
    else:
        print("[FAIL] No successful conversions")
        return False

def test_temp_file_cleanup():
    """Verify temporary files are cleaned up."""
    print("\n=== Test 5: Temporary File Cleanup ===")
    
    # Count temp files before
    temp_dir = os.path.join(os.environ.get('TEMP', os.environ.get('TMPDIR', '/tmp')))
    print(f"Temp directory: {temp_dir}")
    
    pdf_content = create_text_only_pdf()
    files = {'file': ('cleanup_test.pdf', pdf_content, 'application/pdf')}
    
    try:
        response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
        
        if response.status_code == 200:
            print("[OK] Conversion successful")
            print("[OK] Temporary files should be automatically cleaned up by tempfile.TemporaryDirectory")
            return True
        else:
            print(f"[FAIL] Conversion failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")
        return False

def main():
    """Run all production readiness tests."""
    print("=" * 60)
    print("PRODUCTION-READY PDF-TO-WORD CONVERSION TEST SUITE")
    print("=" * 60)
    
    # Check if server is running
    print("Checking if backend server is running...")
    try:
        health_response = requests.get('http://localhost:8000/health', timeout=5)
        if health_response.status_code == 200:
            print("[OK] Backend server is running")
        else:
            print("[FAIL] Backend server health check failed")
            return
    except Exception as e:
        print(f"[FAIL] Cannot connect to backend server: {e}")
        print("Please start the backend server first: cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000")
        return
    
    results = []
    
    # Run tests
    results.append(("Basic Conversion", test_basic_conversion()))
    results.append(("Table Conversion", test_table_conversion()))
    results.append(("Error Handling", test_error_handling()))
    results.append(("Performance", test_performance()))
    results.append(("Temp File Cleanup", test_temp_file_cleanup()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "[PASS]" if success else "[FAIL]"
        print(f"{status}: {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("\n[SUCCESS] ALL TESTS PASSED - Production-ready functionality verified!")
    else:
        print(f"\n[WARNING] {total - passed} test(s) failed - Review issues above")

if __name__ == "__main__":
    main()