import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_BASE =
  process.env.PYTHON_API_BASE || "http://localhost:8000/api";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${PYTHON_API_BASE.replace("/api", "")}/api/admin/contact-submissions/${params.id}/reply`,
      {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json().catch(() => ({ error: "Invalid backend response" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach backend" }, { status: 503 });
  }
}
