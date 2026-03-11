import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getKlines } from "@/lib/api/binance";

/**
 * Cache kline results per symbol+interval for 15 seconds.
 * The underlying binance fetch also has revalidate:15, but this caches
 * the *route handler result* so repeated client requests don't even
 * re-run the handler logic.
 */
const getCachedKlines = unstable_cache(
  (symbol: string, interval: string) => getKlines(symbol, interval),
  ["binance-klines"],
  { tags: ["binance-klines"], revalidate: 15 }
);

export async function GET(
  req: Request,
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await context.params;
  const interval = new URL(req.url).searchParams.get("interval") ?? "1m";

  const data = await getCachedKlines(symbol, interval);
  return NextResponse.json({ data });
}
