import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/extract-pages`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Page extraction failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Page extraction failed" },
        { status: response.status },
      );
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || 'attachment; filename="extracted.pdf"';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[extract-pages API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to extract pages. Please try again." },
      { status: 500 },
    );
  }
}
