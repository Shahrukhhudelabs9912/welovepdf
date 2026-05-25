import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log("[page-numbering API route] Received request");

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/page-numbering`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Page numbering failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Page numbering failed" },
        { status: response.status }
      );
    }

    // Return the numbered PDF blob
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || 'attachment; filename="numbered.pdf"';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[page-numbering API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to add page numbers. Please try again." },
      { status: 500 }
    );
  }
}