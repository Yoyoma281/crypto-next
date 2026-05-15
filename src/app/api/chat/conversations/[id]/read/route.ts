import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await backendFetch("POST", `/chat/conversations/${id}/read`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
