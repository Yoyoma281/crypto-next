import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await backendFetch("DELETE", `/squads/${id}/leave`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
