import { NextRequest } from 'next/server';

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type - allow PDF only
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
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

    console.log(`[pdf-to-excel API] Forwarding to backend: ${file.name} (${fileBuffer.byteLength} bytes)`);

    // Call the backend API
    const backendResponse = await fetch(`${PYTHON_API_BASE}/pdf-to-excel`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[pdf-to-excel API] Backend error:', backendResponse.status, errorText);

      // Try to extract user-friendly message
      let errorMessage = `Conversion failed: ${backendResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      } catch {
        if (errorText && errorText.length < 200) {
          errorMessage = errorText;
        }
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: backendResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the response from backend
    const backendData = await backendResponse.arrayBuffer();

    // Get filename from backend response headers or generate one
    let filename = file.name.replace(/\.pdf$/i, '_converted.xlsx');
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }

    console.log(`[pdf-to-excel API] Returning: ${filename} (${backendData.byteLength} bytes)`);

    // Return the file from backend
    return new Response(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[pdf-to-excel API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to convert PDF to Excel',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';