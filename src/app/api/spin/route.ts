import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
export async function POST() {
  const res = await backendFetch("POST", "/spin");
  return NextResponse.json(await res.json(), { status: res.status });
}
