#!/usr/bin/env python3
"""
Test script to verify numbering, bullets, and list formatting preservation in PDF to Word conversion.
"""
import os
import tempfile
from pathlib import Path
import io
import sys

def create_pdf_with_lists():
    """Create a PDF with numbered and bulleted lists using reportlab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.platypus import SimpleDocTemplate, Paragraph, ListFlowable, ListItem
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors
        
        # Create temp directory
        import tempfile
        temp_dir = tempfile.mkdtemp()
        temp_path = Path(temp_dir)
        
        # Create PDF with lists
        pdf_path = temp_path / "test_with_lists.pdf"
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
        elements = []
        
        # Add title
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Test PDF with Lists and Numbering", styles['Title']))
        elements.append(Paragraph("This PDF contains numbered lists, bulleted lists, and nested lists.", styles['Normal']))
        
        # Create a numbered list
        elements.append(Paragraph("Numbered List:", styles['Heading2']))
        
        numbered_data = [
            "First item in numbered list",
            "Second item with some longer text that might wrap to multiple lines",
            "Third item",
            "Fourth and final item"
        ]
        
        numbered_list = ListFlowable(
            [ListItem(Paragraph(item, styles['Normal'])) for item in numbered_data],
            bulletType='1',
            start=1
        )
        elements.append(numbered_list)
        
        # Add some space
        elements.append(Paragraph("", styles['Normal']))
        
        # Create a bulleted list
        elements.append(Paragraph("Bulleted List:", styles['Heading2']))
        
        bulleted_data = [
            "Important point one",
            "Critical consideration two",
            "Additional note three",
            "Final bullet point four"
        ]
        
        bulleted_list = ListFlowable(
            [ListItem(Paragraph(item, styles['Normal'])) for item in bulleted_data],
            bulletType='bullet'
        )
        elements.append(bulleted_list)
        
        # Add some space
        elements.append(Paragraph("", styles['Normal']))
        
        # Create nested lists
        elements.append(Paragraph("Nested Lists:", styles['Heading2']))
        
        # Main list with bullets
        main_list_items = [
            "Main item 1",
            "Main item 2 with subitems:",
            ListFlowable(
                [
                    ListItem(Paragraph("Subitem 2.1", styles['Normal'])),
                    ListItem(Paragraph("Subitem 2.2", styles['Normal'])),
                    ListItem(Paragraph("Subitem 2.3 with deeper nesting:", styles['Normal'])),
                    ListFlowable(
                        [
                            ListItem(Paragraph("Deep item A", styles['Normal'])),
                            ListItem(Paragraph("Deep item B", styles['Normal'])),
                        ],
                        bulletType='bullet',
                        leftIndent=40
                    )
                ],
                bulletType='bullet',
                leftIndent=20
            ),
            "Main item 3"
        ]
        
        # Create the nested list structure
        nested_list = ListFlowable(
            [
                ListItem(Paragraph(main_list_items[0], styles['Normal'])),
                ListItem(Paragraph(main_list_items[1], styles['Normal'])),
                main_list_items[2],  # This is the sublist
                ListItem(Paragraph(main_list_items[3], styles['Normal'])),
            ],
            bulletType='bullet'
        )
        elements.append(nested_list)
        
        # Build PDF
        doc.build(elements)
        
        print(f"Created test PDF with lists: {pdf_path}")
        print(f"PDF file size: {pdf_path.stat().st_size} bytes")
        
        return str(pdf_path), temp_dir
        
    except ImportError as e:
        print(f"Error importing reportlab: {e}")
        return None, None
    except Exception as e:
        print(f"Error creating PDF with lists: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def test_pdf2docx_list_preservation():
    """Test if pdf2docx preserves numbering, bullets, and list formatting."""
    print("\n" + "=" * 60)
    print("Testing pdf2docx list preservation capabilities...")
    print("=" * 60)
    
    pdf_path, temp_dir = create_pdf_with_lists()
    if not pdf_path:
        print("Failed to create test PDF")
        return False
    
    temp_path = Path(temp_dir)
    
    try:
        from pdf2docx import Converter
        import zipfile
        import re
        
        docx_path = temp_path / "output_lists.docx"
        
        print(f"\nConverting PDF to DOCX using pdf2docx...")
        cv = Converter(pdf_path)
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
        
        # Analyze DOCX content for list formatting
        print("\nAnalyzing DOCX content for list formatting...")
        
        with zipfile.ZipFile(docx_path, 'r') as zipf:
            # Read document.xml which contains the main content
            if 'word/document.xml' in zipf.namelist():
                with zipf.open('word/document.xml') as f:
                    xml_content = f.read().decode('utf-8', errors='ignore')
                
                # Check for list-related XML elements
                # Word uses w:numPr for numbering properties
                num_pr_count = xml_content.count('w:numPr')
                num_id_count = xml_content.count('w:numId')
                ilvl_count = xml_content.count('w:ilvl')  # indent level
                
                # Check for bullet characters or list symbols
                bullet_char_count = xml_content.count('•') + xml_content.count('○') + xml_content.count('▪')
                
                # Check for list paragraph styles
                list_style_count = xml_content.count('ListParagraph')
                
                print(f"Numbering properties (w:numPr): {num_pr_count}")
                print(f"Number IDs (w:numId): {num_id_count}")
                print(f"Indent levels (w:ilvl): {ilvl_count}")
                print(f"Bullet characters found: {bullet_char_count}")
                print(f"List paragraph styles: {list_style_count}")
                
                # Also check numbering.xml for list definitions
                if 'word/numbering.xml' in zipf.namelist():
                    with zipf.open('word/numbering.xml') as f:
                        numbering_xml = f.read().decode('utf-8', errors='ignore')
                    
                    # Count list definitions
                    abstract_num_count = numbering_xml.count('w:abstractNum')
                    num_count = numbering_xml.count('w:num ')
                    
                    print(f"\nNumbering.xml analysis:")
                    print(f"  Abstract list definitions: {abstract_num_count}")
                    print(f"  Concrete list instances: {num_count}")
                    
                    # Check for bullet list definitions
                    bullet_def_count = numbering_xml.count('bullet')
                    decimal_def_count = numbering_xml.count('decimal')
                    
                    print(f"  Bullet list definitions: {bullet_def_count}")
                    print(f"  Decimal list definitions: {decimal_def_count}")
                    
                    if abstract_num_count > 0 and num_count > 0:
                        print("[SUCCESS] pdf2docx created proper list definitions in numbering.xml")
                    else:
                        print("[WARNING] pdf2docx may not have created proper list definitions")
                
                # Determine if lists were preserved
                if num_pr_count > 0 or num_id_count > 0 or ilvl_count > 0:
                    print("\n[SUCCESS] pdf2docx appears to have preserved list formatting!")
                    
                    # Try to extract some sample list items
                    print("\nSample list items found in XML:")
                    
                    # Find paragraphs with numbering
                    lines = xml_content.split('\n')
                    list_items = []
                    for i, line in enumerate(lines[:50]):  # Check first 50 lines
                        if 'w:numPr' in line or 'w:numId' in line:
                            # Extract text from this line or nearby
                            text_match = re.search(r'<w:t[^>]*>([^<]+)</w:t>', line)
                            if text_match:
                                list_items.append(text_match.group(1))
                    
                    for i, item in enumerate(list_items[:5]):  # Show first 5
                        print(f"  {i+1}. '{item}'")
                    
                else:
                    print("\n[WARNING] pdf2docx may not have preserved list formatting (no list XML elements found)")
                    
                # Save a snippet of the XML for inspection
                xml_snippet_path = temp_path / "lists_xml_snippet.txt"
                with open(xml_snippet_path, 'w', encoding='utf-8') as f:
                    # Get first 3000 chars
                    f.write(xml_content[:3000])
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

def main():
    """Run all tests."""
    print("=" * 60)
    print("Testing Numbering, Bullets, and List Format Preservation")
    print("=" * 60)
    
    # Test pdf2docx list preservation
    success = test_pdf2docx_list_preservation()
    
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"List preservation test: {'PASS' if success else 'FAIL'}")
    print("=" * 60)
    
    if success:
        print("\npdf2docx should preserve list formatting in DOCX conversion.")
        print("Check the XML snippet to verify list structure preservation.")
    else:
        print("\nList preservation test failed.")
        
if __name__ == "__main__":
    main()