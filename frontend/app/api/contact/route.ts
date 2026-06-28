import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE =
  process.env.PYTHON_API_BASE || "http://localhost:8000/api";

/**
 * Proxy /api/contact to the Python backend.
 *
 * Forwards X-Forwarded-For so slowapi sees the real client IP behind
 * the Next.js edge — without this, rate limiting buckets every request
 * under the Next server's IP and the per-IP cap fires globally.
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const headers: HeadersInit = { "Content-Type": "application/json" };
  const xff = request.headers.get("x-forwarded-for");
  if (xff) headers["X-Forwarded-For"] = xff;

  try {
    const res = await fetch(`${PYTHON_API_BASE}/contact`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ error: "Invalid backend response" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the server. Please try again in a moment." },
      { status: 503 },
    );
  }
}

/**
 * GET /api/contact — proxy captcha challenge generation.
 */
export async function GET() {
  try {
    const res = await fetch(`${PYTHON_API_BASE}/captcha`, { cache: "no-store" });
    const data = await res.json().catch(() => ({ error: "Invalid backend response" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the server." },
      { status: 503 },
    );
  }
}
