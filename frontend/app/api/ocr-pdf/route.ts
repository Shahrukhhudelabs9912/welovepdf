import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || "http://localhost:8000/api";

// OCR can take a minute or two on multi-page scans. Give the upstream
// call a generous window.
const BACKEND_TIMEOUT_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${PYTHON_API_BASE}/ocr-pdf`, {
        method: "POST",
        body: backendFormData,
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const isAbort = fetchErr instanceof DOMException && fetchErr.name === "AbortError";
      return NextResponse.json(
        {
          error: isAbort
            ? "OCR timed out. Try a smaller PDF or fewer pages."
            : "Could not reach the OCR service.",
        },
        { status: 504 },
      );
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "OCR failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "OCR failed" },
        { status: response.status },
      );
    }

    const blob = await response.blob();
    const cd = response.headers.get("content-disposition") || 'attachment; filename="searchable.pdf"';
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": cd,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[ocr-pdf API route] Error:", error);
    return NextResponse.json({ error: "Failed to OCR PDF." }, { status: 500 });
  }
}
