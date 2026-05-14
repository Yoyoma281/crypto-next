import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "csv";

  const res = await backendFetch("GET", `/export/trades?format=${encodeURIComponent(format)}`);

  if (!res.ok) {
    return new NextResponse("Export failed", { status: res.status });
  }

  const contentDisposition = res.headers.get("Content-Disposition") ?? `attachment; filename="trades.${format}"`;
  const contentType = res.headers.get("Content-Type") ?? "text/csv";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    },
  });
}
