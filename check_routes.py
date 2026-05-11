#!/usr/bin/env python3
"""Check registered routes in the FastAPI application."""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def check_openapi_spec():
    """Check the OpenAPI spec for registered routes."""
    try:
        response = requests.get(f"{BASE_URL}/api/docs/openapi.json", timeout=10)
        if response.status_code == 200:
            spec = response.json()
            
            print("Checking for optimization endpoints in OpenAPI spec...")
            
            # Check paths
            paths = spec.get('paths', {})
            
            optimization_endpoints = [
                '/api/fix-scanned-pdf',
                '/api/optimize-pdf', 
                '/api/prepare-print-pdf',
                '/api/rotate-pdf'
            ]
            
            for endpoint in optimization_endpoints:
                if endpoint in paths:
                    methods = list(paths[endpoint].keys())
                    print(f"✓ Found {endpoint} with methods: {methods}")
                else:
                    print(f"✗ Missing {endpoint}")
                    
            # List all PDF endpoints
            print("\nAll PDF endpoints:")
            pdf_endpoints = [path for path in paths.keys() if 'pdf' in path.lower()]
            for path in sorted(pdf_endpoints):
                methods = list(paths[path].keys())
                print(f"  {path}: {methods}")
                
        else:
            print(f"Failed to get OpenAPI spec: {response.status_code}")
            
    except Exception as e:
        print(f"Error checking OpenAPI spec: {e}")

def test_endpoint_directly(endpoint):
    """Test an endpoint directly with a HEAD request."""
    try:
        response = requests.head(f"{BASE_URL}{endpoint}", timeout=5)
        print(f"{endpoint}: HTTP {response.status_code}")
        return response.status_code != 404
    except Exception as e:
        print(f"{endpoint}: Error - {e}")
        return False

def main():
    print("Checking backend routes...")
    
    # Check OpenAPI spec
    check_openapi_spec()
    
    print("\n" + "="*60)
    print("Direct endpoint tests:")
    
    # Test endpoints directly
    endpoints = [
        '/api/fix-scanned-pdf',
        '/api/optimize-pdf',
        '/api/prepare-print-pdf',
        '/api/rotate-pdf',
        '/api/compress-pdf',
        '/api/merge-pdf'
    ]
    
    for endpoint in endpoints:
        test_endpoint_directly(endpoint)

if __name__ == "__main__":
    main()