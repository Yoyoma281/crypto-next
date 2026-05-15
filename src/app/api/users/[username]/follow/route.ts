import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const res = await backendFetch("POST", `/users/${username}/follow`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const res = await backendFetch("DELETE", `/users/${username}/follow`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
