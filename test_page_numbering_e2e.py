#!/usr/bin/env python3
"""E2E test for page-numbering endpoint"""
import io, json, sys, time
import requests
from pypdf import PdfReader, PdfWriter

BACKEND = "http://localhost:8000/api"

def create_test_pdf(pages=3):
    writer = PdfWriter()
    for i in range(pages):
        writer.add_blank_page(width=612, height=792)
    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf

def test(name, files, data, expect_status=200):
    print(f"\n=== {name} ===")
    try:
        resp = requests.post(f"{BACKEND}/page-numbering",
            files=files, data=data, timeout=30)
        print(f"Status: {resp.status_code}")
        if resp.status_code == expect_status:
            if resp.status_code == 200:
                reader = PdfReader(io.BytesIO(resp.content))
                print(f"Output pages: {len(reader.pages)}")
                cd = resp.headers.get("content-disposition", "none")
                print(f"Content-Disposition: {cd}")
                # Check file size is reasonable
                print(f"Output size: {len(resp.content)} bytes")
            print(f"PASSED")
            return True
        else:
            print(f"FAILED - expected {expect_status}")
            print(f"Response: {resp.text[:500]}")
            return False
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        return False

def main():
    print("=" * 60)
    print("PAGE NUMBERING E2E TESTS")
    print("=" * 60)

    pdf = create_test_pdf(3)
    files = {'file': ('test.pdf', pdf, 'application/pdf')}
    base_data = {
        'number_format': '1,2,3',
        'starting_number': '1',
        'format_template': '{n}',
        'position': 'bottom-center',
        'alignment': 'center',
        'page_range': 'all',
        'font_size': '12',
        'font_color': '#000000',
        'font_family': 'Helvetica',
    }

    results = []

    # Test 1: Basic page numbering
    results.append(test("Basic page numbering (1,2,3, bottom-center)", files, base_data))

    # Test 2: Roman numerals
    pdf2 = create_test_pdf(3)
    results.append(test("Roman numerals (I,II,III)", {'file': ('test.pdf', pdf2, 'application/pdf')},
        {**base_data, 'number_format': 'I,II,III'}))

    # Test 3: Page 1 format
    pdf3 = create_test_pdf(3)
    results.append(test("Page X format", {'file': ('test.pdf', pdf3, 'application/pdf')},
        {**base_data, 'number_format': 'Page 1', 'format_template': 'Page {n}'}))

    # Test 4: 1 of 10 format
    pdf4 = create_test_pdf(3)
    results.append(test("X of Y format", {'file': ('test.pdf', pdf4, 'application/pdf')},
        {**base_data, 'number_format': '1 of 10', 'format_template': '{n} of {total}'}))

    # Test 5: Top-right position
    pdf5 = create_test_pdf(3)
    results.append(test("Top-right position", {'file': ('test.pdf', pdf5, 'application/pdf')},
        {**base_data, 'position': 'top-right', 'alignment': 'right'}))

    # Test 6: Odd pages only
    pdf6 = create_test_pdf(5)
    results.append(test("Odd pages only", {'file': ('test.pdf', pdf6, 'application/pdf')},
        {**base_data, 'page_range': 'odd'}))

    # Test 7: Custom font (Courier), red color, size 10
    pdf7 = create_test_pdf(3)
    results.append(test("Custom font/color/size", {'file': ('test.pdf', pdf7, 'application/pdf')},
        {**base_data, 'font_family': 'Courier', 'font_color': '#FF0000', 'font_size': '10'}))

    # Test 8: Starting number = 5
    pdf8 = create_test_pdf(3)
    results.append(test("Starting number 5", {'file': ('test.pdf', pdf8, 'application/pdf')},
        {**base_data, 'starting_number': '5'}))

    # Test 9: Custom page range (1-2)
    pdf9 = create_test_pdf(5)
    results.append(test("Custom page range 1-2", {'file': ('test.pdf', pdf9, 'application/pdf')},
        {**base_data, 'page_range': '1-2'}))

    # Test 10: No file (should fail)
    results.append(test("No file (expect 422)", {}, {}, expect_status=422))

    print("\n" + "=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"RESULTS: {passed}/{total} tests passed")
    print("=" * 60)

    if passed == total:
        print("ALL TESTS PASSED!")
        return 0
    else:
        print(f"{total - passed} tests FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(main())