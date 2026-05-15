import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET() {
  const res = await backendFetch("GET", "/chat/conversations");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const body = await req.json();
  const res = await backendFetch("POST", "/chat/conversations", body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
