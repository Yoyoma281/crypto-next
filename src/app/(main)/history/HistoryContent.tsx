"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, History, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

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

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: String(CURRENT_YEAR), label: String(CURRENT_YEAR) },
  { value: String(CURRENT_YEAR - 1), label: String(CURRENT_YEAR - 1) },
  { value: "", label: "All time" },
];

function TaxReportCard() {
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ format: "csv" });
      if (year) params.set("year", year);
      const url = `/api/export/tax-report?${params}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `tax-report${year ? `-${year}` : ""}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // silent — user can retry
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ border: "1px solid #2e3447", background: "hsl(var(--card))" }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(78,222,163,0.1)" }}
        >
          <FileText className="w-4 h-4" style={{ color: "#4edea3" }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">Tax Report</p>
          <p className="text-xs text-muted-foreground">
            Download a CSV of all your taxable trade events
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          {YEAR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "rgba(78,222,163,0.12)",
            color: "#4edea3",
            border: "1px solid rgba(78,222,163,0.3)",
          }}
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Downloading..." : "Download Tax Report"}
        </button>
      </div>
    </div>
  );
}

export default function HistoryContent() {
  const { t } = useI18n();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [sideFilter, setSideFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // AI post-mortem state
  const [postMortemId, setPostMortemId] = useState<string | null>(null);
  const [postMortemText, setPostMortemText] = useState("");
  const [pmLoading, setPmLoading] = useState(false);
  const pmAbortRef = useRef<AbortController | null>(null);

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

  async function openPostMortem(trade: Trade) {
    // Toggle off if same trade
    if (postMortemId === trade._id) {
      if (pmAbortRef.current) pmAbortRef.current.abort();
      setPostMortemId(null);
      setPostMortemText("");
      return;
    }

    // Abort any in-flight stream
    if (pmAbortRef.current) pmAbortRef.current.abort();
    const controller = new AbortController();
    pmAbortRef.current = controller;

    setPostMortemId(trade._id);
    setPostMortemText("");
    setPmLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/ai/assist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post_mortem",
          context: {
            symbol: trade.symbol,
            tradeType: trade.type,
            usdAmount: trade.usdAmount,
            coinAmount: trade.coinAmount,
            price: trade.price,
            executedAt: trade.createdAt,
            currentPrice: null,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setPostMortemText(accumulated);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setPostMortemText("Failed to load analysis. Please try again.");
    } finally {
      setPmLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">{t.history.title}</h1>
          <p className="text-sm text-muted-foreground">{t.history.subtitle}</p>
        </div>
        <a
          href="/api/export/trades?format=csv"
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0"
          style={{
            borderColor: "#2e3447",
            color: "#909097",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#dce1fb"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#909097"; }}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </a>
      </div>

      {/* Tax Report */}
      <TaxReportCard />

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
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header skeleton */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-muted/20">
            {[90, 80, 60, 90, 90, 80, 40].map((w, i) => (
              <div key={i} className="h-2.5 rounded skeleton" style={{ width: w, flexShrink: 0 }} />
            ))}
          </div>
          {/* Row skeletons */}
          {Array.from({ length: 8 }).map((_, r) => (
            <div
              key={r}
              className="flex items-center gap-4 px-5 border-b border-border/50"
              style={{ height: 56 }}
            >
              <div className="h-3 rounded skeleton" style={{ width: 90, flexShrink: 0 }} />
              <div className="h-3 rounded skeleton" style={{ width: 80, flexShrink: 0 }} />
              <div className="h-5 w-14 rounded-full skeleton flex-shrink-0" />
              <div className="h-3 rounded skeleton ml-auto" style={{ width: 80 }} />
              <div className="h-3 rounded skeleton" style={{ width: 80 }} />
              <div className="h-3 rounded skeleton" style={{ width: 70 }} />
              <div className="h-3 w-8 rounded skeleton flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="rounded-xl border border-border bg-card min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(140,205,255,0.1)" }}
            >
              <History className="w-6 h-6" style={{ color: "#8ccdff" }} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-foreground">No trades yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your completed trades will appear here
              </p>
            </div>
            <Link
              href="/coin/BTCUSDT?tab=trade"
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
            >
              Make your first trade →
            </Link>
          </div>
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
                <th className="text-right px-5 py-3" style={{ width: "56px" }}></th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <Fragment key={trade._id}>
                  <tr
                    className="transition-colors hover:bg-muted/40"
                    style={i < trades.length - 1 && postMortemId !== trade._id ? { borderBottom: "1px solid hsl(var(--border))" } : {}}
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openPostMortem(trade)}
                        title="AI Post-Mortem"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "9px",
                          fontWeight: 900,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#4edea3",
                          opacity: postMortemId === trade._id ? 1 : 0.6,
                          padding: "3px 0",
                          borderRadius: 0,
                          lineHeight: 1,
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                        onMouseLeave={(e) => {
                          if (postMortemId !== trade._id) (e.currentTarget as HTMLButtonElement).style.opacity = "0.6";
                        }}
                      >
                        ✦ AI
                      </button>
                    </td>
                  </tr>
                  {postMortemId === trade._id && (
                    <tr
                      style={{ borderBottom: i < trades.length - 1 ? "1px solid hsl(var(--border))" : "none" }}
                    >
                      <td
                        colSpan={7}
                        style={{ padding: "0 20px 16px" }}
                      >
                        <div
                          style={{
                            background: "#0c1324",
                            border: "1px solid #2e3447",
                            borderRadius: "8px",
                            padding: "14px 16px",
                            marginTop: "2px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "9px",
                              fontWeight: 900,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "#4edea3",
                              marginBottom: "10px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>✦</span>
                            <span>AI Post-Mortem — {trade.symbol.replace("USDT", "/USDT")}</span>
                          </div>
                          {pmLoading && !postMortemText ? (
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#909097",
                                fontStyle: "italic",
                              }}
                            >
                              Analyzing trade...
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: "13px",
                                lineHeight: "1.7",
                                color: "#dce1fb",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                fontFamily: "monospace",
                              }}
                            >
                              {postMortemText}
                              {pmLoading && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "8px",
                                    height: "14px",
                                    background: "#4edea3",
                                    marginLeft: "2px",
                                    verticalAlign: "text-bottom",
                                    animation: "blink 1s step-end infinite",
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
