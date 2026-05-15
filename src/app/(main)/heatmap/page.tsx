"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeatmapCoin {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

interface StreamFrame {
  coins: HeatmapCoin[];
  total: number;
  totalPages: number;
  page: number;
}

type TopNFilter = "all" | "50" | "100";
type ColorBy = "24h";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getChangeColor(pct: number): string {
  if (pct < -5) return "#7f1d1d";
  if (pct < -2) return "#991b1b";
  if (pct < -0.5) return "#b91c1c";
  if (pct <= 0.5) return "#374151";
  if (pct <= 2) return "#166534";
  if (pct <= 5) return "#15803d";
  return "#14532d";
}

function getTileSize(volume: number, minVol: number, maxVol: number): number {
  if (maxVol === minVol) return 100;
  const MIN_SIZE = 60;
  const MAX_SIZE = 240;
  const normalized = (Math.log(volume + 1) - Math.log(minVol + 1)) /
    (Math.log(maxVol + 1) - Math.log(minVol + 1));
  return Math.round(MIN_SIZE + normalized * (MAX_SIZE - MIN_SIZE));
}

function formatPrice(price: string): string {
  const n = parseFloat(price);
  if (isNaN(n)) return "—";
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

function getBaseTicker(symbol: string): string {
  // Handles BTC_USDT (Gate.io) and BTCUSDT (Binance) formats
  return symbol.replace("_USDT", "").replace("USDT", "");
}

function timeSinceSeconds(ts: number): string {
  const delta = Math.floor((Date.now() - ts) / 1000);
  if (delta < 5) return "just now";
  if (delta < 60) return `${delta}s ago`;
  return `${Math.floor(delta / 60)}m ago`;
}

// ─── SSE snapshot — collects pages until total is reached ────────────────────

async function fetchAllCoinsSnapshot(): Promise<HeatmapCoin[]> {
  return new Promise((resolve) => {
    const collected: HeatmapCoin[] = [];
    let total = 0;
    let pagesReceived = 0;
    let totalPages = 1;

    // Open one stream per page concurrently would flood the server.
    // Instead, open a single page-1 stream (large limit) to grab as many
    // coins as possible in one shot.
    const LIMIT = 200;
    const es = new EventSource(
      `${BASE}/coins/stream?page=1&limit=${LIMIT}`,
      { withCredentials: true },
    );

    const timer = setTimeout(() => {
      es.close();
      resolve(collected.length > 0 ? collected : []);
    }, 8000);

    es.onmessage = (e) => {
      try {
        const frame = JSON.parse(e.data) as StreamFrame;
        total = frame.total;
        totalPages = frame.totalPages;

        for (const coin of frame.coins) {
          if (!collected.find((c) => c.symbol === coin.symbol)) {
            collected.push(coin);
          }
        }
        pagesReceived++;

        // Got first frame — enough for a useful heatmap
        if (pagesReceived >= 1) {
          clearTimeout(timer);
          es.close();
          resolve(collected);
        }
      } catch {
        // ignore malformed frames
      }
    };

    es.onerror = () => {
      clearTimeout(timer);
      es.close();
      resolve(collected.length > 0 ? collected : []);
    };
  });
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function HeatmapLegend() {
  const stops = [
    { color: "#7f1d1d", label: "< -5%" },
    { color: "#991b1b", label: "-5%" },
    { color: "#b91c1c", label: "-2%" },
    { color: "#374151", label: "0%" },
    { color: "#166534", label: "+2%" },
    { color: "#15803d", label: "+5%" },
    { color: "#14532d", label: "> +5%" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span style={{ color: "#909097", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Change
      </span>
      <div className="flex items-center rounded overflow-hidden" style={{ border: "1px solid #2e3447" }}>
        {stops.map((s) => (
          <div
            key={s.label}
            title={s.label}
            style={{ background: s.color, width: 32, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 700 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tile tooltip ─────────────────────────────────────────────────────────────

interface TooltipData {
  symbol: string;
  ticker: string;
  price: string;
  pct: number;
  volume: number;
  x: number;
  y: number;
}

function HeatmapTooltip({ data }: { data: TooltipData }) {
  const isUp = data.pct >= 0;

  return (
    <div
      style={{
        position: "fixed",
        left: data.x + 12,
        top: data.y - 10,
        zIndex: 9999,
        background: "#0b1222",
        border: "1px solid #2e3447",
        borderRadius: 8,
        padding: "10px 14px",
        pointerEvents: "none",
        minWidth: 160,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ color: "#dce1fb", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        {data.ticker} / USDT
      </div>
      <div style={{ color: "#909097", fontSize: 12, marginBottom: 2 }}>
        Price: <span style={{ color: "#dce1fb", fontWeight: 600 }}>{formatPrice(data.price)}</span>
      </div>
      <div style={{ color: "#909097", fontSize: 12, marginBottom: 2 }}>
        24h:{" "}
        <span style={{ color: isUp ? "#4edea3" : "#ffb3ad", fontWeight: 600 }}>
          {isUp ? "+" : ""}{data.pct.toFixed(2)}%
        </span>
      </div>
      <div style={{ color: "#909097", fontSize: 12 }}>
        Vol: <span style={{ color: "#dce1fb", fontWeight: 600 }}>
          ${data.volume >= 1_000_000
            ? `${(data.volume / 1_000_000).toFixed(1)}M`
            : data.volume >= 1_000
            ? `${(data.volume / 1_000).toFixed(1)}K`
            : data.volume.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

// ─── Single tile ──────────────────────────────────────────────────────────────

interface TileProps {
  coin: HeatmapCoin;
  size: number;
  onHover: (data: TooltipData | null) => void;
  onClick: () => void;
}

function HeatmapTile({ coin, size, onHover, onClick }: TileProps) {
  const ticker = getBaseTicker(coin.symbol);
  const pct = parseFloat(coin.priceChangePercent);
  const bgColor = getChangeColor(isNaN(pct) ? 0 : pct);
  const isUp = !isNaN(pct) && pct >= 0;
  const vol = parseFloat(coin.quoteVolume) || 0;

  // Font sizes scale with tile size
  const symbolSize = Math.max(9, Math.min(18, size * 0.13));
  const priceSize = Math.max(8, Math.min(12, size * 0.09));
  const pctSize = Math.max(8, Math.min(11, size * 0.08));
  const showPrice = size >= 80;
  const showPct = size >= 70;

  function handleMouseMove(e: React.MouseEvent) {
    onHover({
      symbol: coin.symbol,
      ticker,
      price: coin.lastPrice,
      pct: isNaN(pct) ? 0 : pct,
      volume: vol,
      x: e.clientX,
      y: e.clientY,
    });
  }

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover(null)}
      style={{
        width: size,
        height: size,
        background: bgColor,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "4px 2px",
        margin: 1,
        borderRadius: 2,
        transition: "filter 0.15s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.filter = "brightness(1.25)";
      }}
    >
      <span
        style={{
          color: "white",
          fontWeight: 700,
          fontSize: symbolSize,
          lineHeight: 1.1,
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          maxWidth: "90%",
          textAlign: "center",
        }}
      >
        {ticker}
      </span>
      {showPrice && (
        <span
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: priceSize,
            lineHeight: 1.2,
            marginTop: 2,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          {formatPrice(coin.lastPrice)}
        </span>
      )}
      {showPct && (
        <span
          style={{
            color: isUp ? "#86efac" : "#fca5a5",
            fontSize: pctSize,
            fontWeight: 600,
            lineHeight: 1.2,
            marginTop: 1,
            textAlign: "center",
          }}
        >
          {isUp ? "+" : ""}{isNaN(pct) ? "0.00" : pct.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HeatmapPage() {
  const router = useRouter();
  const [coins, setCoins] = useState<HeatmapCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const [timeSince, setTimeSince] = useState("just now");
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [topN, setTopN] = useState<TopNFilter>("all");
  const [colorBy] = useState<ColorBy>("24h");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadCoins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllCoinsSnapshot();
      setCoins(data);
      setUpdatedAt(Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCoins();
  }, [loadCoins]);

  // Auto-refresh
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        loadCoins();
      }, 10_000);
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefresh, loadCoins]);

  // "X seconds ago" ticker
  useEffect(() => {
    const id = setInterval(() => {
      setTimeSince(timeSinceSeconds(updatedAt));
    }, 1000);
    return () => clearInterval(id);
  }, [updatedAt]);

  // Filter and sort coins
  const displayedCoins = (() => {
    // Sort by quoteVolume descending
    const sorted = [...coins].sort(
      (a, b) => (parseFloat(b.quoteVolume) || 0) - (parseFloat(a.quoteVolume) || 0),
    );
    if (topN === "50") return sorted.slice(0, 50);
    if (topN === "100") return sorted.slice(0, 100);
    return sorted;
  })();

  // Compute volume range for sizing
  const volumes = displayedCoins.map((c) => parseFloat(c.quoteVolume) || 0);
  const minVol = Math.min(...volumes, 0);
  const maxVol = Math.max(...volumes, 1);

  const skeletonTiles = Array.from({ length: 80 }, (_, i) => i);

  return (
    <div style={{ color: "#dce1fb", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-4">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#dce1fb", marginBottom: 4 }}>
          Market Heatmap
        </h1>
        <p style={{ fontSize: 14, color: "#909097" }}>
          {loading
            ? "Loading coins…"
            : `${displayedCoins.length} coins · updated ${timeSince}`}
        </p>
      </div>

      {/* Controls */}
      <div
        className="flex items-center gap-4 flex-wrap mb-4 px-4 py-3 rounded-xl"
        style={{ background: "#0b1222", border: "1px solid #2e3447" }}
      >
        {/* Legend */}
        <HeatmapLegend />

        <div style={{ flex: 1 }} />

        {/* Top N filter */}
        <div className="flex items-center gap-1.5">
          <span style={{ color: "#909097", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Show
          </span>
          {(["all", "50", "100"] as TopNFilter[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setTopN(opt)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: topN === opt ? "none" : "1px solid #2e3447",
                background: topN === opt ? "#4edea3" : "transparent",
                color: topN === opt ? "#0c1324" : "#909097",
                transition: "all 0.15s",
              }}
            >
              {opt === "all" ? "All" : `Top ${opt}`}
            </button>
          ))}
        </div>

        {/* Auto-refresh toggle */}
        <button
          onClick={() => setAutoRefresh((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            border: autoRefresh ? "none" : "1px solid #2e3447",
            background: autoRefresh ? "rgba(78,222,163,0.15)" : "transparent",
            color: autoRefresh ? "#4edea3" : "#909097",
            transition: "all 0.15s",
          }}
        >
          {autoRefresh && (
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "#4edea3" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "#4edea3" }}
              />
            </span>
          )}
          Auto-refresh
        </button>

        {/* Manual refresh */}
        <button
          onClick={loadCoins}
          disabled={loading}
          style={{
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            border: "1px solid #2e3447",
            background: "transparent",
            color: loading ? "#2e3447" : "#909097",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Heatmap grid */}
      <div
        style={{
          background: "#0a0a0f",
          border: "1px solid #1a1f2e",
          borderRadius: 12,
          minHeight: 400,
          padding: 2,
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
        }}
      >
        {loading
          ? skeletonTiles.map((i) => {
              const fakeSize = 60 + Math.floor(Math.random() * 80);
              return (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    width: fakeSize,
                    height: fakeSize,
                    background: "#1e2a3a",
                    margin: 1,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
              );
            })
          : displayedCoins.map((coin) => {
              const vol = parseFloat(coin.quoteVolume) || 0;
              const size = getTileSize(vol, minVol, maxVol);
              return (
                <HeatmapTile
                  key={coin.symbol}
                  coin={coin}
                  size={size}
                  onHover={setTooltip}
                  onClick={() => {
                    // Navigate to Exchange — handle both BTC_USDT and BTCUSDT formats
                    const sym = coin.symbol.replace("_", "");
                    router.push(`/Exchange/${sym}`);
                  }}
                />
              );
            })}

        {!loading && displayedCoins.length === 0 && (
          <div
            className="flex items-center justify-center w-full"
            style={{ minHeight: 300, color: "#909097", fontSize: 14 }}
          >
            No coin data available. The market feed may still be loading.
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && <HeatmapTooltip data={tooltip} />}
    </div>
  );
}
