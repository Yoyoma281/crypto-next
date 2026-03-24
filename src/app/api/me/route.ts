import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET() {
  const res = await backendFetch("GET", "/GetUserInfo");
  if (!res.ok) return NextResponse.json(null, { status: res.status });
  const user = await res.json();
  return NextResponse.json(user);
}
