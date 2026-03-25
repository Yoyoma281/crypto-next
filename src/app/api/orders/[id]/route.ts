import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await backendFetch("DELETE", `/orders/${id}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
