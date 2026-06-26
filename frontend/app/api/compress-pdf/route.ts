import { NextRequest } from 'next/server';

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://localhost:8000/api';

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

    // Get compression level from form data
    const compressionLevel = formData.get('compression_level') as string || 'medium';

    // Forward to Python backend
    const backendFormData = new FormData();
    const fileBuffer = await file.arrayBuffer();
    const blob = new Blob([fileBuffer], { type: file.type || 'application/pdf' });
    backendFormData.append('file', blob, file.name);
    backendFormData.append('compression_level', compressionLevel);

    console.log(`[compress-pdf API] Forwarding to backend: ${file.name} (${fileBuffer.byteLength} bytes, ${compressionLevel})`);

    const backendResponse = await fetch(`${PYTHON_API_BASE}/compress-pdf`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[compress-pdf API] Backend error:', backendResponse.status, errorText);

      let errorMessage = `Compression failed: ${backendResponse.status}`;
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

    const backendData = await backendResponse.arrayBuffer();

    let filename = file.name.replace(/\.pdf$/i, '_compressed.pdf');
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }

    console.log(`[compress-pdf API] Returning: ${filename} (${backendData.byteLength} bytes)`);

    return new Response(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(backendData.byteLength),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[compress-pdf API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to compress PDF',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';