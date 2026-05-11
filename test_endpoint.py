import requests
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Create a test PDF with actual content
def create_test_pdf():
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Add some actual text content
    c.drawString(100, 750, "Real PDF Content for Testing")
    c.drawString(100, 730, "This is actual text that should appear in the Word document.")
    c.drawString(100, 710, "It contains multiple lines with meaningful content.")
    c.drawString(100, 690, "Page 1 of the test document.")
    c.showPage()
    
    # Second page
    c.drawString(100, 750, "Second Page Content")
    c.drawString(100, 730, "More real text that should be extracted.")
    c.drawString(100, 710, "This tests the PDF to Word conversion.")
    c.drawString(100, 690, "End of test document.")
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()

# Test the endpoint
def test_pdf_to_word_endpoint():
    print("Testing PDF to Word endpoint...")
    
    # Create test PDF
    pdf_content = create_test_pdf()
    print(f"Created test PDF with {len(pdf_content)} bytes")
    
    # Prepare the request
    files = {'file': ('test_document.pdf', pdf_content, 'application/pdf')}
    
    try:
        response = requests.post('http://localhost:8000/api/pdf-to-word', files=files)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            # Save the response to a file
            output_filename = response.headers.get('Content-Disposition', '').split('filename=')[-1].strip('"')
            if not output_filename:
                output_filename = 'converted_document.docx'
            
            with open(output_filename, 'wb') as f:
                f.write(response.content)
            
            print(f"Success! Saved to {output_filename} ({len(response.content)} bytes)")
            
            # Check if it's a valid .docx file
            import zipfile
            try:
                with zipfile.ZipFile(io.BytesIO(response.content)) as zipf:
                    print(f"Valid .docx file with {len(zipf.namelist())} files")
                    
                    # Check if document.xml contains our text
                    if 'word/document.xml' in zipf.namelist():
                        xml_content = zipf.read('word/document.xml').decode('utf-8')
                        if "Real PDF Content" in xml_content:
                            print("SUCCESS: Actual PDF content found in Word document")
                        else:
                            print("FAIL: PDF content not found in Word document")
                            print(f"XML snippet: {xml_content[:500]}...")
            except Exception as e:
                print(f"Error checking .docx file: {e}")
        else:
            print(f"Error response: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_pdf_to_word_endpoint()