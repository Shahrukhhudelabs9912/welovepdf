import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log("[prepare-print-pdf API route] Received request");

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/prepare-print-pdf`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to prepare PDF for printing" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Failed to prepare PDF for printing" },
        { status: response.status }
      );
    }

    // Return the processed PDF blob
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || 'attachment; filename="print_ready.pdf"';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[prepare-print-pdf API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to prepare PDF for printing. Please try again." },
      { status: 500 }
    );
  }
}