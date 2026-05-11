#!/usr/bin/env python3
"""
Test pdf2docx capabilities for preserving tables, images, and formatting.
"""

import io
import tempfile
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import fitz  # PyMuPDF
from pdf2docx import Converter
import zipfile

def create_test_pdf_with_tables_and_formatting():
    """Create a PDF with tables, formatting, and simulated content."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Build document content
    content = []
    
    # Title
    content.append(Paragraph("Test PDF with Tables and Formatting", styles['Title']))
    content.append(Spacer(1, 12))
    
    # Regular paragraph
    content.append(Paragraph("This is a regular paragraph with <b>bold text</b> and <i>italic text</i>.", styles['Normal']))
    content.append(Spacer(1, 12))
    
    # Numbered list
    content.append(Paragraph("Numbered List:", styles['Heading3']))
    for i in range(1, 4):
        content.append(Paragraph(f"{i}. Item {i} in numbered list", styles['Normal']))
    
    content.append(Spacer(1, 12))
    
    # Table with borders
    content.append(Paragraph("Table with Borders:", styles['Heading3']))
    table_data = [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
        ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
        ['Row 3, Cell 1', 'Row 3, Cell 2', 'Row 3, Cell 3']
    ]
    
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BOX', (0, 0), (-1, -1), 2, colors.black)
    ]))
    
    content.append(table)
    content.append(Spacer(1, 24))
    
    # Second page with more content
    content.append(Paragraph("Second Page Content", styles['Heading2']))
    content.append(Paragraph("This tests multi-page document conversion.", styles['Normal']))
    
    doc.build(content)
    buffer.seek(0)
    return buffer.getvalue()

def test_pdf2docx_conversion():
    """Test pdf2docx conversion capabilities."""
    print("=== Testing pdf2docx Conversion Capabilities ===")
    
    # Create test PDF
    pdf_bytes = create_test_pdf_with_tables_and_formatting()
    print(f"Created test PDF: {len(pdf_bytes)} bytes")
    
    # Save to temp file
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        pdf_path = temp_path / "test.pdf"
        docx_path = temp_path / "output.docx"
        
        with open(pdf_path, 'wb') as f:
            f.write(pdf_bytes)
        
        print(f"PDF saved to: {pdf_path}")
        
        try:
            # Try pdf2docx conversion
            print("\nAttempting pdf2docx conversion...")
            cv = Converter(str(pdf_path))
            
            # Try with multiprocessing disabled
            cv.convert(
                str(docx_path),
                start=0,
                end=None,
                multi_processing=False,  # Disable multiprocessing
                debug=True  # Enable debug output
            )
            cv.close()
            
            print(f"Conversion completed. Output: {docx_path}")
            
            # Check if file was created
            if docx_path.exists():
                file_size = docx_path.stat().st_size
                print(f"DOCX file size: {file_size} bytes")
                
                # Check if it's a valid DOCX
                try:
                    with zipfile.ZipFile(docx_path, 'r') as zipf:
                        file_list = zipf.namelist()
                        print(f"Valid DOCX with {len(file_list)} internal files")
                        
                        # Check for document content
                        if 'word/document.xml' in file_list:
                            xml_content = zipf.read('word/document.xml').decode('utf-8', errors='ignore')
                            
                            # Check for table tags
                            if '<w:tbl>' in xml_content:
                                print("✓ Table structure found in DOCX")
                            else:
                                print("✗ No table tags found")
                            
                            # Check for our test content
                            if 'Test PDF with Tables' in xml_content:
                                print("✓ Text content preserved")
                            else:
                                print("✗ Text content not found")
                                
                            # Check for formatting
                            if '<w:b ' in xml_content or '<w:b>' in xml_content:
                                print("✓ Bold formatting found")
                            if '<w:i ' in xml_content or '<w:i>' in xml_content:
                                print("✓ Italic formatting found")
                                
                            # Sample some XML to see structure
                            sample = xml_content[:1000]
                            print(f"\nSample XML (first 1000 chars):\n{sample}")
                        else:
                            print("✗ document.xml not found in DOCX")
                except Exception as e:
                    print(f"✗ Error reading DOCX: {e}")
            else:
                print("✗ DOCX file not created")
                
        except Exception as e:
            print(f"✗ pdf2docx conversion failed: {e}")
            import traceback
            traceback.print_exc()
            
            # Try alternative approach
            print("\nTrying alternative conversion method...")
            try:
                cv = Converter(str(pdf_path))
                cv.convert(
                    str(docx_path),
                    start=0,
                    end=None,
                    multi_processing=False,
                    debug=False,
                    kwargs={'ignore_page_error': True}
                )
                cv.close()
                print("Alternative method succeeded")
            except Exception as e2:
                print(f"Alternative method also failed: {e2}")

def test_windows_multiprocessing_issue():
    """Test the Windows multiprocessing issue specifically."""
    print("\n=== Testing Windows Multiprocessing Issue ===")
    
    import platform
    import multiprocessing
    
    print(f"Platform: {platform.system()}")
    print(f"Python version: {platform.python_version()}")
    print(f"Multiprocessing start method: {multiprocessing.get_start_method()}")
    
    # Test if we can create a simple pool
    try:
        print("Testing multiprocessing.Pool creation...")
        pool = multiprocessing.Pool(processes=1)
        pool.close()
        pool.join()
        print("✓ Multiprocessing pool created successfully")
    except Exception as e:
        print(f"✗ Multiprocessing pool creation failed: {e}")
        
        # Try setting spawn method
        print("\nTrying with spawn method...")
        try:
            multiprocessing.set_start_method('spawn', force=True)
            pool = multiprocessing.Pool(processes=1)
            pool.close()
            pool.join()
            print("✓ Spawn method works")
        except Exception as e2:
            print(f"✗ Spawn method also failed: {e2}")

def main():
    """Run all tests."""
    print("=" * 60)
    print("PDF2DOCX CAPABILITY ANALYSIS")
    print("=" * 60)
    
    test_pdf2docx_conversion()
    test_windows_multiprocessing_issue()
    
    print("\n" + "=" * 60)
    print("RECOMMENDATIONS")
    print("=" * 60)
    
    print("""
Based on the test results:

1. If pdf2docx works with multi_processing=False:
   - Use pdf2docx as primary converter
   - It should preserve tables and basic formatting
   
2. If pdf2docx fails on Windows:
   - Consider using spawn method for multiprocessing
   - Or use a hybrid approach with PyMuPDF + python-docx
   
3. For images:
   - pdf2docx may extract images but check documentation
   - Use PyMuPDF as fallback for image extraction
   
4. For complex formatting:
   - pdf2docx is best for tables
   - May need custom logic for lists/bullets
    """)

if __name__ == "__main__":
    main()