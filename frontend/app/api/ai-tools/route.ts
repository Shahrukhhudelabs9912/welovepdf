import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log("[ai-tools API route] Received request");

    // Forward to Python backend
    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(`${PYTHON_API_BASE}/ai-tools`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "AI analysis failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "AI analysis failed" },
        { status: response.status }
      );
    }

    // Return JSON analysis results
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[ai-tools API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze PDF. Please try again." },
      { status: 500 }
    );
  }
}