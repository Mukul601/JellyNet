import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXTAUTH_BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${BACKEND}/api/auth/wallet/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 503 });
  }
}
