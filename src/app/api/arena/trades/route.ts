import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await backendFetch("POST", "/arena/trades", body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: Request) {
  const { search } = new URL(req.url);
  const res = await backendFetch("GET", `/arena/history${search}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
