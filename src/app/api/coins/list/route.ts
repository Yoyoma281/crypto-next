import { NextResponse } from "next/server";

// Next.js ISR — re-fetches from Bybit at most once per hour on the server
export const revalidate = 3600;

export async function GET() {
  const res = await fetch(
    "https://api.bybit.com/v5/market/instruments-info?category=spot",
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return NextResponse.json([], { status: 502 });

  const data = await res.json();

  const symbols = (data.result?.list as Array<{
    symbol: string;
    baseCoin: string;
    quoteCoin: string;
    status: string;
  }>)
    .filter((s) => s.quoteCoin === "USDT" && s.status === "Trading")
    .map((s) => ({ symbol: s.symbol, base: s.baseCoin }));

  return NextResponse.json(symbols, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
