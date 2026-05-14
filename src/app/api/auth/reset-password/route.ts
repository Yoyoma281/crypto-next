import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    const res = await backendFetch("POST", "/auth/reset-password", {
      token,
      newPassword,
    });

    const body = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: body?.message ?? "Reset failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: body.message }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to reset password", details: (error as Error).message },
      { status: 500 }
    );
  }
}
