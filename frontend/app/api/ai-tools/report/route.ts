import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log("[ai-tools/report API route] Received report generation request");

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/ai-tools/report`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Report generation failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Report generation failed" },
        { status: response.status }
      );
    }

    // Return the DOCX blob
    const blob = await response.blob();
    const contentDisposition =
      response.headers.get("content-disposition") ||
      'attachment; filename="ai-analysis-report.docx"';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(blob.size),
      },
    });
  } catch (error) {
    console.error("[ai-tools/report API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate report. Please try again." },
      { status: 500 }
    );
  }
}