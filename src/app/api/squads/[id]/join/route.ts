import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await backendFetch("POST", `/squads/${id}/join`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
