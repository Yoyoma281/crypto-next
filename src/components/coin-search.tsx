"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";

interface CoinEntry {
  symbol: string; // e.g. "BTCUSDT"
  base: string;   // e.g. "BTC"
}

// Module-level cache — fetched once, reused for the entire browser session
let _cache: CoinEntry[] | null = null;
let _promise: Promise<CoinEntry[]> | null = null;

function loadCoins(): Promise<CoinEntry[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch("/api/coins/list")
    .then((r) => r.json())
    .then((data: CoinEntry[]) => {
      _cache = data;
      return data;
    });
  return _promise;
}

function CoinIcon({ ticker }: { ticker: string }) {
  const [stage, setStage] = useState(0);
  if (stage >= 2) {
    return (
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
        style={{ background: `hsl(${(ticker.charCodeAt(0) * 47) % 360}, 55%, 45%)` }}
      >
        {ticker[0]}
      </div>
    );
  }
  const src =
    stage === 0
      ? `/Coin-icons/${ticker.toLowerCase()}.svg`
      : `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/${ticker.toLowerCase()}.png`;
  return (
    <Image
      key={src}
      src={src}
      alt={ticker}
      width={24}
      height={24}
      className="rounded-full shrink-0"
      onError={() => setStage((s) => s + 1)}
      unoptimized
    />
  );
}

export default function CoinSearch() {
  const router = useRouter();
  const [coins, setCoins]     = useState<CoinEntry[]>([]);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<CoinEntry[]>([]);
  const [open, setOpen]       = useState(false);
  const [active, setActive]   = useState(0);
  const inputRef              = useRef<HTMLInputElement>(null);
  const containerRef          = useRef<HTMLDivElement>(null);

  // Warm the cache as soon as the component mounts
  useEffect(() => {
    loadCoins().then(setCoins).catch(() => {});
  }, []);

  // Filter locally on every keystroke
  useEffect(() => {
    const q = query.trim().toUpperCase();
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }
    const matches = coins
      .filter((c) => c.base.startsWith(q) || c.symbol.startsWith(q))
      .slice(0, 8);
    setResults(matches);
    setActive(0);
    setOpen(matches.length > 0);
  }, [query, coins]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function select(coin: CoinEntry) {
    setQuery("");
    setOpen(false);
    router.push(`/coin/${coin.symbol}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) select(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-muted/40 focus-within:bg-background focus-within:border-primary/50 transition-all"
        style={{
          width: query ? "14rem" : "11rem",
          transition: "width 200ms ease, background 150ms ease, border-color 150ms ease",
        }}
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query && results.length > 0) setOpen(true); }}
          placeholder="Search coins…"
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground min-w-0"
        />
        {query && (
          <button
            onMouseDown={(e) => { e.preventDefault(); setQuery(""); setOpen(false); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full mt-1.5 w-64 rounded-xl shadow-xl py-1 z-50 overflow-hidden"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          {results.map((coin, i) => (
            <button
              key={coin.symbol}
              onMouseDown={() => select(coin)}
              onMouseEnter={() => setActive(i)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
              style={{ background: i === active ? "hsl(var(--muted))" : "transparent" }}
            >
              <CoinIcon ticker={coin.base} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground">{coin.base}</span>
                <span className="text-[10px] text-muted-foreground">{coin.symbol}</span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">/ USDT</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
