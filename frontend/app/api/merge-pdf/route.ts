import { NextRequest } from 'next/server';

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get files - check both 'files' (multiple) and 'file' (single)
    const filesArray = formData.getAll('files');
    const fileArray = formData.getAll('file');
    const rawFiles = filesArray.length > 0 ? filesArray : fileArray;

    if (rawFiles.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (rawFiles.length < 2) {
      return new Response(JSON.stringify({ error: 'At least 2 PDF files are required for merging' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const f of rawFiles) {
      const file = f as File;
      backendFormData.append('files', file, file.name);
    }

    console.log(`[merge-pdf API] Forwarding ${rawFiles.length} files to backend`);

    const backendResponse = await fetch(`${PYTHON_API_BASE}/merge-pdf`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[merge-pdf API] Backend error:', backendResponse.status, errorText);

      let errorMessage = `Merge failed: ${backendResponse.status}`;
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

    let filename = `merged-${Date.now()}.pdf`;
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }

    console.log(`[merge-pdf API] Returning: ${filename} (${backendData.byteLength} bytes)`);

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
    console.error('[merge-pdf API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to merge PDF files',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';