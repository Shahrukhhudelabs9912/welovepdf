import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log("[organize-pdf API route] Received request");

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/organize-pdf`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "PDF organization failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "PDF organization failed" },
        { status: response.status }
      );
    }

    // Return the organized PDF blob
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || 'attachment; filename="organized.pdf"';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[organize-pdf API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to organize PDF. Please try again." },
      { status: 500 }
    );
  }
}