#!/usr/bin/env python3
import requests
import json

# Test the current validation rules
url = "http://localhost:8000/api/add-watermark"

# Create a simple test payload with diagonal position
files = {
    'file': ('test.pdf', b'%PDF-1.4 fake pdf content', 'application/pdf')
}

data = {
    'watermark_text': 'Test',
    'position': 'diagonal',
    'opacity': '50',  # Changed to integer
    'rotation': '0',
    'font_size': '24',
    'color': '#000000'
}

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 400:
        print(f"Response: {response.text}")
        # Check if error mentions diagonal
        if 'diagonal' in response.text.lower():
            print("✓ Backend recognizes 'diagonal' position")
        elif 'center, top-left, top-right, bottom-left, bottom-right' in response.text:
            print("✗ Backend still using OLD validation (doesn't include diagonal)")
        else:
            print("? Unknown validation error")
    elif response.status_code == 422:
        print(f"Response: {response.text[:200]}")
        # Check if it's position validation or other validation
        if 'position' in response.text.lower():
            print("Position validation error")
        else:
            print("Other validation error (not position)")
    elif response.status_code == 200:
        print("✓ Backend accepted 'diagonal' position and processed it")
    else:
        print(f"Unexpected response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")