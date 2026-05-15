"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Fish } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WhaleTrade {
  _id: string;
  userId?: string;
  username?: string;
  avatar?: string;
  symbol: string;
  type: "BUY" | "SELL";
  usdAmount: string;
  coinAmount: string;
  price: string;
  createdAt: string;
}

type Filter = "ALL" | "BUY" | "SELL";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtUSD(n: string | number): string {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtCoin(n: string): string {
  const num = parseFloat(n);
  if (!isFinite(num) || num === 0) return "0";
  if (num < 0.0001) return num.toExponential(4);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function dicebearUrl(username: string): string {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}&backgroundColor=0b1222`;
}

// ─── Rank badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  const color =
    rank === 1
      ? "#fbbf24"
      : rank === 2
      ? "#94a3b8"
      : rank === 3
      ? "#c2773c"
      : "#3e4a5e";
  return (
    <div
      className="flex items-center justify-center rounded-full text-xs font-black shrink-0"
      style={{
        width: 32,
        height: 32,
        background: rank <= 3 ? `${color}22` : "#0c1322",
        border: `1.5px solid ${color}`,
        color,
      }}
    >
      {rank}
    </div>
  );
}

// ─── Trade card ───────────────────────────────────────────────────────────────

function TradeCard({ trade, rank }: { trade: WhaleTrade; rank: number }) {
  const isBuy = trade.type === "BUY";
  const ticker = trade.symbol.replace("USDT", "").replace("_USDT", "");
  const usdVal = parseFloat(trade.usdAmount);
  const isWhale = usdVal >= 500;
  const username = trade.username ?? "Anonymous";
  const avatarUrl = trade.avatar ?? dicebearUrl(username);

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors"
      style={{
        borderBottom: "1px solid #1a2235",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#0f1a2c";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {/* Rank */}
      <RankBadge rank={rank} />

      {/* Avatar + user */}
      <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0" style={{ width: 140 }}>
        <img
          src={avatarUrl}
          alt={username}
          className="rounded-full shrink-0"
          style={{ width: 36, height: 36 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = dicebearUrl(username);
          }}
        />
        <div className="flex flex-col min-w-0">
          <Link
            href={`/u/${username}`}
            className="text-sm font-semibold truncate hover:underline"
            style={{ color: "#dce1fb" }}
          >
            {username}
          </Link>
          <span className="text-[11px]" style={{ color: "#909097" }}>
            {timeAgo(trade.createdAt)}
          </span>
        </div>
      </div>

      {/* Type badge */}
      <span
        className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0"
        style={{
          color: isBuy ? "#4edea3" : "#ffb3ad",
          background: isBuy ? "rgba(78,222,163,0.12)" : "rgba(255,179,173,0.12)",
          border: `1px solid ${isBuy ? "rgba(78,222,163,0.3)" : "rgba(255,179,173,0.3)"}`,
        }}
      >
        {trade.type}
      </span>

      {/* Symbol */}
      <Link
        href={`/coin/${trade.symbol}?tab=trade`}
        className="font-mono font-bold text-sm shrink-0 hover:underline"
        style={{ color: "#dce1fb", minWidth: 90 }}
      >
        {ticker}/USDT
      </Link>

      {/* Amount details */}
      <div className="flex-1 min-w-0">
        <span className="text-xs" style={{ color: "#909097" }}>
          {fmtCoin(trade.coinAmount)} {ticker} @ {fmtUSD(trade.price)} ={" "}
          <span className="font-bold" style={{ color: "#dce1fb" }}>
            {fmtUSD(trade.usdAmount)}
          </span>
        </span>
      </div>

      {/* Whale badge */}
      {isWhale && (
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
          style={{
            background: "rgba(78,222,163,0.1)",
            border: "1px solid rgba(78,222,163,0.3)",
            color: "#4edea3",
          }}
        >
          <Fish className="h-3 w-3" />
          Whale
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 animate-pulse"
      style={{ borderBottom: "1px solid #1a2235" }}
    >
      <div className="h-8 w-8 rounded-full shrink-0" style={{ background: "#1e2a3a" }} />
      <div className="flex items-center gap-2.5" style={{ width: 140 }}>
        <div className="h-9 w-9 rounded-full shrink-0" style={{ background: "#1e2a3a" }} />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-20 rounded" style={{ background: "#1e2a3a" }} />
          <div className="h-2 w-14 rounded" style={{ background: "#18202e" }} />
        </div>
      </div>
      <div className="h-5 w-12 rounded-full" style={{ background: "#1e2a3a" }} />
      <div className="h-4 w-20 rounded" style={{ background: "#1e2a3a" }} />
      <div className="h-3 w-48 rounded flex-1" style={{ background: "#1e2a3a" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WhalesPage() {
  const [allTrades, setAllTrades] = useState<WhaleTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrades = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/trades?limit=50&page=1");
      if (res.ok) {
        const data = await res.json();
        const trades: WhaleTrade[] = (data?.trades ?? []);
        // Sort by USD amount descending
        trades.sort((a, b) => parseFloat(b.usdAmount) - parseFloat(a.usdAmount));
        setAllTrades(trades);
      }
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const filtered =
    filter === "ALL" ? allTrades : allTrades.filter((t) => t.type === filter);

  const whaleCount = allTrades.filter((t) => parseFloat(t.usdAmount) >= 500).length;

  return (
    <div style={{ color: "#dce1fb" }}>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Fish className="h-6 w-6" style={{ color: "#4edea3" }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#dce1fb" }}>
              Whale Tracker
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "#909097" }}>
            Your largest trades — sorted by USD volume
            {whaleCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(78,222,163,0.1)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.25)" }}>
                {whaleCount} whale trade{whaleCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => fetchTrades(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shrink-0"
          style={{ borderColor: "#2e3447", color: refreshing ? "#3e4a5e" : "#909097" }}
          onMouseEnter={(e) => {
            if (!refreshing) (e.currentTarget as HTMLButtonElement).style.color = "#dce1fb";
          }}
          onMouseLeave={(e) => {
            if (!refreshing) (e.currentTarget as HTMLButtonElement).style.color = "#909097";
          }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-lg overflow-hidden border mb-4" style={{ borderColor: "#2e3447", width: "fit-content" }}>
        {(["ALL", "BUY", "SELL"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
            style={{
              background:
                filter === f
                  ? f === "BUY"
                    ? "rgba(78,222,163,0.15)"
                    : f === "SELL"
                    ? "rgba(255,179,173,0.15)"
                    : "#1a2235"
                  : "transparent",
              color:
                filter === f
                  ? f === "BUY"
                    ? "#4edea3"
                    : f === "SELL"
                    ? "#ffb3ad"
                    : "#dce1fb"
                  : "#909097",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Card list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#0b1222", border: "1px solid #2e3447" }}
      >
        {loading ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div
            className="py-16 text-center"
            style={{ color: "#909097", fontSize: 14 }}
          >
            {allTrades.length === 0
              ? "No trades found. Make your first trade to see it here."
              : `No ${filter} trades found.`}
          </div>
        ) : (
          filtered.map((trade, i) => (
            <TradeCard key={trade._id} trade={trade} rank={i + 1} />
          ))
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-center mt-4" style={{ color: "#3e4a5e" }}>
          Showing top {filtered.length} trade{filtered.length !== 1 ? "s" : ""} sorted by USD amount
        </p>
      )}
    </div>
  );
}
