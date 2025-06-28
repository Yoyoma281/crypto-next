import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: 'Failed to fetch top coins' },
    { status: 500 }
  );
}
