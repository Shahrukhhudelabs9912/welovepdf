import { NextRequest } from 'next/server';

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://localhost:8000/api';

// High-DPI / high-quality renders of large PDFs can take several minutes
// on a single backend worker. We give the upstream call a 10-minute window
// before giving up — anything longer is almost certainly a hung request,
// not a slow one.
const BACKEND_TIMEOUT_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const quality = (formData.get('quality') as string) || '85';
    const dpi = (formData.get('dpi') as string) || '150';
    const pageNumber = (formData.get('page_number') as string) || '0';

    console.log(
      `[pdf-to-jpg API] Settings: quality=${quality}, dpi=${dpi}, page_number=${pageNumber}`,
    );

    const fileBuffer = await file.arrayBuffer();

    const backendFormData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    backendFormData.append('file', blob, file.name);
    backendFormData.append('quality', quality);
    backendFormData.append('dpi', dpi);
    backendFormData.append('page_number', pageNumber);

    console.log(
      `[pdf-to-jpg API] Forwarding to backend: ${file.name} (${fileBuffer.byteLength} bytes)`,
    );

    // Explicit AbortController with a generous timeout. The default fetch
    // timeout in Node.js can kill long-running requests prematurely; 300dpi
    // + quality 100 renders of multi-page PDFs routinely take 5+ minutes.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${PYTHON_API_BASE}/pdf-to-jpg`, {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const isAbort =
        fetchErr instanceof DOMException && fetchErr.name === 'AbortError';
      console.error(
        '[pdf-to-jpg API] Backend fetch failed:',
        isAbort ? `aborted after ${BACKEND_TIMEOUT_MS}ms` : fetchErr,
      );
      return new Response(
        JSON.stringify({
          error: isAbort
            ? 'Conversion timed out. Try a lower DPI or quality setting.'
            : 'Could not reach the conversion service.',
          details: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
        }),
        { status: 504, headers: { 'Content-Type': 'application/json' } },
      );
    }
    clearTimeout(timeoutId);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(
        '[pdf-to-jpg API] Backend error:',
        backendResponse.status,
        errorText,
      );
      return new Response(
        JSON.stringify({
          error: `Backend conversion failed: ${backendResponse.status}`,
          details: errorText,
        }),
        {
          status: backendResponse.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const backendData = await backendResponse.arrayBuffer();

    let filename = file.name.replace(/\.pdf$/i, '_converted.jpg');
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    }

    const contentType = filename.endsWith('.zip') ? 'application/zip' : 'image/jpeg';

    console.log(
      `[pdf-to-jpg API] Returning: ${filename} (${backendData.byteLength} bytes, ${contentType})`,
    );

    return new Response(backendData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[pdf-to-jpg API] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to convert PDF to JPG',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

// Force Node.js runtime — Edge runtime has a hard 30-second timeout that
// would kill long-running PDF conversions immediately.
export const runtime = 'nodejs';
// Disable Next.js dynamic-route caching — every conversion is fresh.
export const dynamic = 'force-dynamic';
// Allow this serverless invocation to run up to 10 minutes (matches our
// upstream timeout). Required so Vercel/Node.js doesn't kill the process
// while the backend is still rendering.
export const maxDuration = 600;
