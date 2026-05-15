import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const res = await backendFetch("GET", `/users/${username}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
