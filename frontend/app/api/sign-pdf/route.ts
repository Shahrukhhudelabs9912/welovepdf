import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/sign-pdf`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Signing failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Signing failed" },
        { status: response.status },
      );
    }

    const blob = await response.blob();
    const cd = response.headers.get("content-disposition") || 'attachment; filename="signed.pdf"';
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": cd,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[sign-pdf API route] Error:", error);
    return NextResponse.json({ error: "Failed to sign PDF." }, { status: 500 });
  }
}
