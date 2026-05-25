import { NextRequest } from 'next/server';

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

    // Extract conversion settings from formData
    const quality = formData.get('quality') as string || '85';
    const dpi = formData.get('dpi') as string || '150';
    const pageNumber = formData.get('page_number') as string || '0';

    console.log(`[pdf-to-jpg API] Settings: quality=${quality}, dpi=${dpi}, page_number=${pageNumber}`);

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Create form data to send to backend
    const backendFormData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    backendFormData.append('file', blob, file.name);
    backendFormData.append('quality', quality);
    backendFormData.append('dpi', dpi);
    backendFormData.append('page_number', pageNumber);

    console.log(`[pdf-to-jpg API] Forwarding to backend: ${file.name} (${fileBuffer.byteLength} bytes)`);

    // Call the backend API
    const backendResponse = await fetch('http://localhost:8000/api/pdf-to-jpg', {
      method: 'POST',
      body: backendFormData,
      // Don't set Content-Type header - let browser set it with boundary
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[pdf-to-jpg API] Backend error:', backendResponse.status, errorText);
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
    let filename = file.name.replace(/\.pdf$/i, '_converted.jpg');
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }

    // Determine content type based on filename extension
    const contentType = filename.endsWith('.zip')
      ? 'application/zip'
      : 'image/jpeg';

    console.log(`[pdf-to-jpg API] Returning: ${filename} (${backendData.byteLength} bytes, ${contentType})`);

    // Return the file from backend
    return new Response(backendData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[pdf-to-jpg API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to convert PDF to JPG',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';