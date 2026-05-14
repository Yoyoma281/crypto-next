import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") ?? "1M";
  const res = await backendFetch("GET", `/portfolio/history?range=${range}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
