import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await backendFetch("POST", "/follow", body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: Request) {
  const { leaderId } = await req.json();
  const res = await backendFetch("DELETE", `/follow/${leaderId}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
