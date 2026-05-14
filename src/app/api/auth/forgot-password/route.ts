import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    const res = await backendFetch("POST", "/auth/forgot-password", {
      username,
    });

    const body = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: body?.message ?? "Request failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: body.message }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to send reset link", details: (error as Error).message },
      { status: 500 }
    );
  }
}
