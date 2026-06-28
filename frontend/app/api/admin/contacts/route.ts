import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE =
  process.env.PYTHON_API_BASE || "http://localhost:8000/api";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();
  if (searchParams.get("page")) params.set("page", searchParams.get("page")!);
  if (searchParams.get("limit")) params.set("limit", searchParams.get("limit")!);
  if (searchParams.get("status")) params.set("status", searchParams.get("status")!);

  try {
    const res = await fetch(
      `${PYTHON_API_BASE.replace("/api", "")}/api/admin/contact-submissions?${params}`,
      { headers: { Authorization: auth }, cache: "no-store" }
    );
    const data = await res.json().catch(() => ({ error: "Invalid backend response" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach backend" }, { status: 503 });
  }
}
