import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || "http://localhost:8000/api";

// Catch-all proxy for /api/auth/* — forwards login, signup, refresh, me,
// logout, profile, change-password, forgot-password, reset-password to the
// Python backend. Mirrors the pattern in app/api/dashboard/[...path]/route.ts.

async function forward(
  request: NextRequest,
  pathSegments: string[],
  method: "GET" | "POST" | "PUT" | "DELETE",
): Promise<NextResponse> {
  const pathname = pathSegments.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${PYTHON_API_BASE}/auth/${pathname}${searchParams ? `?${searchParams}` : ""}`;

  const headers: Record<string, string> = {};
  const authHeader = request.headers.get("Authorization");
  if (authHeader) headers["Authorization"] = authHeader;

  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "DELETE") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      headers["Content-Type"] = "application/json";
      init.body = await request.text();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      // Re-build FormData so the runtime sets the correct boundary.
      const incoming = await request.formData();
      const fd = new FormData();
      for (const [key, value] of incoming.entries()) {
        fd.append(key, value);
      }
      init.body = fd;
    } else {
      init.body = await request.text();
      if (contentType) headers["Content-Type"] = contentType;
    }
  }

  try {
    const response = await fetch(url, init);
    const respContentType = response.headers.get("content-type") || "";

    if (respContentType.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: respContentType ? { "Content-Type": respContentType } : undefined,
    });
  } catch (error) {
    console.error(`[auth proxy] ${method} /auth/${pathname} failed:`, error);
    return NextResponse.json(
      { error: "Auth service unavailable. Please try again." },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return forward(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return forward(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return forward(request, path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return forward(request, path, "DELETE");
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
