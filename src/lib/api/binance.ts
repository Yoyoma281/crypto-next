/**
 * Centralized Bybit REST API client.
 *
 * Uses native `fetch` so Next.js can apply HTTP caching via
 * `next: { revalidate }`.  All callers go through `bybitFetch`
 * so the base URL and error handling are defined exactly once.
 */

const BYBIT_BASE = "https://api.bybit.com/v5";

// Bybit kline interval codes
const INTERVAL_MAP: Record<string, string> = {
  "1m": "1", "5m": "5", "15m": "15", "1h": "60", "4h": "240", "1d": "D",
};

async function bybitFetch<T>(
  path: string,
  params?: Record<string, string | number>,
  revalidate = 60
): Promise<T> {
  const url = new URL(`${BYBIT_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate }, // Next.js ISR-style caching
  });

  if (!res.ok) {
    throw new Error(`Bybit ${path} → ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public helpers ────────────────────────────────────────────────────────

/** 24-hr rolling stats for all SPOT symbols, normalized to Binance-compatible shape. Cached for 30 s. */
export async function getAllTickers() {
  const data = await bybitFetch<{ result: { list: Record<string, string>[] } }>(
    "/market/tickers",
    { category: "spot" },
    30
  );
  return (data.result?.list ?? []).map((t) => ({
    symbol: t.symbol,
    lastPrice: t.lastPrice,
    priceChange: (parseFloat(t.lastPrice) - parseFloat(t.prevPrice24h)).toFixed(8),
    priceChangePercent: (parseFloat(t.price24hPcnt) * 100).toFixed(2),
    weightedAvgPrice: t.lastPrice,
    prevClosePrice: t.prevPrice24h,
    highPrice: t.highPrice24h,
    lowPrice: t.lowPrice24h,
    quoteVolume: t.turnover24h,
  }));
}

/**
 * Candlestick (kline) data for a single symbol.
 * Returns array of [openTime, open, high, low, close, volume] tuples
 * in ascending (oldest-first) order — matches Binance kline format.
 * Short cache (15 s) because callers typically pick real-time intervals.
 */
export async function getKlines(symbol: string, interval: string, limit = 100) {
  const bybitInterval = INTERVAL_MAP[interval] ?? interval;
  const data = await bybitFetch<{ result: { list: string[][] } }>(
    "/market/kline",
    { category: "spot", symbol: symbol.toUpperCase(), interval: bybitInterval, limit },
    15
  );
  // Bybit returns newest-first; reverse to oldest-first
  return [...(data.result?.list ?? [])].reverse().map((k) => [
    parseInt(k[0]), // openTime ms
    k[1], k[2], k[3], k[4], k[5], // open, high, low, close, volume
  ]);
}

/** Single-symbol 24-hr ticker, normalized. Cached for 30 s. */
export async function getTicker(symbol: string) {
  const data = await bybitFetch<{ result: { list: Record<string, string>[] } }>(
    "/market/tickers",
    { category: "spot", symbol: symbol.toUpperCase() },
    30
  );
  const t = data.result?.list?.[0] ?? {};
  return {
    symbol: t.symbol,
    lastPrice: t.lastPrice,
    priceChange: (parseFloat(t.lastPrice) - parseFloat(t.prevPrice24h)).toFixed(8),
    priceChangePercent: (parseFloat(t.price24hPcnt) * 100).toFixed(2),
    weightedAvgPrice: t.lastPrice,
    prevClosePrice: t.prevPrice24h,
    highPrice: t.highPrice24h,
    lowPrice: t.lowPrice24h,
    quoteVolume: t.turnover24h,
  };
}
