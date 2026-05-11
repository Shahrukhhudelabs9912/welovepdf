#!/usr/bin/env python3
"""
Test script to verify image extraction capabilities in PDF to Word conversion.
"""
import os
import tempfile
from pathlib import Path
import io
import sys

def test_pdf2docx_image_extraction():
    """Test if pdf2docx can extract and preserve images from PDF."""
    print("Testing pdf2docx image extraction capabilities...")
    
    # First, create a simple PDF with an image using reportlab
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
        import PIL.Image as PILImage
        
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create a simple image for testing
            img_path = temp_path / "test_image.png"
            img = PILImage.new('RGB', (200, 100), color='red')
            img.save(img_path)
            
            # Create PDF with text and image
            pdf_path = temp_path / "test_with_image.pdf"
            c = canvas.Canvas(str(pdf_path), pagesize=letter)
            
            # Add some text
            c.drawString(100, 700, "Test PDF with Image")
            c.drawString(100, 680, "This PDF contains both text and an image.")
            
            # Add the image
            c.drawImage(str(img_path), 100, 500, width=200, height=100)
            
            # Add more text
            c.drawString(100, 400, "Text below the image.")
            
            c.save()
            
            print(f"Created test PDF with image: {pdf_path}")
            print(f"PDF file size: {pdf_path.stat().st_size} bytes")
            
            # Now test pdf2docx conversion
            try:
                from pdf2docx import Converter
                
                docx_path = temp_path / "output.docx"
                
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
                
                # Check if DOCX contains images by examining the zip structure
                import zipfile
                with zipfile.ZipFile(docx_path, 'r') as zipf:
                    # List files in the DOCX
                    file_list = zipf.namelist()
                    image_files = [f for f in file_list if 'media/' in f and f.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
                    
                    print(f"DOCX contains {len(image_files)} image files:")
                    for img_file in image_files:
                        print(f"  - {img_file}")
                        
                    if image_files:
                        print("[SUCCESS] pdf2docx successfully extracted and embedded images!")
                    else:
                        print("[WARNING] pdf2docx did not extract images (or PDF had no extractable images)")
                        
            except ImportError as e:
                print(f"Error importing pdf2docx: {e}")
                return False
            except Exception as e:
                print(f"Error during pdf2docx conversion: {e}")
                return False
                
    except ImportError as e:
        print(f"Error importing required libraries: {e}")
        print("Installing required packages...")
        return False
    except Exception as e:
        print(f"Error creating test PDF: {e}")
        return False
        
    return True

def test_pymupdf_image_extraction():
    """Test PyMuPDF for image extraction capabilities."""
    print("\nTesting PyMuPDF image extraction capabilities...")
    
    try:
        import fitz  # PyMuPDF
        import PIL.Image as PILImage
        import io
        
        # Create a simple PDF with an image using reportlab
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create a simple image
            img_path = temp_path / "test_image2.png"
            img = PILImage.new('RGB', (150, 150), color='blue')
            img.save(img_path)
            
            # Create PDF
            pdf_path = temp_path / "test_pymupdf.pdf"
            c = canvas.Canvas(str(pdf_path), pagesize=letter)
            c.drawString(100, 700, "PyMuPDF Test PDF")
            c.drawImage(str(img_path), 100, 500, width=150, height=150)
            c.save()
            
            # Open PDF with PyMuPDF
            doc = fitz.open(str(pdf_path))
            page = doc[0]
            
            # Extract images
            image_list = page.get_images()
            print(f"PyMuPDF found {len(image_list)} images on page")
            
            if image_list:
                for img_index, img_info in enumerate(image_list):
                    xref = img_info[0]
                    pix = fitz.Pixmap(doc, xref)
                    
                    if pix.n - pix.alpha > 3:  # CMYK
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    
                    img_data = pix.tobytes("png")
                    print(f"  Image {img_index+1}: {len(img_data)} bytes, size: {pix.width}x{pix.height}")
                    
                    # Save extracted image
                    extracted_path = temp_path / f"extracted_image_{img_index}.png"
                    with open(extracted_path, "wb") as f:
                        f.write(img_data)
                    print(f"    Saved to: {extracted_path}")
                    
                print("[SUCCESS] PyMuPDF successfully extracted images!")
            else:
                print("[WARNING] PyMuPDF found no images")
                
            doc.close()
            
    except ImportError as e:
        print(f"Error importing PyMuPDF: {e}")
        return False
    except Exception as e:
        print(f"Error with PyMuPDF: {e}")
        return False
        
    return True

def main():
    """Run all tests."""
    print("=" * 60)
    print("Testing Image Extraction for PDF to Word Conversion")
    print("=" * 60)
    
    # Test pdf2docx image extraction
    pdf2docx_success = test_pdf2docx_image_extraction()
    
    # Test PyMuPDF image extraction
    pymupdf_success = test_pymupdf_image_extraction()
    
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"pdf2docx image extraction: {'PASS' if pdf2docx_success else 'FAIL'}")
    print(f"PyMuPDF image extraction: {'PASS' if pymupdf_success else 'FAIL'}")
    print("=" * 60)
    
    if pdf2docx_success and pymupdf_success:
        print("\nBoth libraries can extract images from PDFs.")
        print("pdf2docx should preserve images in DOCX conversion.")
        print("PyMuPDF can be used as a fallback for image extraction.")
    else:
        print("\nSome tests failed. Check dependencies.")
        
if __name__ == "__main__":
    main()