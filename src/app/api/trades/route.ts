import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await backendFetch("POST", "/Trades", body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
