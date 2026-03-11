import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const CACHE_TAG = "user-favorites";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await context.params;
  const res = await backendFetch("DELETE", `/favorites/${symbol}`);
  const data = await res.json();

  if (res.ok) revalidateTag(CACHE_TAG); // bust cache on successful remove
  return NextResponse.json(data, { status: res.status });
}
