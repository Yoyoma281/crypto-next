import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET() {
  const res = await backendFetch("GET", "/user/notification-prefs");
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const res = await backendFetch("PUT", "/user/notification-prefs", body);
  return NextResponse.json(await res.json(), { status: res.status });
}
