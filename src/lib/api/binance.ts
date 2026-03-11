/**
 * Centralized Binance REST API client.
 *
 * Uses native `fetch` so Next.js can apply HTTP caching via
 * `next: { revalidate }`.  All callers go through `binanceFetch`
 * so the base URL and error handling are defined exactly once.
 */

const BINANCE_BASE = "https://api.binance.com/api/v3";

async function binanceFetch<T>(
  path: string,
  params?: Record<string, string | number>,
  revalidate = 60
): Promise<T> {
  const url = new URL(`${BINANCE_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate }, // Next.js ISR-style caching
  });

  if (!res.ok) {
    throw new Error(`Binance ${path} → ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public helpers ────────────────────────────────────────────────────────

/** 24-hr rolling stats for all symbols. Cached for 30 s. */
export function getAllTickers() {
  return binanceFetch<Record<string, string>[]>("/ticker/24hr", {}, 30);
}

/**
 * Candlestick (kline) data for a single symbol.
 * Short cache (15 s) because callers typically pick real-time intervals.
 */
export function getKlines(
  symbol: string,
  interval: string,
  limit = 100
) {
  return binanceFetch<unknown[][]>(
    "/klines",
    { symbol: symbol.toUpperCase(), interval, limit },
    15
  );
}

/** Single-symbol 24-hr ticker. Cached for 30 s. */
export function getTicker(symbol: string) {
  return binanceFetch<Record<string, string>>(
    "/ticker/24hr",
    { symbol: symbol.toUpperCase() },
    30
  );
}
