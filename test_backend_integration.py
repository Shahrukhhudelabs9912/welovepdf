#!/usr/bin/env python3
"""
Test the backend PDF to Word endpoint with our improvements.
"""
import requests
import json
import io
import tempfile
from pathlib import Path
import time

def test_pdf_to_word_endpoint():
    """Test the PDF to Word endpoint with a sample PDF."""
    print("Testing PDF to Word endpoint with improved conversion...")
    
    # First, create a simple test PDF
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create a comprehensive test PDF
            pdf_path = temp_path / "test_comprehensive.pdf"
            
            doc = SimpleDocTemplate(str(pdf_path), pagesize=letter)
            elements = []
            
            styles = getSampleStyleSheet()
            
            # Add headings
            elements.append(Paragraph("Main Heading (H1)", styles['Heading1']))
            elements.append(Paragraph("This is a test PDF with various formatting elements.", styles['Normal']))
            
            elements.append(Paragraph("Subheading (H2)", styles['Heading2']))
            elements.append(Paragraph("This section contains formatted text.", styles['Normal']))
            
            # Add bold and italic text
            from reportlab.lib.enums import TA_CENTER
            from reportlab.lib.styles import ParagraphStyle
            
            # Create custom styles
            bold_style = ParagraphStyle(
                'BoldStyle',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=12,
                spaceAfter=12
            )
            
            italic_style = ParagraphStyle(
                'ItalicStyle',
                parent=styles['Normal'],
                fontName='Helvetica-Oblique',
                fontSize=11,
                textColor=colors.darkblue,
                spaceAfter=12
            )
            
            centered_style = ParagraphStyle(
                'CenteredStyle',
                parent=styles['Normal'],
                alignment=TA_CENTER,
                fontSize=12,
                spaceAfter=12
            )
            
            elements.append(Paragraph("This is bold text.", bold_style))
            elements.append(Paragraph("This is italic text in blue.", italic_style))
            elements.append(Paragraph("This text is centered.", centered_style))
            
            # Add a simple table
            elements.append(Paragraph("Sample Table:", styles['Heading3']))
            
            table_data = [
                ['Name', 'Age', 'Department'],
                ['John Doe', '30', 'Engineering'],
                ['Jane Smith', '28', 'Marketing'],
                ['Bob Johnson', '35', 'Sales']
            ]
            
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            
            elements.append(table)
            
            # Build PDF
            doc.build(elements)
            
            print(f"Created test PDF: {pdf_path}")
            print(f"PDF size: {pdf_path.stat().st_size} bytes")
            
            # Now test the endpoint
            url = "http://localhost:8000/api/pdf-to-word"
            
            with open(pdf_path, 'rb') as f:
                files = {'file': ('test_comprehensive.pdf', f, 'application/pdf')}
                
                print(f"\nSending request to {url}...")
                start_time = time.time()
                
                try:
                    response = requests.post(url, files=files, timeout=30)
                    elapsed = time.time() - start_time
                    
                    print(f"Response status: {response.status_code}")
                    print(f"Response time: {elapsed:.2f} seconds")
                    
                    if response.status_code == 200:
                        # Check response headers
                        content_type = response.headers.get('Content-Type', '')
                        content_disposition = response.headers.get('Content-Disposition', '')
                        
                        print(f"Content-Type: {content_type}")
                        print(f"Content-Disposition: {content_disposition}")
                        
                        # Check file size
                        docx_size = len(response.content)
                        print(f"DOCX file size: {docx_size} bytes")
                        
                        # Save the file for inspection
                        output_path = Path("test_backend_output.docx")
                        with open(output_path, 'wb') as out_f:
                            out_f.write(response.content)
                        
                        print(f"Saved output to: {output_path}")
                        
                        # Check if it's a valid DOCX
                        import zipfile
                        try:
                            with zipfile.ZipFile(output_path, 'r') as zipf:
                                file_list = zipf.namelist()
                                
                                # Check for essential DOCX files
                                essential_files = ['word/document.xml', '[Content_Types].xml', '_rels/.rels']
                                missing = [f for f in essential_files if f not in file_list]
                                
                                if not missing:
                                    print("[SUCCESS] Valid DOCX file generated")
                                    
                                    # Count tables in the output
                                    with zipf.open('word/document.xml') as xml_file:
                                        xml_content = xml_file.read().decode('utf-8', errors='ignore')
                                        table_count = xml_content.count('<w:tbl>')
                                        print(f"Tables in output: {table_count}")
                                        
                                    return True
                                else:
                                    print(f"[WARNING] Missing essential DOCX files: {missing}")
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
                    
    except ImportError as e:
        print(f"[ERROR] Could not import reportlab: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run the integration test."""
    print("=" * 60)
    print("Backend Integration Test for PDF to Word Conversion")
    print("=" * 60)
    
    print("\nNote: This test requires the backend server to be running.")
    print("Based on environment details, backend appears to be running.")
    print()
    
    # Check if server is reachable
    try:
        import requests
        health_response = requests.get("http://localhost:8000/health", timeout=5)
        if health_response.status_code == 200:
            print("Backend server is reachable (health check passed).")
        else:
            print(f"Warning: Health check returned status {health_response.status_code}")
    except:
        print("Warning: Could not reach backend server. It may not be running.")
        print("Please ensure the backend is running before continuing.")
    
    success = test_pdf_to_word_endpoint()
    
    print("\n" + "=" * 60)
    print(f"Integration test: {'PASS' if success else 'FAIL'}")
    print("=" * 60)
    
    if success:
        print("\nThe backend PDF to Word conversion is working correctly.")
        print("Check 'test_backend_output.docx' to verify formatting preservation.")
    else:
        print("\nThe test failed. Check the error messages above.")

if __name__ == "__main__":
    main()