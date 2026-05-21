import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(req: Request) {
  const { search } = new URL(req.url);
  const res = await backendFetch("GET", `/arena/leaderboard${search}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
