import { NextResponse } from "next/server";
import { LocalApiAxios } from "@/lib/axios";
import { loginResponse } from "@/app/types/login";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  console.log("Login attempt with:", { username, password });
  try {
    // Use axios to call your real backend (not fetch)
    const response = await LocalApiAxios.post<loginResponse>(`/Login`, {
      username,
      password,
    });
    console.log("Login responsee:", response);

    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(error);
  }
}
