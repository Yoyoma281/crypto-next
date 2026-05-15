import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  const res = await backendFetch("POST", `/user/quiz/${quizId}/complete`);
  return NextResponse.json(await res.json(), { status: res.status });
}
