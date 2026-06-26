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

    // Validate file type - allow Word documents
    const validTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream',
    ];
    const validExtensions = ['.doc', '.docx'];
    const isValidType = validTypes.includes(file.type);
    const isValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType && !isValidExt) {
      return new Response(JSON.stringify({ error: 'File must be a Word document (.doc or .docx)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Create form data to send to backend
    const backendFormData = new FormData();
    const blob = new Blob([fileBuffer], { type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    backendFormData.append('file', blob, file.name);

    console.log(`[word-to-pdf API] Forwarding to backend: ${file.name} (${fileBuffer.byteLength} bytes)`);

    // Call the backend API
    const backendResponse = await fetch(`${PYTHON_API_BASE}/word-to-pdf`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[word-to-pdf API] Backend error:', backendResponse.status, errorText);

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
    let filename = file.name.replace(/\.(doc|docx)$/i, '_converted.pdf');
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }

    console.log(`[word-to-pdf API] Returning: ${filename} (${backendData.byteLength} bytes)`);

    // Return the file from backend
    return new Response(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[word-to-pdf API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to convert Word to PDF',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';