"use client";
import { useEffect, useState } from "react";

export type CurrencyKey = "USDT" | "BTC" | "ETH" | "EUR";

export interface CurrencyRates {
  /** How many USDT is 1 BTC */
  BTC: number;
  /** How many USDT is 1 ETH */
  ETH: number;
  /** How many USDT is 1 EUR (fixed approximation) */
  EUR: number;
}

const EUR_FIXED = 1 / 0.92; // 1 EUR ≈ 1.087 USDT

async function fetchGateioPrice(pair: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${pair}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const last = data?.[0]?.last;
    return last ? parseFloat(last) : null;
  } catch {
    return null;
  }
}

export function useCurrencyRates(): CurrencyRates {
  const [rates, setRates] = useState<CurrencyRates>({
    BTC: 65000,
    ETH: 3500,
    EUR: EUR_FIXED,
  });

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const [btc, eth] = await Promise.all([
        fetchGateioPrice("BTC_USDT"),
        fetchGateioPrice("ETH_USDT"),
      ]);
      if (cancelled) return;
      setRates((prev) => ({
        BTC: btc ?? prev.BTC,
        ETH: eth ?? prev.ETH,
        EUR: EUR_FIXED,
      }));
    }

    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return rates;
}
