import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
export async function POST(req: Request) {
  const body = await req.json();
  const res = await backendFetch("POST", "/referral/claim", body);
  return NextResponse.json(await res.json(), { status: res.status });
}
