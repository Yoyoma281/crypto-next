"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";

interface CoinEntry {
  symbol: string;
  base: string;
}

let _cache: CoinEntry[] | null = null;
let _promise: Promise<CoinEntry[]> | null = null;

function loadCoins(): Promise<CoinEntry[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch("/api/coins/list")
    .then((r) => r.json())
    .then((data: CoinEntry[]) => { _cache = data; return data; });
  return _promise;
}

function CoinIcon({ ticker }: { ticker: string }) {
  const [stage, setStage] = useState(0);
  const srcs = [
    `/Coin-icons/${ticker.toLowerCase()}.svg`,
    `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`,
    `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/${ticker.toLowerCase()}.png`,
  ];
  if (stage >= srcs.length) {
    return (
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
        style={{ background: `hsl(${(ticker.charCodeAt(0) * 47) % 360}, 55%, 45%)` }}
      >
        {ticker[0]}
      </div>
    );
  }
  return (
    <Image
      key={srcs[stage]}
      src={srcs[stage]}
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
  const [focused, setFocused] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const containerRef          = useRef<HTMLDivElement>(null);

  useEffect(() => { loadCoins().then(setCoins).catch(() => {}); }, []);

  // Global "/" shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const q = query.trim().toUpperCase();
    if (!q) { setResults([]); setOpen(false); return; }
    const matches = coins
      .filter((c) => c.base.startsWith(q) || c.symbol.startsWith(q))
      .slice(0, 8);
    setResults(matches);
    setActive(0);
    setOpen(matches.length > 0);
  }, [query, coins]);

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
      setQuery("");
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-150 ${
          focused
            ? "bg-background border-primary/60 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
            : "bg-muted/50 border-border hover:border-border/80 hover:bg-muted/70"
        }`}
        style={{ width: focused || query ? "15rem" : "11.5rem", transition: "width 200ms ease, box-shadow 150ms ease" }}
      >
        <Search className={`h-3.5 w-3.5 shrink-0 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); if (query && results.length > 0) setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder="Search coins…"
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground min-w-0 text-foreground"
        />
        {query ? (
          <button
            onMouseDown={(e) => { e.preventDefault(); setQuery(""); setOpen(false); }}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <span
            className="shrink-0 text-[10px] font-mono font-semibold transition-opacity select-none"
            style={{ color: "hsl(var(--muted-foreground))", opacity: focused ? 0 : 0.45 }}
          >
            /
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full mt-2 w-72 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <p className="px-3 pb-1 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
            Results
          </p>
          {results.map((coin, i) => (
            <button
              key={coin.symbol}
              onMouseDown={() => select(coin)}
              onMouseEnter={() => setActive(i)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
              style={{ background: i === active ? "hsl(var(--muted))" : "transparent" }}
            >
              <CoinIcon ticker={coin.base} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground leading-tight">{coin.base}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{coin.symbol}</span>
              </div>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
              >
                USDT
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
