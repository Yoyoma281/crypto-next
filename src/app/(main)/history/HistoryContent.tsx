"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

interface Trade {
  _id: string;
  createdAt: string;
  symbol: string;
  type: string;
  price: string | number;
  usdAmount: string | number;
  coinAmount: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtUSD(n: string | number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCoin(n: string) {
  const num = parseFloat(n);
  if (num === 0) return "0";
  if (num < 0.0001) return num.toExponential(4);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

const LIMIT = 20;

export default function HistoryContent() {
  const { t } = useI18n();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [sideFilter, setSideFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { setPage(1); }, [sideFilter, symbolSearch]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (sideFilter !== "ALL") params.set("type", sideFilter);
    if (symbolSearch.trim()) params.set("symbol", symbolSearch.trim().toUpperCase());
    fetch(`/api/trades?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.trades) {
          setTrades(d.trades);
          setPages(d.pages ?? 1);
          setTotal(d.total ?? d.trades.length);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sideFilter, symbolSearch, page]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-0.5">{t.history.title}</h1>
        <p className="text-sm text-muted-foreground">{t.history.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Side filter */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {(["ALL", "BUY", "SELL"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSideFilter(s)}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{
                background: sideFilter === s ? (s === "BUY" ? "rgba(78,222,163,0.15)" : s === "SELL" ? "rgba(255,179,173,0.15)" : "hsl(var(--muted))") : "transparent",
                color: sideFilter === s ? (s === "BUY" ? "#4edea3" : s === "SELL" ? "#ffb3ad" : "hsl(var(--foreground))") : "hsl(var(--muted-foreground))",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Symbol search */}
        <input
          type="text"
          placeholder="Filter by pair (e.g. BTC)"
          value={symbolSearch}
          onChange={(e) => setSymbolSearch(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-48"
        />

        {total > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">{total} trade{total !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground animate-pulse">
          Loading…
        </div>
      ) : trades.length === 0 ? (
        <div className="rounded-xl px-6 py-16 text-center text-muted-foreground text-sm border border-border bg-card">
          {t.history.noTrades}{" "}
          <a href="/coin/BTCUSDT?tab=trade" className="underline hover:text-foreground">
            {t.history.goToExchange}
          </a>{" "}
          {t.history.firstTrade}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="text-left px-5 py-3">{t.history.date}</th>
                <th className="text-left px-5 py-3">{t.history.pair}</th>
                <th className="text-left px-5 py-3">{t.history.type}</th>
                <th className="text-right px-5 py-3">{t.history.price}</th>
                <th className="text-right px-5 py-3">{t.history.amountUsdt}</th>
                <th className="text-right px-5 py-3">{t.history.quantity}</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr
                  key={trade._id}
                  className="transition-colors hover:bg-muted/40"
                  style={i < trades.length - 1 ? { borderBottom: "1px solid hsl(var(--border))" } : {}}
                >
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{fmtDate(trade.createdAt)}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold">
                    <a href={`/coin/${trade.symbol}?tab=trade`} className="hover:underline">
                      {trade.symbol.replace("USDT", "/USDT")}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        color: trade.type === "BUY" ? "#4edea3" : "#ffb3ad",
                        background: trade.type === "BUY" ? "rgba(78,222,163,0.1)" : "rgba(255,179,173,0.1)",
                      }}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono">{fmtUSD(trade.price)}</td>
                  <td className="px-5 py-3.5 text-right font-mono">{fmtUSD(trade.usdAmount)}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-muted-foreground">{fmtCoin(trade.coinAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className="w-8 h-8 rounded-lg text-xs font-bold transition-colors"
                    style={{
                      background: page === p ? "hsl(var(--primary))" : "transparent",
                      color: page === p ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                      border: page === p ? "none" : "1px solid hsl(var(--border))",
                    }}
                  >
                    {p}
                  </button>
                )
              )}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
