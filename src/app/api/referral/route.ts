import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
export async function GET() {
  const res = await backendFetch("GET", "/referral");
  return NextResponse.json(await res.json(), { status: res.status });
}
