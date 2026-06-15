import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE =
  process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api";

/**
 * Proxy /api/limits to the Python backend, forwarding the user's
 * Authorization header so tier-based limits resolve correctly.
 */
export async function GET(request: NextRequest) {
  try {
    const headers: HeadersInit = {};
    const auth = request.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;

    const res = await fetch(`${PYTHON_API_BASE}/limits`, { headers });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Backend unreachable — return free-tier defaults so the UI keeps working.
    return NextResponse.json({
      max_upload_bytes: 25 * 1024 * 1024,
      max_upload_mb: 25,
      free_tier_mb: 25,
      pro_tier_mb: 100,
      tier: "free",
    });
  }
}
