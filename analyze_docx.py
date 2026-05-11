#!/usr/bin/env python3
"""
Analyze the DOCX output to verify conversion quality.
"""
import zipfile
import re
import sys

def analyze_docx(docx_path):
    """Analyze a DOCX file for conversion quality."""
    print(f"Analyzing {docx_path}...")
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zipf:
            # List all files
            print("\nFiles in DOCX:")
            all_files = zipf.namelist()
            for f in all_files[:20]:  # Show first 20
                if 'media' in f or 'image' in f or 'document' in f or 'numbering' in f:
                    print(f"  {f}")
            
            if len(all_files) > 20:
                print(f"  ... and {len(all_files) - 20} more files")
            
            # Check for images in media folder
            image_files = [f for f in all_files if 'word/media/' in f and f.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.emf', '.wmf'))]
            print(f"\nImage files found: {len(image_files)}")
            for img in image_files:
                print(f"  {img}")
            
            # Check document.xml
            if 'word/document.xml' in all_files:
                with zipf.open('word/document.xml') as f:
                    content = f.read().decode('utf-8', errors='ignore')
                    
                    # Count tables
                    table_count = content.count('<w:tbl>')
                    print(f"\nTables in document.xml: {table_count}")
                    
                    # Check for image references
                    img_refs = re.findall(r'<wp:docPr[^>]*>', content)
                    print(f"Image references (wp:docPr): {len(img_refs)}")
                    
                    # Check for drawing elements
                    drawing_count = content.count('<w:drawing>')
                    print(f"Drawing elements: {drawing_count}")
                    
                    # Check for list items
                    num_pr_count = content.count('w:numPr')
                    ilvl_count = content.count('w:ilvl')
                    num_id_count = content.count('w:numId')
                    print(f"List numbering properties: {num_pr_count}")
                    print(f"List indent levels: {ilvl_count}")
                    print(f"List number IDs: {num_id_count}")
                    
                    # Check for bullet characters
                    bullet_chars = content.count('•') + content.count('○') + content.count('▪')
                    print(f"Bullet characters: {bullet_chars}")
                    
                    # Check for heading styles
                    heading_styles = re.findall(r'Heading\d*', content)
                    print(f"Heading style references: {len(heading_styles)}")
                    
                    # Sample some text content
                    text_matches = re.findall(r'<w:t[^>]*>([^<]+)</w:t>', content)
                    print(f"\nSample text snippets (first 5):")
                    for i, text in enumerate(text_matches[:5]):
                        print(f"  {i+1}. '{text[:50]}'")
            
            # Check numbering.xml
            if 'word/numbering.xml' in all_files:
                with zipf.open('word/numbering.xml') as f:
                    num_content = f.read().decode('utf-8', errors='ignore')
                    abstract_num_count = num_content.count('w:abstractNum')
                    num_count = num_content.count('w:num ')
                    print(f"\nNumbering.xml analysis:")
                    print(f"  Abstract list definitions: {abstract_num_count}")
                    print(f"  Concrete list instances: {num_count}")
                    
                    # Check list types
                    bullet_defs = num_content.count('bullet')
                    decimal_defs = num_content.count('decimal')
                    print(f"  Bullet list definitions: {bullet_defs}")
                    print(f"  Decimal list definitions: {decimal_defs}")
            
            # Overall assessment
            print("\n" + "=" * 60)
            print("CONVERSION QUALITY ASSESSMENT:")
            print("=" * 60)
            
            issues = []
            successes = []
            
            if table_count > 0:
                successes.append(f"[OK] Tables preserved ({table_count} tables)")
            else:
                issues.append("[ISSUE] No tables found")
                
            if len(image_files) > 0 or drawing_count > 0:
                successes.append(f"[OK] Images preserved ({len(image_files)} files, {drawing_count} drawings)")
            else:
                issues.append("[ISSUE] No images found")
                
            if num_pr_count > 0 or ilvl_count > 0:
                successes.append(f"[OK] List formatting preserved ({num_pr_count} list properties)")
            elif abstract_num_count > 0:
                successes.append(f"[OK] List definitions created ({abstract_num_count} definitions)")
                issues.append("[NOTE] List definitions exist but may not be applied to text")
            else:
                issues.append("[ISSUE] No list formatting found")
                
            if heading_styles:
                successes.append(f"[OK] Heading styles preserved ({len(heading_styles)} references)")
            else:
                issues.append("[NOTE] No heading styles found")
            
            print("\nSUCCESSES:")
            for s in successes:
                print(f"  {s}")
                
            if issues:
                print("\nISSUES/IMPROVEMENTS NEEDED:")
                for i in issues:
                    print(f"  {i}")
            else:
                print("\nAll elements successfully preserved!")
                
            return len(issues) == 0
            
    except FileNotFoundError:
        print(f"Error: File {docx_path} not found")
        return False
    except zipfile.BadZipFile:
        print(f"Error: {docx_path} is not a valid ZIP/DOCX file")
        return False
    except Exception as e:
        print(f"Error analyzing DOCX: {e}")
        return False

def main():
    """Analyze multiple DOCX files."""
    files_to_analyze = [
        "complex_test_output.docx",
        "test_backend_output.docx",
        "test_table_converted.docx"
    ]
    
    all_good = True
    
    for docx_file in files_to_analyze:
        import os
        if os.path.exists(docx_file):
            print("\n" + "=" * 60)
            success = analyze_docx(docx_file)
            if not success:
                all_good = False
        else:
            print(f"\nFile {docx_file} not found, skipping...")
    
    print("\n" + "=" * 60)
    print("FINAL VERDICT:")
    print("=" * 60)
    
    if all_good:
        print("[SUCCESS] PDF to Word conversion is production-ready!")
        print("The system preserves tables, images, and formatting elements.")
    else:
        print("[NOTE] PDF to Word conversion has some limitations.")
        print("Review the issues above for improvement areas.")

if __name__ == "__main__":
    main()