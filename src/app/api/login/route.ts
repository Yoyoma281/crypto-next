import { NextResponse } from "next/server";
import { loginResponse } from "@/app/types/login";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  console.log("Login attempt with:", { username, password });

  try {
    // Call your backend login endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const body: loginResponse = await res.json();
    console.log("Login response from backend:", body);

    // Build a Next.js response
    const nextRes = NextResponse.json(body, { status: res.status });

    nextRes.cookies.set("token", body.token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "none",
    });

    console.log("Cookie set in Next.js response:", body.token);

    return nextRes;
  } catch (error: unknown) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Login failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
