"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, X, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useFavoritesCtx } from "./favorites-context";

const GREEN = "#42e09a";
const RED   = "#ffb4ab";

export default function FloatingFavorites() {
  const { favorites, tickers } = useFavoritesCtx();
  const [open, setOpen]       = useState(false);
  const panelRef              = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Don't render anything if no favorites
  if (favorites.size === 0) return null;

  const coins = [...favorites].slice(0, 8); // show up to 8
  const count = favorites.size;

  return (
    <div ref={panelRef} className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">

      {/* ── Panel ─────────────────────────────────────────────── */}
      <div
        className={`
          w-56 rounded-xl border border-border overflow-hidden shadow-2xl
          transition-all duration-300 ease-out origin-bottom-right
          ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-2 pointer-events-none"}
        `}
        style={{ background: "hsl(var(--card))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold">Watchlist</span>
            <span className="text-[10px] text-muted-foreground">({count})</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Coin rows */}
        <div className="py-1">
          {coins.map((sym) => {
            const ticker = tickers[sym];
            const pct    = ticker ? parseFloat(ticker.priceChangePercent) : null;
            const price  = ticker?.lastPrice ?? null;
            const up     = (pct ?? 0) >= 0;

            return (
              <Link
                key={sym}
                href={`/Exchange/${sym}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/50 transition-colors group"
              >
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {sym.replace("USDT", "")}
                </span>
                <div className="flex items-center gap-2 text-right">
                  {price ? (
                    <>
                      <span className="text-xs font-mono text-foreground">
                        ${parseFloat(price) >= 1
                          ? parseFloat(price).toLocaleString(undefined, { maximumFractionDigits: 2 })
                          : parseFloat(price).toPrecision(4)}
                      </span>
                      <span
                        className="text-[10px] font-semibold flex items-center gap-0.5 w-14 justify-end"
                        style={{ color: up ? GREEN : RED }}
                      >
                        {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {up ? "+" : ""}{pct!.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground animate-pulse">…</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        {count > 0 && (
          <div className="border-t border-border px-3.5 py-2">
            <Link
              href="/watchlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-[10px] font-semibold hover:underline"
              style={{ color: "#8ccdff" }}
            >
              Full watchlist <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* ── FAB trigger ───────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`
          relative flex items-center gap-1.5 px-3 py-2 rounded-full border shadow-lg
          text-xs font-semibold transition-all duration-200 active:scale-95
          ${open
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted/80"
          }
        `}
      >
        <Star className={`h-3.5 w-3.5 ${open ? "fill-current" : "fill-yellow-400 text-yellow-400"}`} />
        <span>{count}</span>
        {/* pulse dot when prices are live */}
        {Object.keys(tickers).length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 border-2 border-background" />
        )}
      </button>
    </div>
  );
}
