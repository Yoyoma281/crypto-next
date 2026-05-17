"use client";

import { useEffect, useState } from "react";
import { CurrencyKey } from "@/hooks/useCurrencyRates";

const CURRENCIES: { key: CurrencyKey; label: string }[] = [
  { key: "USDT", label: "USDT" },
  { key: "BTC", label: "BTC" },
  { key: "ETH", label: "ETH" },
  { key: "EUR", label: "EUR" },
];

const LS_KEY = "portfolio_display_currency";

interface Props {
  value: CurrencyKey;
  onChange: (currency: CurrencyKey) => void;
}

export default function CurrencyToggle({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-full"
      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}
    >
      {CURRENCIES.map(({ key, label }) => {
        const active = key === value;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all"
            style={
              active
                ? {
                    background: "hsl(var(--primary) / 0.2)",
                    color: "hsl(var(--primary))",
                    border: "1px solid hsl(var(--primary) / 0.4)",
                  }
                : {
                    background: "transparent",
                    color: "hsl(var(--muted-foreground))",
                    border: "1px solid transparent",
                  }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Reads the persisted currency from localStorage (client only). */
export function usePersistedCurrency(): [CurrencyKey, (c: CurrencyKey) => void] {
  const [currency, setCurrency] = useState<CurrencyKey>("USDT");

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as CurrencyKey | null;
    if (saved && ["USDT", "BTC", "ETH", "EUR"].includes(saved)) {
      setCurrency(saved);
    }
  }, []);

  function set(c: CurrencyKey) {
    setCurrency(c);
    localStorage.setItem(LS_KEY, c);
  }

  return [currency, set];
}
