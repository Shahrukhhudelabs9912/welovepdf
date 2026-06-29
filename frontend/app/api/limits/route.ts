import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE =
  process.env.PYTHON_API_BASE || "http://localhost:8000/api";

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
    // [Phase 3] Restore free_tier_mb to 25 and max_upload_mb to 25 when freemium is enabled
    return NextResponse.json({
      max_upload_bytes: 100 * 1024 * 1024,
      max_upload_mb: 100,
      free_tier_mb: 100,
      pro_tier_mb: 100,
      tier: "free",
    });
  }
}
