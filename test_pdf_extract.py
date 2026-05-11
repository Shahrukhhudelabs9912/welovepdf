import sys
sys.path.append('backend')

from app.routes.pdf_routes import create_simulated_word_document
import PyPDF2
import io

# Create a test PDF with some text
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Create a PDF with text
buffer = io.BytesIO()
c = canvas.Canvas(buffer, pagesize=letter)
c.drawString(100, 750, "Test PDF Document")
c.drawString(100, 730, "This is a test PDF file for conversion.")
c.drawString(100, 710, "It contains sample text that should be extracted.")
c.drawString(100, 690, "Page 1 content.")
c.showPage()
c.drawString(100, 750, "Second Page")
c.drawString(100, 730, "More sample text on page 2.")
c.save()

pdf_bytes = buffer.getvalue()
print(f"Created test PDF with {len(pdf_bytes)} bytes")

# Test text extraction with PyPDF2 directly
print("\nTesting PyPDF2 text extraction:")
try:
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    num_pages = len(pdf_reader.pages)
    print(f"Number of pages: {num_pages}")
    
    for page_num in range(num_pages):
        page = pdf_reader.pages[page_num]
        text = page.extract_text()
        print(f"Page {page_num + 1} text: {text[:100]}...")
except Exception as e:
    print(f"Error: {e}")

# Test the create_simulated_word_document function
print("\nTesting create_simulated_word_document function:")
try:
    docx_bytes = create_simulated_word_document(pdf_bytes, "test_document.pdf")
    print(f"Generated .docx file size: {len(docx_bytes)} bytes")
    
    # Check if it's a valid ZIP file
    import zipfile
    with zipfile.ZipFile(io.BytesIO(docx_bytes)) as zipf:
        print(f"Valid ZIP file with {len(zipf.namelist())} files")
        
        # Read the document.xml to check content
        if 'word/document.xml' in zipf.namelist():
            xml_content = zipf.read('word/document.xml').decode('utf-8')
            # Check if our test text is in the XML
            if "Test PDF Document" in xml_content:
                print("✓ PDF text successfully included in Word document")
            else:
                print("✗ PDF text not found in Word document")
                # Print a snippet of the XML
                print(f"XML snippet: {xml_content[:500]}...")
                
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

# Save the generated .docx for manual inspection
with open('test_with_content.docx', 'wb') as f:
    f.write(docx_bytes)
print(f"\nSaved to test_with_content.docx for manual inspection")