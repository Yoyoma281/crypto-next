import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET() {
  const res = await backendFetch("GET", "/auth/sessions");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE() {
  const res = await backendFetch("DELETE", "/auth/sessions");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
