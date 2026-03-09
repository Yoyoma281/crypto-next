import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/Register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Registration failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
