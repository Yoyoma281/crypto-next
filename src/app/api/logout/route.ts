import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Delete the token cookie set by /api/login
  res.cookies.delete("token");
  return res;
}
