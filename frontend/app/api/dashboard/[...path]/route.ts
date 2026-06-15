import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = Array.isArray(path) ? path.join("/") : path;
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${PYTHON_API_BASE}/dashboard/${pathname}${searchParams ? `?${searchParams}` : ""}`;

    // Forward authorization header
    const authHeader = request.headers.get("Authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Dashboard request failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[dashboard API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathname = Array.isArray(path) ? path.join("/") : path;
    const url = `${PYTHON_API_BASE}/dashboard/${pathname}`;

    const authHeader = request.headers.get("Authorization");
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(url, { method: "DELETE", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Delete failed" }));
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Delete failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[dashboard API route] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete. Please try again." },
      { status: 500 }
    );
  }
}