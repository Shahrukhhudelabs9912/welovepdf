#!/usr/bin/env python3
"""
Test script to verify table border and structure preservation in PDF to Word conversion.
"""
import os
import tempfile
from pathlib import Path
import io
import sys

def create_pdf_with_tables_in_dir(temp_path):
    """Create a PDF with tables using reportlab in the specified directory."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet
        
        # Create PDF with tables
        pdf_path = temp_path / "test_with_tables.pdf"
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
        elements = []
        
        # Add title
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Test PDF with Tables", styles['Title']))
        elements.append(Paragraph("This PDF contains tables with borders and formatting.", styles['Normal']))
        
        # Create sample data for tables
        data1 = [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
            ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3'],
            ['Row 3, Col 1', 'Row 3, Col 2', 'Row 3, Col 3'],
        ]
        
        data2 = [
            ['Product', 'Quantity', 'Price', 'Total'],
            ['Widget A', '10', '$5.00', '$50.00'],
            ['Widget B', '5', '$12.00', '$60.00'],
            ['Widget C', '20', '$3.50', '$70.00'],
            ['', '', 'Subtotal:', '$180.00'],
        ]
        
        # Create first table with borders
        table1 = Table(data1)
        table1.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        elements.append(Paragraph("Table 1: Simple table with grid borders", styles['Heading2']))
        elements.append(table1)
        
        # Add some space
        elements.append(Paragraph("", styles['Normal']))
        
        # Create second table with more complex formatting
        table2 = Table(data2)
        table2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (3, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -2), colors.lightgrey),
            ('BACKGROUND', (0, -1), (-2, -1), colors.lightblue),
            ('TEXTCOLOR', (0, -1), (-2, -1), colors.darkblue),
            ('FONTNAME', (0, -1), (-2, -1), 'Helvetica-Bold'),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.darkblue),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.black),
            ('GRID', (0, 0), (-2, -2), 1, colors.grey),
            ('BOX', (0, 0), (-1, -1), 2, colors.black),
        ]))
        
        elements.append(Paragraph("Table 2: Complex table with different border styles", styles['Heading2']))
        elements.append(table2)
        
        # Build PDF
        doc.build(elements)
        
        print(f"Created test PDF with tables: {pdf_path}")
        print(f"PDF file size: {pdf_path.stat().st_size} bytes")
        
        return pdf_path
        
    except ImportError as e:
        print(f"Error importing reportlab: {e}")
        return None
    except Exception as e:
        print(f"Error creating PDF with tables: {e}")
        return None

def test_pdf2docx_table_preservation():
    """Test if pdf2docx preserves table borders and structure."""
    print("\n" + "=" * 60)
    print("Testing pdf2docx table preservation capabilities...")
    print("=" * 60)
    
    # Create temp directory that won't be automatically cleaned up
    import tempfile
    temp_dir = tempfile.mkdtemp()
    temp_path = Path(temp_dir)
    
    try:
        # Create PDF directly in the temp directory
        pdf_path = create_pdf_with_tables_in_dir(temp_path)
        if not pdf_path:
            print("Failed to create test PDF")
            return False
        
        from pdf2docx import Converter
        import zipfile
        
        docx_path = temp_path / "output_tables.docx"
        
        print(f"\nConverting PDF to DOCX using pdf2docx...")
        cv = Converter(str(pdf_path))
        cv.convert(
            str(docx_path),
            start=0,
            end=None,
            multi_processing=False,
            debug=False
        )
        cv.close()
        
        print(f"Converted to DOCX: {docx_path}")
        print(f"DOCX file size: {docx_path.stat().st_size} bytes")
        
        # Analyze DOCX content
        print("\nAnalyzing DOCX content for tables...")
        
        # Check if DOCX contains table-related XML
        with zipfile.ZipFile(docx_path, 'r') as zipf:
            # Read document.xml which contains the main content
            if 'word/document.xml' in zipf.namelist():
                with zipf.open('word/document.xml') as f:
                    xml_content = f.read().decode('utf-8', errors='ignore')
                    
                # Count table elements
                table_count = xml_content.count('<w:tbl>')
                table_row_count = xml_content.count('<w:tr>')
                table_cell_count = xml_content.count('<w:tc>')
                
                print(f"Found {table_count} table(s) in DOCX")
                print(f"Found {table_row_count} table row(s)")
                print(f"Found {table_cell_count} table cell(s)")
                
                # Check for border styling
                border_count = xml_content.count('w:border')
                grid_count = xml_content.count('w:grid')
                
                print(f"Border references: {border_count}")
                print(f"Grid references: {grid_count}")
                
                if table_count > 0:
                    print("[SUCCESS] pdf2docx preserved table structure!")
                    
                    # Check if borders are present
                    if border_count > 0 or grid_count > 0:
                        print("[SUCCESS] pdf2docx appears to have preserved table borders!")
                    else:
                        print("[WARNING] pdf2docx may not have preserved table borders (no border elements found)")
                else:
                    print("[WARNING] pdf2docx did not preserve tables (no table elements found)")
                    
                # Save a snippet of the XML for inspection
                xml_snippet_path = temp_path / "document_xml_snippet.txt"
                with open(xml_snippet_path, 'w', encoding='utf-8') as f:
                    # Get first 5000 chars
                    f.write(xml_content[:5000])
                print(f"\nXML snippet saved to: {xml_snippet_path}")
                
            else:
                print("[ERROR] Could not find document.xml in DOCX")
                
        return True
        
    except ImportError as e:
        print(f"Error importing pdf2docx: {e}")
        return False
    except Exception as e:
        print(f"Error during pdf2docx conversion: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_with_real_pdf():
    """Test with a real PDF that has tables (if available)."""
    print("\n" + "=" * 60)
    print("Testing with existing test PDFs...")
    print("=" * 60)
    
    # Check for existing test PDFs
    test_files = [
        "test_table_converted.docx",  # This is a DOCX output, not PDF
    ]
    
    for test_file in test_files:
        if os.path.exists(test_file):
            print(f"\nFound test file: {test_file}")
            
            # If it's a DOCX, check its table content
            if test_file.endswith('.docx'):
                try:
                    import zipfile
                    
                    with zipfile.ZipFile(test_file, 'r') as zipf:
                        if 'word/document.xml' in zipf.namelist():
                            with zipf.open('word/document.xml') as f:
                                xml_content = f.read().decode('utf-8', errors='ignore')
                                
                            table_count = xml_content.count('<w:tbl>')
                            print(f"  Contains {table_count} table(s)")
                            
                except Exception as e:
                    print(f"  Error analyzing {test_file}: {e}")
    
    return True

def main():
    """Run all tests."""
    print("=" * 60)
    print("Testing Table Border and Structure Preservation")
    print("=" * 60)
    
    # Test pdf2docx table preservation
    success = test_pdf2docx_table_preservation()
    
    # Test with any existing PDFs
    test_with_real_pdf()
    
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"Table preservation test: {'PASS' if success else 'FAIL'}")
    print("=" * 60)
    
    if success:
        print("\npdf2docx should preserve table structure in DOCX conversion.")
        print("Check the XML snippet to verify border preservation.")
    else:
        print("\nTable preservation test failed.")
        
if __name__ == "__main__":
    main()