import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET() {
  const res = await backendFetch("GET", "/auth/export");

  if (!res.ok) {
    return new NextResponse("Export failed", { status: res.status });
  }

  const contentDisposition =
    res.headers.get("Content-Disposition") ?? 'attachment; filename="my-data.json"';
  const contentType = res.headers.get("Content-Type") ?? "application/json";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}
