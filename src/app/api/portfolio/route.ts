import { NextResponse } from "next/server";
import { ExternalServerApiFetch } from "../ApiFetch";

export async function GET() {
  try {
    const response = await ExternalServerApiFetch.get(`/Portfolio`);
    console.log("Portfolio responseeee", response);

    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(error);
  }
}
