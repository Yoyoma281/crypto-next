import { NextResponse } from "next/server";
import { LocalApiAxios } from "@/lib/axios";

export async function GET() {
  try {
    const response = await LocalApiAxios.get(`/Portfolio`);
    console.log("Portfolio responseeee", response);

    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(error);
  }
}
