"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Plus, BarChart2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoinSeries {
  pair: string;       // e.g. "BTC_USDT"
  label: string;      // e.g. "BTC"
  color: string;
  pctPoints: { time: number; value: number }[]; // normalized % change from first close
  currentPct: number;
  loading: boolean;
  error: string | null;
}

type Timeframe = "1D" | "1W" | "1M";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ["#4edea3", "#f59e0b", "#a78bfa", "#ef4444"];
const MAX_COINS = 4;

const TIMEFRAME_CONFIG: Record<Timeframe, { interval: string; limit: number }> = {
  "1D": { interval: "30m", limit: 48 },
  "1W": { interval: "4h",  limit: 42 },
  "1M": { interval: "1d",  limit: 30 },
};

// ─── Gateio candle fetch ──────────────────────────────────────────────────────
// Candle format: [timestamp, volume, close, high, low, open]
// Index 2 = close price

async function fetchCandles(
  pair: string,
  interval: string,
  limit: number
): Promise<number[]> {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=${encodeURIComponent(
    pair
  )}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Gate.io error ${res.status}`);
  const data: string[][] = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("No data returned");
  // Each candle: [timestamp_sec, vol, close, high, low, open]
  return data.map((c) => parseFloat(c[2]));
}

function normalizeToPercent(closes: number[]): { time: number; value: number }[] {
  if (closes.length === 0) return [];
  const base = closes[0];
  if (!base || base === 0) return [];
  return closes.map((c, i) => ({
    time: i,
    value: parseFloat((((c - base) / base) * 100).toFixed(4)),
  }));
}

// ─── SVG chart (no external dependency needed — just math) ───────────────────

interface SvgChartProps {
  series: CoinSeries[];
  width?: number;
  height?: number;
}

function SvgChart({ series, width = 800, height = 320 }: SvgChartProps) {
  const activeSeries = series.filter((s) => s.pctPoints.length > 0 && !s.loading && !s.error);
  if (activeSeries.length === 0) return null;

  const PAD = { top: 24, right: 20, bottom: 32, left: 52 };
  const W = width - PAD.left - PAD.right;
  const H = height - PAD.top - PAD.bottom;

  // Compute value range across all series
  const allValues = activeSeries.flatMap((s) => s.pctPoints.map((p) => p.value));
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const pad = Math.max(0.5, (maxV - minV) * 0.1);
  const yMin = minV - pad;
  const yMax = maxV + pad;
  const yRange = yMax - yMin || 1;

  // Max time index (all series normalized to same length via index)
  const maxT = Math.max(...activeSeries.map((s) => s.pctPoints.length - 1), 1);

  function toX(t: number) {
    return PAD.left + (t / maxT) * W;
  }
  function toY(v: number) {
    return PAD.top + H - ((v - yMin) / yRange) * H;
  }

  // Y-axis ticks
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const v = yMin + (i / tickCount) * yRange;
    return { v, y: toY(v) };
  });

  // Zero line
  const zeroY = toY(0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%" }}
      aria-label="Multi-coin comparison chart"
    >
      {/* Grid lines */}
      {yTicks.map(({ v, y }) => (
        <g key={v}>
          <line
            x1={PAD.left}
            y1={y}
            x2={PAD.left + W}
            y2={y}
            stroke="#1e2a3a"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 6}
            y={y + 4}
            textAnchor="end"
            fontSize={10}
            fill="#909097"
          >
            {v >= 0 ? "+" : ""}{v.toFixed(1)}%
          </text>
        </g>
      ))}

      {/* Zero line (highlighted) */}
      <line
        x1={PAD.left}
        y1={zeroY}
        x2={PAD.left + W}
        y2={zeroY}
        stroke="#2e3447"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />

      {/* Series lines */}
      {activeSeries.map((s) => {
        const pts = s.pctPoints;
        if (pts.length < 2) return null;
        const d = pts
          .map((p, i) =>
            i === 0
              ? `M ${toX(p.time).toFixed(1)} ${toY(p.value).toFixed(1)}`
              : `L ${toX(p.time).toFixed(1)} ${toY(p.value).toFixed(1)}`
          )
          .join(" ");
        return (
          <path
            key={s.pair}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}

      {/* End dots */}
      {activeSeries.map((s) => {
        const last = s.pctPoints[s.pctPoints.length - 1];
        if (!last) return null;
        return (
          <circle
            key={`dot-${s.pair}`}
            cx={toX(last.time)}
            cy={toY(last.value)}
            r={4}
            fill={s.color}
          />
        );
      })}
    </svg>
  );
}

// ─── Coin input row ───────────────────────────────────────────────────────────

function CoinInputRow({
  value,
  color,
  onRemove,
  onChange,
  onAdd,
  isLast,
  disabled,
}: {
  value: string;
  color: string;
  onRemove: () => void;
  onChange: (v: string) => void;
  onAdd: () => void;
  isLast: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-full shrink-0"
        style={{ background: color }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="BTC_USDT"
        className="rounded-lg px-3 py-1.5 text-sm font-mono outline-none flex-1"
        style={{
          background: "#0c1322",
          border: "1px solid #2e3447",
          color: "#dce1fb",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = color;
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderColor = "#2e3447";
        }}
      />
      <button
        onClick={onRemove}
        className="h-7 w-7 flex items-center justify-center rounded-md transition-colors"
        style={{ color: "#3e4a5e" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#ffb3ad";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#3e4a5e";
        }}
        title="Remove coin"
      >
        <X className="h-4 w-4" />
      </button>
      {isLast && !disabled && (
        <button
          onClick={onAdd}
          className="h-7 w-7 flex items-center justify-center rounded-md transition-colors shrink-0"
          style={{
            background: "rgba(78,222,163,0.12)",
            border: "1px solid rgba(78,222,163,0.25)",
            color: "#4edea3",
          }}
          title="Add coin"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [pairs, setPairs] = useState<string[]>(["BTC_USDT", "ETH_USDT"]);
  const [timeframe, setTimeframe] = useState<Timeframe>("1W");
  const [series, setSeries] = useState<CoinSeries[]>([]);
  const abortRefs = useRef<Map<string, AbortController>>(new Map());

  const loadCoin = useCallback(
    async (pair: string, color: string, tf: Timeframe) => {
      // Cancel any in-flight request for the same pair
      const existing = abortRefs.current.get(pair);
      if (existing) existing.abort();
      const ctrl = new AbortController();
      abortRefs.current.set(pair, ctrl);

      const label = pair.replace("_USDT", "").replace("USDT", "");

      // Set loading state
      setSeries((prev) => {
        const idx = prev.findIndex((s) => s.pair === pair);
        const entry: CoinSeries = {
          pair,
          label,
          color,
          pctPoints: [],
          currentPct: 0,
          loading: true,
          error: null,
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = entry;
          return next;
        }
        return [...prev, entry];
      });

      try {
        const { interval, limit } = TIMEFRAME_CONFIG[tf];
        const closes = await fetchCandles(pair, interval, limit);
        if (ctrl.signal.aborted) return;
        const pctPoints = normalizeToPercent(closes);
        const currentPct = pctPoints.length > 0 ? pctPoints[pctPoints.length - 1].value : 0;

        setSeries((prev) => {
          const idx = prev.findIndex((s) => s.pair === pair);
          const entry: CoinSeries = {
            pair,
            label,
            color,
            pctPoints,
            currentPct,
            loading: false,
            error: null,
          };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = entry;
            return next;
          }
          return [...prev, entry];
        });
      } catch (err) {
        if (ctrl.signal.aborted) return;
        const msg = err instanceof Error ? err.message : "Failed to load";
        setSeries((prev) => {
          const idx = prev.findIndex((s) => s.pair === pair);
          const entry: CoinSeries = {
            pair,
            label,
            color,
            pctPoints: [],
            currentPct: 0,
            loading: false,
            error: msg,
          };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = entry;
            return next;
          }
          return [...prev, entry];
        });
      }
    },
    []
  );

  // Reload all when timeframe or pairs change
  useEffect(() => {
    // Remove series for pairs no longer present
    setSeries((prev) => prev.filter((s) => pairs.includes(s.pair)));

    // Load each pair
    pairs.forEach((pair, i) => {
      const color = COLORS[i % COLORS.length];
      loadCoin(pair, color, timeframe);
    });

    return () => {
      // Abort all in-flight requests on cleanup
      abortRefs.current.forEach((ctrl) => ctrl.abort());
      abortRefs.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs, timeframe]);

  function addCoin() {
    if (pairs.length >= MAX_COINS) return;
    setPairs((p) => [...p, ""]);
  }

  function removeCoin(i: number) {
    setPairs((p) => {
      if (p.length <= 1) return p;
      return p.filter((_, idx) => idx !== i);
    });
  }

  function updatePair(i: number, val: string) {
    setPairs((p) => {
      const next = [...p];
      next[i] = val;
      return next;
    });
  }

  const isAnyLoading = series.some((s) => s.loading);
  const hasData = series.some((s) => s.pctPoints.length > 0);

  return (
    <div style={{ color: "#dce1fb" }}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="h-6 w-6" style={{ color: "#4edea3" }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#dce1fb" }}>
            Multi-Coin Compare
          </h1>
        </div>
        <p style={{ fontSize: 14, color: "#909097" }}>
          Overlay % change of up to {MAX_COINS} coins on a single chart
        </p>
      </div>

      {/* Controls panel */}
      <div
        className="rounded-xl p-5 mb-5 flex flex-col gap-4"
        style={{ background: "#0b1222", border: "1px solid #2e3447" }}
      >
        {/* Coin selectors */}
        <div className="flex flex-col gap-2">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#909097",
            }}
          >
            Coins (up to {MAX_COINS})
          </span>
          {pairs.map((pair, i) => (
            <CoinInputRow
              key={i}
              value={pair}
              color={COLORS[i % COLORS.length]}
              onRemove={() => removeCoin(i)}
              onChange={(v) => updatePair(i, v)}
              onAdd={addCoin}
              isLast={i === pairs.length - 1}
              disabled={pairs.length >= MAX_COINS}
            />
          ))}
          {pairs.length < MAX_COINS && pairs.every((p, i) => i < pairs.length - 1) && (
            <button
              onClick={addCoin}
              className="flex items-center gap-1.5 text-xs font-semibold w-fit px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: "rgba(78,222,163,0.08)",
                border: "1px solid rgba(78,222,163,0.2)",
                color: "#4edea3",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Coin
            </button>
          )}
        </div>

        {/* Timeframe */}
        <div className="flex items-center gap-3">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#909097",
            }}
          >
            Timeframe
          </span>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #2e3447" }}>
            {(["1D", "1W", "1M"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className="px-4 py-1.5 text-xs font-bold transition-colors"
                style={{
                  background: timeframe === tf ? "#4edea3" : "transparent",
                  color: timeframe === tf ? "#0c1322" : "#909097",
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div
        className="rounded-xl overflow-hidden mb-4"
        style={{
          background: "#0b1222",
          border: "1px solid #2e3447",
          minHeight: 360,
          position: "relative",
        }}
      >
        {isAnyLoading && !hasData ? (
          <div
            className="flex items-center justify-center"
            style={{ height: 360, color: "#909097", fontSize: 14 }}
          >
            <span className="animate-pulse">Loading chart data…</span>
          </div>
        ) : !hasData ? (
          <div
            className="flex items-center justify-center"
            style={{ height: 360, color: "#909097", fontSize: 14 }}
          >
            Enter at least one valid pair (e.g. BTC_USDT) to see the chart.
          </div>
        ) : (
          <div style={{ padding: "16px 8px 8px", height: 360 }}>
            <SvgChart series={series} width={900} height={340} />
          </div>
        )}

        {/* Loading overlay for refreshes */}
        {isAnyLoading && hasData && (
          <div
            className="absolute top-3 right-4 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(78,222,163,0.12)", color: "#4edea3" }}
          >
            <span className="animate-pulse">Updating…</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className="rounded-xl px-5 py-4 flex flex-wrap gap-6"
        style={{ background: "#0b1222", border: "1px solid #2e3447" }}
      >
        {pairs.map((pair, i) => {
          const s = series.find((s) => s.pair === pair);
          const color = COLORS[i % COLORS.length];
          const label = pair.replace("_USDT", "").replace("USDT", "") || "—";
          const pct = s?.currentPct ?? 0;
          const isUp = pct >= 0;

          return (
            <div key={pair + i} className="flex items-center gap-2.5">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: color }}
              />
              <span className="text-sm font-bold" style={{ color: "#dce1fb" }}>
                {label}
              </span>
              {s?.loading ? (
                <span className="text-xs animate-pulse" style={{ color: "#3e4a5e" }}>
                  loading…
                </span>
              ) : s?.error ? (
                <span className="text-xs" style={{ color: "#ffb3ad" }}>
                  error
                </span>
              ) : s?.pctPoints.length ? (
                <span
                  className="text-sm font-mono font-bold"
                  style={{ color: isUp ? "#4edea3" : "#ffb3ad" }}
                >
                  {isUp ? "+" : ""}{pct.toFixed(2)}%
                </span>
              ) : null}
            </div>
          );
        })}
        {series.every((s) => s.pctPoints.length === 0 && !s.loading) && (
          <span className="text-xs" style={{ color: "#3e4a5e" }}>
            No chart data — check pair names use Gate.io format (e.g. BTC_USDT)
          </span>
        )}
      </div>
    </div>
  );
}
