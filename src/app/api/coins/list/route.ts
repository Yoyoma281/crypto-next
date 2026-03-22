import { NextResponse } from "next/server";

// Next.js ISR — re-fetches from Binance at most once per hour on the server
export const revalidate = 3600;

export async function GET() {
  const res = await fetch("https://api.binance.com/api/v3/exchangeInfo", {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return NextResponse.json([], { status: 502 });

  const data = await res.json();

  const symbols = (data.symbols as Array<{
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: string;
  }>)
    .filter((s) => s.quoteAsset === "USDT" && s.status === "TRADING")
    .map((s) => ({ symbol: s.symbol, base: s.baseAsset }));

  return NextResponse.json(symbols, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
