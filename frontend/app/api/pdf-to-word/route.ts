import { NextRequest } from 'next/server';

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: 'File must be a PDF' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Create form data to send to backend
    const backendFormData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    backendFormData.append('file', blob, file.name);
    
    // Call the backend API
    const backendResponse = await fetch(`${PYTHON_API_BASE}/pdf-to-word`, {
      method: 'POST',
      body: backendFormData,
      // Don't set Content-Type header - let browser set it with boundary
    });
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error:', backendResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Backend conversion failed: ${backendResponse.status}`,
        details: errorText
      }), {
        status: backendResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the response from backend
    const backendData = await backendResponse.arrayBuffer();
    
    // Get filename from backend response headers or generate one
    let filename = file.name.replace(/\.pdf$/i, '_converted.docx');
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }
    
    // Return the file from backend
    return new Response(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error in PDF to Word conversion:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to convert PDF to Word',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';