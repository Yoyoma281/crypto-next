"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CoinIcon from "@/components/CoinIcon";
import Sparkline from "@/app/components/sparkline";
import { formatPrice, fmtCoinPrice } from "@/lib/utils";
import { CoinTableRow } from "@/app/types/coin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GlobalStats {
  totalMarketCap: string;
  totalVolume24h: string;
  btcDominance: string;
  activeCryptos: number;
}

interface StreamFrame {
  coins: CoinTableRow[];
  total: number;
  totalPages: number;
  page: number;
}

interface GainerLoser {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  priceChange: string;
}

type MarketTab = "all" | "gainers" | "losers";
type SortKey = "rank" | "lastPrice" | "priceChangePercent";
type SortDir = "asc" | "desc";

const LIMIT = 50;
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";


// ─── Pct badge ────────────────────────────────────────────────────────────────

function PctBadge({ value }: { value: string }) {
  const num = parseFloat(value);
  const isUp = num >= 0;
  return (
    <span
      style={{
        color: isUp ? "#4edea3" : "#ffb3ad",
        background: isUp ? "rgba(78,222,163,0.1)" : "rgba(255,179,173,0.1)",
        borderRadius: "6px",
        padding: "3px 8px",
        fontWeight: 600,
        fontSize: "13px",
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        whiteSpace: "nowrap",
      }}
    >
      {isUp ? "▲" : "▼"} {Math.abs(num).toFixed(2)}%
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid #2e3447", background: "#0b1222", overflow: "hidden" }}>
      <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: "1px solid #2e3447", background: "rgba(46,52,71,0.3)" }}>
        {[40, 200, 120, 120, 110].map((w, i) => (
          <div key={i} className="h-3 rounded animate-pulse" style={{ width: w, background: "#2e3447", flexShrink: 0 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4" style={{ height: 64, borderBottom: "1px solid #1a2235" }}>
          <div className="h-3 w-8 rounded animate-pulse" style={{ background: "#1e2a3a" }} />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full animate-pulse" style={{ background: "#1e2a3a" }} />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-12 rounded animate-pulse" style={{ background: "#1e2a3a" }} />
              <div className="h-2 w-16 rounded animate-pulse" style={{ background: "#18202e" }} />
            </div>
          </div>
          {[90, 100, 80].map((w, i) => (
            <div key={i} className="h-3 rounded animate-pulse" style={{ width: w, background: "#1e2a3a" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: "#2e3447", fontSize: 10 }}>⇅</span>;
  return <span style={{ color: "#4edea3", fontSize: 10 }}>{dir === "asc" ? "↑" : "↓"}</span>;
}

// ─── Global stats bar ─────────────────────────────────────────────────────────

function GlobalStatsBar() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/global")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const items = stats
    ? [
        { label: "Total Market Cap", value: stats.totalMarketCap || "—" },
        { label: "24h Volume", value: stats.totalVolume24h || "—" },
        { label: "BTC Dominance", value: stats.btcDominance || "—" },
        { label: "Active Pairs", value: stats.activeCryptos ? stats.activeCryptos.toLocaleString() : "—" },
      ]
    : [
        { label: "Total Market Cap", value: "—" },
        { label: "24h Volume", value: "—" },
        { label: "BTC Dominance", value: "—" },
        { label: "Active Pairs", value: "—" },
      ];

  return (
    <div
      className="flex flex-wrap gap-0"
      style={{
        background: "#0b1222",
        border: "1px solid #2e3447",
        borderRadius: 12,
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className="flex flex-col gap-0.5 px-5 py-3 flex-1 min-w-[140px]"
          style={{
            borderRight: i < items.length - 1 ? "1px solid #2e3447" : "none",
          }}
        >
          <span style={{ color: "#909097", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {item.label}
          </span>
          {loading ? (
            <div className="h-5 w-24 rounded animate-pulse" style={{ background: "#1e2a3a" }} />
          ) : (
            <span style={{ color: "#dce1fb", fontSize: 15, fontWeight: 700 }}>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Gainers / Losers table ───────────────────────────────────────────────────

function GainerLoserTable({ data, label }: { data: GainerLoser[]; label: "gainers" | "losers" }) {
  const isGainer = label === "gainers";

  return (
    <div style={{ borderRadius: 12, border: "1px solid #2e3447", background: "#0b1222", overflow: "hidden" }}>
      {/* Table header */}
      <div
        className="grid px-4 py-2 text-xs font-semibold"
        style={{
          gridTemplateColumns: "2rem 1fr 1fr 1fr",
          color: "#909097",
          borderBottom: "1px solid #2e3447",
          background: "rgba(46,52,71,0.3)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        <span>#</span>
        <span>Coin</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h {isGainer ? "Gain" : "Loss"}</span>
      </div>

      {data.length === 0 && (
        <div className="py-12 text-center" style={{ color: "#909097", fontSize: 14 }}>
          No data yet — the market feed may still be loading.
        </div>
      )}

      {data.map((coin, idx) => {
        const ticker = coin.symbol.replace("USDT", "");
        const pct = parseFloat(coin.priceChangePercent);
        const price = parseFloat(coin.lastPrice);

        return (
          <Link
            key={coin.symbol}
            href={`/coin/${coin.symbol}`}
            className="grid px-4 transition-colors"
            style={{
              gridTemplateColumns: "2rem 1fr 1fr 1fr",
              alignItems: "center",
              height: 56,
              borderBottom: idx < data.length - 1 ? "1px solid #131c2e" : "none",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1a2235"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <span style={{ color: "#909097", fontSize: 13, fontWeight: 500 }}>{idx + 1}</span>

            <div className="flex items-center gap-2">
              <CoinIcon ticker={ticker} size={28} />
              <div className="flex flex-col leading-tight">
                <span style={{ color: "#dce1fb", fontSize: 13, fontWeight: 600 }}>{ticker}</span>
                <span style={{ color: "#909097", fontSize: 11 }}>{coin.symbol}</span>
              </div>
            </div>

            <span className="text-right" style={{ color: "#dce1fb", fontSize: 13, fontWeight: 600 }}>
              {isNaN(price) ? "—" : fmtCoinPrice(price)}
            </span>

            <div className="flex justify-end">
              <PctBadge value={coin.priceChangePercent} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── All-coins live table ─────────────────────────────────────────────────────

function AllCoinsTable() {
  const [coins, setCoins] = useState<CoinTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // SSE — reconnect on page change
  useEffect(() => {
    setStatus("connecting");
    setLoading(true);

    const es = new EventSource(
      `${BASE}/coins/stream?page=${page}&limit=${LIMIT}`,
      { withCredentials: true },
    );

    es.onopen = () => setStatus("live");

    es.onmessage = (e) => {
      try {
        const frame = JSON.parse(e.data) as StreamFrame;
        setCoins(frame.coins);
        setTotalPages(frame.totalPages);
        setTotal(frame.total);
        setStatus("live");
        setLoading(false);
      } catch {
        // ignore malformed frames
      }
    };

    es.onerror = () => setStatus("error");

    return () => es.close();
  }, [page]);

  // Client-side sort + filter
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = q
      ? coins.filter((c) => c.symbol.toLowerCase().includes(q))
      : coins;

    rows = [...rows].sort((a, b) => {
      let delta = 0;
      if (sortKey === "rank") {
        // rank = original order (by quoteVolume from backend), just keep index stable
        delta = 0;
      } else if (sortKey === "lastPrice") {
        delta = parseFloat(b.lastPrice) - parseFloat(a.lastPrice);
      } else if (sortKey === "priceChangePercent") {
        delta = parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent);
      }
      return sortDir === "asc" ? -delta : delta;
    });

    return rows;
  }, [coins, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const offset = (page - 1) * LIMIT;

  const thStyle: React.CSSProperties = {
    color: "#909097",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      {/* Search + status row */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#909097"
            strokeWidth={2}
          >
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              background: "#0b1222",
              border: "1px solid #2e3447",
              borderRadius: 8,
              padding: "7px 12px 7px 32px",
              color: "#dce1fb",
              fontSize: 13,
              outline: "none",
              width: 220,
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          {status === "live" && (
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ color: "#4edea3", background: "rgba(78,222,163,0.1)" }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "#4edea3" }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#4edea3" }} />
              </span>
              Live
            </span>
          )}
          {status === "connecting" && (
            <span className="text-xs animate-pulse" style={{ color: "#909097" }}>Connecting…</span>
          )}
          {status === "error" && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ color: "#ffb3ad", background: "rgba(255,179,173,0.1)" }}
            >
              Disconnected
            </span>
          )}

          {total > 0 && (
            <span className="text-xs" style={{ color: "#909097" }}>
              {offset + 1}–{Math.min(page * LIMIT, total)}{" "}
              <span style={{ color: "#dce1fb" }}>of {total}</span>
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={10} />
      ) : (
        <div style={{ borderRadius: 12, border: "1px solid #2e3447", background: "#0b1222", overflow: "hidden" }}>
          {/* Header */}
          <div
            className="grid px-4 py-3"
            style={{
              gridTemplateColumns: "2.5rem 2.5rem 1fr 1fr 1fr 110px 80px",
              borderBottom: "1px solid #2e3447",
              background: "rgba(46,52,71,0.3)",
              gap: "0 8px",
              alignItems: "center",
            }}
          >
            <button style={thStyle} onClick={() => toggleSort("rank")} className="flex items-center gap-1">
              # <SortIcon active={sortKey === "rank"} dir={sortDir} />
            </button>
            <span style={thStyle}></span>
            <span style={thStyle}>Coin</span>
            <button style={thStyle} onClick={() => toggleSort("lastPrice")} className="flex items-center gap-1">
              Price <SortIcon active={sortKey === "lastPrice"} dir={sortDir} />
            </button>
            <button style={thStyle} onClick={() => toggleSort("priceChangePercent")} className="flex items-center gap-1">
              24h % <SortIcon active={sortKey === "priceChangePercent"} dir={sortDir} />
            </button>
            <span style={thStyle}>7d Chart</span>
            <span style={thStyle}></span>
          </div>

          {/* Rows */}
          {displayed.length === 0 && (
            <div className="py-12 text-center" style={{ color: "#909097", fontSize: 14 }}>
              No coins match &ldquo;{search}&rdquo;
            </div>
          )}
          {displayed.map((coin, idx) => {
            const ticker = coin.symbol.replace("USDT", "");
            const pct = parseFloat(coin.priceChangePercent);
            const isUp = pct >= 0;

            return (
              <Link
                key={coin.symbol}
                href={`/coin/${coin.symbol}`}
                className="grid px-4 transition-colors"
                style={{
                  gridTemplateColumns: "2.5rem 2.5rem 1fr 1fr 1fr 110px 80px",
                  alignItems: "center",
                  height: 64,
                  borderBottom: idx < displayed.length - 1 ? "1px solid #131c2e" : "none",
                  textDecoration: "none",
                  gap: "0 8px",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1a2235"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
              >
                {/* Rank */}
                <span style={{ color: "#909097", fontSize: 13, fontWeight: 500 }}>
                  {offset + idx + 1}
                </span>

                {/* Icon */}
                <CoinIcon ticker={ticker} size={32} />

                {/* Symbol */}
                <div className="flex flex-col leading-tight">
                  <span style={{ color: "#dce1fb", fontSize: 14, fontWeight: 700 }}>{ticker}</span>
                  <span style={{ color: "#909097", fontSize: 12 }}>{coin.symbol}</span>
                </div>

                {/* Price */}
                <span style={{ color: "#dce1fb", fontSize: 14, fontWeight: 600 }}>
                  {formatPrice(coin.lastPrice)}
                </span>

                {/* 24h % */}
                <PctBadge value={coin.priceChangePercent} />

                {/* Sparkline */}
                <div style={{ width: 100 }}>
                  {coin.sparkData && coin.sparkData.length > 0 ? (
                    <Sparkline
                      data={coin.sparkData}
                      width={100}
                      height={30}
                      stroke={isUp ? "#4edea3" : "#ffb3ad"}
                    />
                  ) : (
                    <div className="rounded animate-pulse" style={{ width: 100, height: 30, background: "#1e2a3a" }} />
                  )}
                </div>

                {/* Trade link */}
                <Link
                  href={`/coin/${coin.symbol}?tab=trade`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors text-center"
                  style={{
                    border: "1px solid #2e3447",
                    color: "#dce1fb",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2e3447"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  Trade
                </Link>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <span className="text-xs" style={{ color: "#909097" }}>
            Page{" "}
            <span style={{ color: "#dce1fb", fontWeight: 600 }}>{page}</span>{" "}
            of{" "}
            <span style={{ color: "#dce1fb", fontWeight: 600 }}>{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            {[
              { label: "«", action: () => setPage(1), disabled: page === 1 },
              { label: "‹", action: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1 },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                disabled={btn.disabled}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{
                  border: "1px solid #2e3447",
                  color: btn.disabled ? "#2e3447" : "#909097",
                  background: "transparent",
                  cursor: btn.disabled ? "not-allowed" : "pointer",
                }}
              >
                {btn.label}
              </button>
            ))}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              const active = p === page;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                  style={{
                    border: active ? "none" : "1px solid #2e3447",
                    background: active ? "#4edea3" : "transparent",
                    color: active ? "#0c1324" : "#909097",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              );
            })}

            {[
              { label: "›", action: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page === totalPages },
              { label: "»", action: () => setPage(totalPages), disabled: page === totalPages },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                disabled={btn.disabled}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{
                  border: "1px solid #2e3447",
                  color: btn.disabled ? "#2e3447" : "#909097",
                  background: "transparent",
                  cursor: btn.disabled ? "not-allowed" : "pointer",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gainers / Losers panel (fetch once) ─────────────────────────────────────

function GainerLoserPanel({ type }: { type: "gainers" | "losers" }) {
  const [data, setData] = useState<GainerLoser[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`/api/market/${type}?limit=20`)
      .then((r) => r.json())
      .then((d) => {
        setData(d[type] ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type]);

  if (loading) return <TableSkeleton rows={8} />;
  return <GainerLoserTable data={data} label={type} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketPage() {
  const [tab, setTab] = useState<MarketTab>("all");

  const tabs: { key: MarketTab; label: string }[] = [
    { key: "all", label: "All Markets" },
    { key: "gainers", label: "Top Gainers" },
    { key: "losers", label: "Top Losers" },
  ];

  return (
    <div style={{ color: "#dce1fb" }}>
      {/* Page title */}
      <div className="mb-5">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#dce1fb", marginBottom: 4 }}>
          Market Overview
        </h1>
        <p style={{ fontSize: 14, color: "#909097" }}>
          Live prices across all USDT pairs — updated every 3 seconds
        </p>
      </div>

      {/* Global stats bar */}
      <GlobalStatsBar />

      {/* Tabs */}
      <div
        className="flex items-center gap-1 mb-5"
        style={{ borderBottom: "1px solid #2e3447" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold transition-colors -mb-px"
            style={{
              borderBottom: tab === t.key ? "2px solid #4edea3" : "2px solid transparent",
              color: tab === t.key ? "#4edea3" : "#909097",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "all" && <AllCoinsTable />}
      {tab === "gainers" && <GainerLoserPanel type="gainers" />}
      {tab === "losers" && <GainerLoserPanel type="losers" />}
    </div>
  );
}
