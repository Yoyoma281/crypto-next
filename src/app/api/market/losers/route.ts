import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const res = await backendFetch("GET", `/market/losers${qs ? `?${qs}` : ""}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
