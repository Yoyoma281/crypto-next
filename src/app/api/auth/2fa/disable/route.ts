import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: Request) {
  const { token } = await req.json();
  const res = await backendFetch("POST", "/auth/2fa/disable", { token });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
