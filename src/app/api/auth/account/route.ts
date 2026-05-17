import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch("DELETE", "/auth/account", body);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
