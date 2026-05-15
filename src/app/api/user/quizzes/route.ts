import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET() {
  const res = await backendFetch("GET", "/user/quizzes");
  return NextResponse.json(await res.json(), { status: res.status });
}
