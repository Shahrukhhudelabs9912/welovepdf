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

    // Get split options from form data (field names match the split-pdf-client and backend)
    const splitMethod = formData.get('split_method') as string || 'all';
    const pageRange = formData.get('page_range') as string || '';
    const pagesPerSplit = formData.get('pages_per_split') as string || '';
    const specificPages = formData.get('specific_pages') as string || '';
    const outputFormat = formData.get('output_format') as string || 'individual';
    const namingPattern = formData.get('naming_pattern') as string || 'page_{n}.pdf';

    // Forward to Python backend
    const backendFormData = new FormData();
    const fileBuffer = await file.arrayBuffer();
    const blob = new Blob([fileBuffer], { type: file.type || 'application/pdf' });
    backendFormData.append('file', blob, file.name);
    backendFormData.append('split_method', splitMethod);
    backendFormData.append('output_format', outputFormat);
    backendFormData.append('naming_pattern', namingPattern);
    if (pageRange) backendFormData.append('page_range', pageRange);
    if (pagesPerSplit) backendFormData.append('pages_per_split', pagesPerSplit);
    if (specificPages) backendFormData.append('specific_pages', specificPages);

    console.log(`[split-pdf API] Forwarding to backend: ${file.name} (method: ${splitMethod})`);

    const backendResponse = await fetch(`${PYTHON_API_BASE}/split-pdf`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[split-pdf API] Backend error:', backendResponse.status, errorText);

      let errorMessage = `Split failed: ${backendResponse.status}`;
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

    // Determine content type - could be PDF or ZIP
    const contentType = backendResponse.headers.get('content-type') || 'application/pdf';

    let filename = `split-${Date.now()}.pdf`;
    const contentDisposition = backendResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        filename = match[1];
      }
    } else if (contentType.includes('zip')) {
      filename = `split-pages-${Date.now()}.zip`;
    }

    console.log(`[split-pdf API] Returning: ${filename} (${backendData.byteLength} bytes, ${contentType})`);

    return new Response(backendData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(backendData.byteLength),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[split-pdf API] Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to split PDF file',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'nodejs';