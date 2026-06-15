import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log("[fix-scanned-pdf API route] Received request");

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/fix-scanned-pdf`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to fix scanned PDF" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Failed to fix scanned PDF" },
        { status: response.status }
      );
    }

    // Return the processed PDF blob
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || 'attachment; filename="fixed.pdf"';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[fix-scanned-pdf API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to fix scanned PDF. Please try again." },
      { status: 500 }
    );
  }
}