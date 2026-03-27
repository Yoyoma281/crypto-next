import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET() {
  const res = await backendFetch("GET", "/followers");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
