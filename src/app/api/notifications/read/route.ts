import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch("POST", "/notifications/read", body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
