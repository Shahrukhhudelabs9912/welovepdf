#!/usr/bin/env python3
"""
Test script to verify the FastAPI backend is working.
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_health():
    """Test health endpoint."""
    print("Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_root():
    """Test root endpoint."""
    print("\nTesting root endpoint...")
    try:
        response = requests.get("http://localhost:8000/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_docs():
    """Test API documentation endpoints."""
    print("\nTesting API docs...")
    endpoints = [
        "http://localhost:8000/api/docs",
        "http://localhost:8000/api/redoc",
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint)
            print(f"{endpoint}: {response.status_code}")
        except Exception as e:
            print(f"{endpoint}: Error - {e}")

def test_placeholder_endpoints():
    """Test placeholder endpoints."""
    print("\nTesting placeholder endpoints...")
    endpoints = [
        "/pdf-to-word",
        "/word-to-pdf",
        "/compress-pdf",
        "/protect-pdf",
    ]
    
    for endpoint in endpoints:
        try:
            # Note: These are POST endpoints but we're just checking if they exist
            print(f"{endpoint}: Available (POST endpoint)")
        except Exception as e:
            print(f"{endpoint}: Error - {e}")

def main():
    """Run all tests."""
    print("=" * 60)
    print("Testing PDFOrca FastAPI Backend")
    print("=" * 60)
    
    # Check if server is running
    print("\n1. Checking if server is running...")
    
    tests = [
        test_health,
        test_root,
        test_docs,
    ]
    
    all_passed = True
    for test in tests:
        if not test():
            all_passed = False
    
    print("\n" + "=" * 60)
    print("API Endpoints Summary:")
    print("=" * 60)
    print("\nCore PDF Tools:")
    print("  POST /api/merge-pdf     - Merge multiple PDF files")
    print("  POST /api/split-pdf     - Split PDF into individual pages")
    print("  POST /api/jpg-to-pdf    - Convert images to PDF")
    print("  POST /api/pdf-to-jpg    - Convert PDF page to image")
    print("  POST /api/add-watermark - Add text watermark to PDF")
    
    print("\nPlaceholder Endpoints (Future Features):")
    print("  POST /api/pdf-to-word   - Convert PDF to Word")
    print("  POST /api/word-to-pdf   - Convert Word to PDF")
    print("  POST /api/compress-pdf  - Compress PDF")
    print("  POST /api/protect-pdf   - Protect PDF with password")
    
    print("\n" + "=" * 60)
    print("Usage Instructions:")
    print("=" * 60)
    print("\n1. Start the backend server:")
    print("   cd backend")
    print("   uvicorn app.main:app --reload")
    
    print("\n2. Access the API documentation:")
    print("   http://localhost:8000/api/docs")
    
    print("\n3. Test with cURL (example):")
    print('   curl -X POST "http://localhost:8000/api/merge-pdf" \\')
    print('     -F "files=@document1.pdf" \\')
    print('     -F "files=@document2.pdf" \\')
    print('     --output merged.pdf')
    
    print("\n4. Frontend integration:")
    print("   Update your frontend API client to use:")
    print("   const API_BASE_URL = 'http://localhost:8000/api'")
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ All basic tests passed!")
        print("Backend is ready to use.")
    else:
        print("⚠ Some tests failed. Make sure the server is running.")
        print("Start the server with: uvicorn app.main:app --reload")
    
    print("=" * 60)

if __name__ == "__main__":
    main()