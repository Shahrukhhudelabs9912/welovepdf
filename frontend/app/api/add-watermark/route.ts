import { NextRequest } from 'next/server';

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log('[add-watermark API] Received request');

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    console.log(`[add-watermark API] Forwarding to backend`);

    const response = await fetch(`${PYTHON_API_BASE}/add-watermark`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Watermark failed' }));
      return new Response(JSON.stringify({
        error: errorData.detail || errorData.message || 'Watermark failed'
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the watermarked PDF blob
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="watermarked.pdf"';

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Content-Length': String(blob.size),
      },
    });

  } catch (error) {
    console.error('[add-watermark API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to add watermark',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';