import { NextRequest } from 'next/server';

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Log all keys for debugging
    const keys: string[] = [];
    for (const key of formData.keys()) {
      keys.push(key);
    }
    console.log('[jpg-to-pdf API] FormData keys:', keys);

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

    // Validate all files are images
    for (const f of rawFiles) {
      const file = f as File;
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif'];
      const isValidType = validTypes.includes(file.type);
      const isValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isValidType && !isValidExt && file.type !== 'application/octet-stream') {
        return new Response(JSON.stringify({
          error: `File "${file.name}" is not a supported image format. Please use JPG, PNG, WebP, BMP, or TIFF.`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const f of rawFiles) {
      const file = f as File;
      backendFormData.append('files', file, file.name);
    }

    console.log(`[jpg-to-pdf API] Forwarding ${rawFiles.length} image(s) to backend`);

    const backendResponse = await fetch(`${PYTHON_API_BASE}/jpg-to-pdf`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[jpg-to-pdf API] Backend error:', backendResponse.status, errorText);

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
    let filename = 'converted-images.pdf';
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }

    console.log(`[jpg-to-pdf API] Returning: ${filename} (${backendData.byteLength} bytes)`);

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
    console.error('[jpg-to-pdf API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to convert images to PDF',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';