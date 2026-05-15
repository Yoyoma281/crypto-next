import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "1";
  const limit = url.searchParams.get("limit") ?? "30";
  const res = await backendFetch(
    "GET",
    `/chat/conversations/${id}/messages?page=${page}&limit=${limit}`
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
