import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST() {
  const res = await backendFetch("POST", "/user/claim-streak-bonus");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
