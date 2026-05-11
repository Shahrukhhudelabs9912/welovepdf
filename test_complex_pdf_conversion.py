#!/usr/bin/env python3
"""
Test PDF to Word conversion with complex PDF containing tables, images, and formatting.
"""
import os
import tempfile
from pathlib import Path
import io
import sys
import requests
import time

def create_complex_test_pdf():
    """Create a complex PDF with tables, images, lists, and formatting."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, ListFlowable, ListItem, Image
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
        import PIL.Image as PILImage
        
        # Create temp directory
        import tempfile
        temp_dir = tempfile.mkdtemp()
        temp_path = Path(temp_dir)
        
        # Create a simple image for testing
        img_path = temp_path / "test_chart.png"
        img = PILImage.new('RGB', (300, 200), color='lightblue')
        # Draw a simple "chart"
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 100, 150], fill='blue', outline='darkblue')
        draw.rectangle([120, 80, 170, 150], fill='green', outline='darkgreen')
        draw.rectangle([190, 30, 240, 150], fill='red', outline='darkred')
        img.save(img_path)
        
        # Create PDF
        pdf_path = temp_path / "complex_test.pdf"
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
        elements = []
        
        styles = getSampleStyleSheet()
        
        # Title
        elements.append(Paragraph("Complex Test Document", styles['Title']))
        elements.append(Paragraph("A comprehensive test PDF with multiple formatting elements", styles['Normal']))
        
        # Section 1: Headings and text formatting
        elements.append(Paragraph("1. Document Structure", styles['Heading1']))
        elements.append(Paragraph("1.1. Introduction", styles['Heading2']))
        
        # Create formatted text
        bold_style = ParagraphStyle(
            'BoldStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            spaceAfter=6
        )
        
        italic_style = ParagraphStyle(
            'ItalicStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=11,
            textColor=colors.darkblue,
            spaceAfter=6
        )
        
        highlight_style = ParagraphStyle(
            'HighlightStyle',
            parent=styles['Normal'],
            backColor=colors.yellow,
            fontSize=11,
            spaceAfter=6
        )
        
        elements.append(Paragraph("This document tests various PDF elements:", bold_style))
        elements.append(Paragraph("It includes tables, images, lists, and formatted text.", italic_style))
        elements.append(Paragraph("Important: This is a test for PDF to Word conversion quality.", highlight_style))
        
        # Section 2: Tables
        elements.append(Paragraph("2. Data Tables", styles['Heading1']))
        
        # Table 1: Simple grid
        table1_data = [
            ['ID', 'Product', 'Quantity', 'Price', 'Total'],
            ['001', 'Laptop Pro', '5', '$1,200.00', '$6,000.00'],
            ['002', 'Wireless Mouse', '25', '$25.99', '$649.75'],
            ['003', 'USB-C Cable', '100', '$12.50', '$1,250.00'],
            ['004', 'Monitor 27"', '8', '$349.99', '$2,799.92'],
            ['', '', '', 'Subtotal:', '$10,699.67'],
            ['', '', '', 'Tax (10%):', '$1,069.97'],
            ['', '', '', 'Grand Total:', '$11,769.64']
        ]
        
        table1 = Table(table1_data)
        table1.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (3, 1), (4, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -3), colors.HexColor('#ecf0f1')),
            ('BACKGROUND', (0, -3), (-2, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, -3), (-2, -1), colors.darkblue),
            ('FONTNAME', (0, -3), (-2, -1), 'Helvetica-Bold'),
            ('LINEABOVE', (0, -3), (-1, -3), 1, colors.grey),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ('GRID', (0, 0), (-2, -3), 0.5, colors.grey),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        elements.append(Paragraph("2.1. Financial Table with Grid", styles['Heading2']))
        elements.append(table1)
        
        # Table 2: Merged cells
        table2_data = [
            ['Department', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'],
            ['Sales', '125,000', '140,000', '135,000', '160,000', '560,000'],
            ['Marketing', '45,000', '50,000', '55,000', '60,000', '210,000'],
            ['Engineering', '200,000', '220,000', '240,000', '260,000', '920,000'],
            ['Total', '370,000', '410,000', '430,000', '480,000', '1,690,000']
        ]
        
        table2 = Table(table2_data)
        table2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#7f8c8d')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        
        elements.append(Paragraph("2.2. Quarterly Report Table", styles['Heading2']))
        elements.append(table2)
        
        # Section 3: Images
        elements.append(Paragraph("3. Images and Charts", styles['Heading1']))
        elements.append(Paragraph("Below is a sample chart image:", styles['Normal']))
        
        # Add the image
        chart_img = Image(str(img_path), width=300, height=200)
        elements.append(chart_img)
        elements.append(Paragraph("Figure 1: Sample chart showing quarterly data", ParagraphStyle(
            'CaptionStyle',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )))
        
        # Section 4: Lists
        elements.append(Paragraph("4. Lists and Numbering", styles['Heading1']))
        
        # Numbered list
        elements.append(Paragraph("4.1. Numbered Procedure:", styles['Heading2']))
        procedure_items = [
            "Prepare the document template",
            "Add all required sections",
            "Include tables and images",
            "Apply formatting and styles",
            "Review and finalize the document"
        ]
        
        numbered_list = ListFlowable(
            [ListItem(Paragraph(item, styles['Normal'])) for item in procedure_items],
            bulletType='1',
            start=1
        )
        elements.append(numbered_list)
        
        # Bulleted list
        elements.append(Paragraph("4.2. Key Features:", styles['Heading2']))
        feature_items = [
            "High-quality PDF to Word conversion",
            "Table border preservation",
            "Image extraction and embedding",
            "List formatting maintenance",
            "Text style preservation"
        ]
        
        bulleted_list = ListFlowable(
            [ListItem(Paragraph(item, styles['Normal'])) for item in feature_items],
            bulletType='bullet'
        )
        elements.append(bulleted_list)
        
        # Section 5: Text alignment
        elements.append(Paragraph("5. Text Alignment", styles['Heading1']))
        
        left_style = ParagraphStyle(
            'LeftStyle',
            parent=styles['Normal'],
            alignment=TA_LEFT,
            fontSize=11,
            leftIndent=20,
            spaceAfter=6
        )
        
        center_style = ParagraphStyle(
            'CenterStyle',
            parent=styles['Normal'],
            alignment=TA_CENTER,
            fontSize=11,
            spaceAfter=6
        )
        
        right_style = ParagraphStyle(
            'RightStyle',
            parent=styles['Normal'],
            alignment=TA_RIGHT,
            fontSize=11,
            rightIndent=20,
            spaceAfter=6
        )
        
        elements.append(Paragraph("This text is left-aligned with indentation.", left_style))
        elements.append(Paragraph("This text is centered on the page.", center_style))
        elements.append(Paragraph("This text is right-aligned with indentation.", right_style))
        
        # Build PDF
        doc.build(elements)
        
        print(f"Created complex test PDF: {pdf_path}")
        print(f"PDF size: {pdf_path.stat().st_size} bytes")
        
        return str(pdf_path), temp_dir
        
    except ImportError as e:
        print(f"Error importing required libraries: {e}")
        return None, None
    except Exception as e:
        print(f"Error creating complex PDF: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def test_complex_conversion():
    """Test conversion of complex PDF through the backend endpoint."""
    print("\n" + "=" * 60)
    print("Testing Complex PDF to Word Conversion")
    print("=" * 60)
    
    pdf_path, temp_dir = create_complex_test_pdf()
    if not pdf_path:
        print("Failed to create test PDF")
        return False
    
    temp_path = Path(temp_dir)
    
    # Test through backend endpoint
    url = "http://localhost:8000/api/pdf-to-word"
    
    with open(pdf_path, 'rb') as f:
        files = {'file': ('complex_test.pdf', f, 'application/pdf')}
        
        print(f"\nSending complex PDF to backend endpoint...")
        start_time = time.time()
        
        try:
            response = requests.post(url, files=files, timeout=60)
            elapsed = time.time() - start_time
            
            print(f"Response status: {response.status_code}")
            print(f"Response time: {elapsed:.2f} seconds")
            
            if response.status_code == 200:
                # Check response
                content_type = response.headers.get('Content-Type', '')
                content_disposition = response.headers.get('Content-Disposition', '')
                
                print(f"Content-Type: {content_type}")
                print(f"Content-Disposition: {content_disposition}")
                
                # Save the file
                output_path = Path("complex_test_output.docx")
                with open(output_path, 'wb') as out_f:
                    out_f.write(response.content)
                
                docx_size = len(response.content)
                print(f"DOCX file size: {docx_size} bytes")
                print(f"Saved to: {output_path}")
                
                # Analyze the DOCX
                import zipfile
                try:
                    with zipfile.ZipFile(output_path, 'r') as zipf:
                        file_list = zipf.namelist()
                        
                        # Check for essential files
                        essential_files = ['word/document.xml', '[Content_Types].xml', '_rels/.rels']
                        missing = [f for f in essential_files if f not in file_list]
                        
                        if not missing:
                            print("[SUCCESS] Valid DOCX file generated")
                            
                            # Analyze content
                            with zipf.open('word/document.xml') as xml_file:
                                xml_content = xml_file.read().decode('utf-8', errors='ignore')
                                
                                # Count various elements
                                table_count = xml_content.count('<w:tbl>')
                                image_count = len([f for f in file_list if 'word/media/image' in f])
                                heading_count = xml_content.count('Heading')
                                
                                print(f"\nDOCX Analysis:")
                                print(f"  Tables found: {table_count} (expected: 2+)")
                                print(f"  Images found: {image_count} (expected: 1+)")
                                print(f"  Heading references: {heading_count}")
                                
                                # Check for list formatting
                                num_pr_count = xml_content.count('w:numPr')
                                bullet_char_count = xml_content.count('•') + xml_content.count('○')
                                
                                print(f"  List numbering properties: {num_pr_count}")
                                print(f"  Bullet characters: {bullet_char_count}")
                                
                                # Check numbering.xml
                                if 'word/numbering.xml' in file_list:
                                    with zipf.open('word/numbering.xml') as num_file:
                                        num_xml = num_file.read().decode('utf-8', errors='ignore')
                                        abstract_num_count = num_xml.count('w:abstractNum')
                                        print(f"  List definitions: {abstract_num_count}")
                                
                                # Overall assessment
                                if table_count >= 2 and image_count >= 1:
                                    print("\n[SUCCESS] Complex PDF conversion appears successful!")
                                    print("The DOCX contains tables and images as expected.")
                                    return True
                                else:
                                    print("\n[WARNING] Some elements may not have been preserved")
                                    print(f"  Tables: {table_count}/2+, Images: {image_count}/1+")
                                    return False
                                    
                        else:
                            print(f"[ERROR] Missing essential DOCX files: {missing}")
                            return False
                            
                except zipfile.BadZipFile:
                    print("[ERROR] Output is not a valid ZIP/DOCX file")
                    return False
                    
            else:
                print(f"[ERROR] Request failed with status {response.status_code}")
                print(f"Response: {response.text[:500]}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Request failed: {e}")
            return False

def main():
    """Run the complex PDF conversion test."""
    print("=" * 60)
    print("Complex PDF Conversion Test")
    print("=" * 60)
    
    print("\nThis test creates a complex PDF with:")
    print("  - Multiple tables with borders and formatting")
    print("  - Images/charts")
    print("  - Numbered and bulleted lists")
    print("  - Headings and text formatting")
    print("  - Different text alignments")
    print()
    
    # Check if backend is running
    try:
        health_response = requests.get("http://localhost:8000/health", timeout=5)
        if health_response.status_code == 200:
            print("Backend server is reachable.")
        else:
            print(f"Warning: Health check returned status {health_response.status_code}")
    except:
        print("Warning: Could not reach backend server.")
        print("Please ensure the backend is running (check Terminal 1).")
    
    success = test_complex_conversion()
    
    print("\n" + "=" * 60)
    print(f"Complex conversion test: {'PASS' if success else 'FAIL'}")
    print("=" * 60)
    
    if success:
        print("\nThe PDF to Word conversion successfully handled complex PDFs.")
        print("Check 'complex_test_output.docx' to verify all elements were preserved.")
    else:
        print("\nThe test failed or had warnings.")
        print("Check the output above for details.")

if __name__ == "__main__":
    main()