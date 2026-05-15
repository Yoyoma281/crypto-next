"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { ArrowLeft, ChevronRight, RotateCcw, TrendingUp } from "lucide-react";
import { SCENARIOS } from "../page";

// ── Design tokens ──────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const CARD = "#12121a";
const BORDER = "rgba(255,255,255,0.07)";
const MUTED = "#909097";
const TEXT = "#e8e8f0";
const TEXT_DIM = "#c2c2cc";
const BUY_COLOR = "#00d4aa";
const SELL_COLOR = "#ef4444";
const GREEN = "#4edea3";

// ── Types ──────────────────────────────────────────────────────────────────
interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  id: number;
  type: "BUY" | "SELL";
  price: number;
  amount: number; // USDT spent or received
  coins: number; // coins bought or sold
  time: UTCTimestamp;
  balance: number;
}

// ── Gate.io candle fetch ───────────────────────────────────────────────────
// Gate.io candlestick format: [timestamp, volume, close, high, low, open]
async function fetchGateioCandles(
  symbol: string,
  interval: string,
  from: number,
  to: number
): Promise<Candle[]> {
  // Gate.io has a limit of 1000 candles per request — paginate if needed
  const allCandles: Candle[] = [];
  let cursor = from;
  const LIMIT = 1000;

  while (cursor < to) {
    const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=${symbol}&interval=${interval}&from=${cursor}&to=${to}&limit=${LIMIT}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gate.io ${res.status}`);
    const raw: string[][] = await res.json();
    if (!raw || raw.length === 0) break;

    for (const r of raw) {
      allCandles.push({
        time: parseInt(r[0]) as UTCTimestamp,
        volume: parseFloat(r[1]),
        close: parseFloat(r[2]),
        high: parseFloat(r[3]),
        low: parseFloat(r[4]),
        open: parseFloat(r[5]),
      });
    }

    // If we got fewer than LIMIT, we've reached the end
    if (raw.length < LIMIT) break;

    // Advance cursor past the last candle's timestamp
    cursor = parseInt(raw[raw.length - 1][0]) + 1;
  }

  // Sort ascending by time (Gate.io returns oldest-first but be safe)
  allCandles.sort((a, b) => (a.time as number) - (b.time as number));

  return allCandles;
}

// ── Number formatting ──────────────────────────────────────────────────────
function fmtPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(8);
}

function fmtCoins(n: number, symbol: string): string {
  const base = symbol.replace("_USDT", "");
  if (n === 0) return `0 ${base}`;
  if (n >= 1) return `${n.toFixed(4)} ${base}`;
  return `${n.toFixed(8)} ${base}`;
}

function fmtDate(ts: UTCTimestamp): string {
  return new Date((ts as number) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Input field ────────────────────────────────────────────────────────────
function TradeInput({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 700,
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          min={0}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0.00"}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${BORDER}`,
            borderRadius: 9,
            padding: "0.65rem 3.2rem 0.65rem 0.85rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: TEXT,
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = BORDER)
          }
        />
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: MUTED,
          }}
        >
          {suffix}
        </span>
      </div>
    </div>
  );
}

// ── Results overlay ────────────────────────────────────────────────────────
function ResultsOverlay({
  startingBalance,
  finalValue,
  tradeCount,
  onReset,
}: {
  startingBalance: number;
  finalValue: number;
  tradeCount: number;
  onReset: () => void;
}) {
  const pnl = finalValue - startingBalance;
  const pnlPct = (pnl / startingBalance) * 100;
  const isProfit = pnl >= 0;
  const pnlColor = isProfit ? GREEN : SELL_COLOR;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          padding: "2rem 2.25rem",
          maxWidth: 420,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `${pnlColor}18`,
              border: `2px solid ${pnlColor}50`,
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            {isProfit ? "🏆" : "📉"}
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              color: TEXT,
              marginBottom: "0.25rem",
            }}
          >
            Scenario Complete
          </div>
          <div style={{ fontSize: "0.85rem", color: MUTED }}>
            {isProfit
              ? "Nice work — you came out ahead!"
              : "Tough market — the history doesn't lie."}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {[
            {
              label: "Starting Balance",
              value: `$${startingBalance.toLocaleString()}`,
              color: MUTED,
            },
            {
              label: "Final Portfolio Value",
              value: `$${finalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
              color: TEXT,
              bold: true,
            },
            {
              label: "P&L",
              value: `${isProfit ? "+" : ""}$${pnl.toLocaleString("en-US", { maximumFractionDigits: 2 })} (${isProfit ? "+" : ""}${pnlPct.toFixed(2)}%)`,
              color: pnlColor,
              bold: true,
            },
            {
              label: "Total Trades",
              value: String(tradeCount),
              color: TEXT_DIM,
            },
          ].map(({ label, value, color, bold }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.82rem", color: MUTED }}>{label}</span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: bold ? 800 : 600,
                  color,
                  fontFamily: "monospace",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onReset}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              padding: "0.75rem",
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              background: "transparent",
              color: TEXT_DIM,
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor = BORDER)
            }
          >
            <RotateCcw style={{ width: 14, height: 14 }} />
            Try Again
          </button>
          <Link
            href="/scenarios"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              padding: "0.75rem",
              borderRadius: 10,
              background: "linear-gradient(135deg, #4edea3, #2fc98e)",
              color: "#071a11",
              fontSize: "0.85rem",
              fontWeight: 800,
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
            }
          >
            Other Scenarios
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ScenarioTradingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const scenario = SCENARIOS.find((s) => s.id === id);

  // Chart refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Data state
  const [allCandles, setAllCandles] = useState<Candle[]>([]);
  const [revealedCount, setRevealedCount] = useState(20);
  const [loadingCandles, setLoadingCandles] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Trading state
  const [balance, setBalance] = useState(scenario?.startingBalance ?? 10000);
  const [holdings, setHoldings] = useState(0);
  const [avgCost, setAvgCost] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [finished, setFinished] = useState(false);

  // Input state
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");

  // Derived
  const revealedCandles = allCandles.slice(0, revealedCount);
  const currentCandle = revealedCandles[revealedCandles.length - 1];
  const currentPrice = currentCandle?.close ?? 0;
  const holdingsValue = holdings * currentPrice;
  const totalValue = balance + holdingsValue;
  const startingBalance = scenario?.startingBalance ?? 10000;
  const pnl = totalValue - startingBalance;
  const pnlPct = startingBalance > 0 ? (pnl / startingBalance) * 100 : 0;
  const isProfit = pnl >= 0;

  // ── Initialize chart ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0f" },
        textColor: "#909097",
        fontFamily: "monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e2535" },
        horzLines: { color: "#1e2535" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#4edea350", labelBackgroundColor: "#1a2235" },
        horzLine: { color: "#4edea350", labelBackgroundColor: "#1a2235" },
      },
      rightPriceScale: { borderColor: "#2e3447" },
      timeScale: {
        borderColor: "#2e3447",
        timeVisible: true,
        secondsVisible: false,
      },
      width: el.clientWidth,
      height: el.clientHeight,
    });

    const series = chart.addCandlestickSeries({
      upColor: "#4edea3",
      downColor: "#ef4444",
      borderUpColor: "#4edea3",
      borderDownColor: "#ef4444",
      wickUpColor: "#4edea3",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  // ── Fetch candles ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scenario) return;
    setLoadingCandles(true);
    setFetchError(null);

    fetchGateioCandles(
      scenario.symbol,
      scenario.interval,
      scenario.fromTs,
      scenario.toTs
    )
      .then((candles) => {
        setAllCandles(candles);
        setRevealedCount(Math.min(20, candles.length));
      })
      .catch((err: unknown) => {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load candles"
        );
      })
      .finally(() => setLoadingCandles(false));
  }, [scenario]);

  // ── Update chart when revealed candles change ─────────────────────────────
  useEffect(() => {
    if (!candleSeriesRef.current || revealedCandles.length === 0) return;
    candleSeriesRef.current.setData(
      revealedCandles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [revealedCandles]);

  // ── Trading logic ─────────────────────────────────────────────────────────
  const handleBuy = useCallback(() => {
    const usdtAmount = parseFloat(buyAmount);
    if (!usdtAmount || usdtAmount <= 0 || usdtAmount > balance || currentPrice <= 0)
      return;

    const coins = usdtAmount / currentPrice;
    const newHoldings = holdings + coins;
    const newAvgCost =
      newHoldings > 0
        ? (holdings * avgCost + coins * currentPrice) / newHoldings
        : 0;

    setBalance((b) => b - usdtAmount);
    setHoldings(newHoldings);
    setAvgCost(newAvgCost);
    setTrades((prev) => [
      {
        id: Date.now(),
        type: "BUY",
        price: currentPrice,
        amount: usdtAmount,
        coins,
        time: currentCandle.time,
        balance: balance - usdtAmount,
      },
      ...prev,
    ]);
    setBuyAmount("");
  }, [buyAmount, balance, holdings, avgCost, currentPrice, currentCandle]);

  const handleSell = useCallback(() => {
    const coinsToSell = parseFloat(sellAmount);
    if (
      !coinsToSell ||
      coinsToSell <= 0 ||
      coinsToSell > holdings ||
      currentPrice <= 0
    )
      return;

    const usdtReceived = coinsToSell * currentPrice;
    const newHoldings = holdings - coinsToSell;

    setBalance((b) => b + usdtReceived);
    setHoldings(newHoldings);
    if (newHoldings <= 0) setAvgCost(0);
    setTrades((prev) => [
      {
        id: Date.now(),
        type: "SELL",
        price: currentPrice,
        amount: usdtReceived,
        coins: coinsToSell,
        time: currentCandle.time,
        balance: balance + usdtReceived,
      },
      ...prev,
    ]);
    setSellAmount("");
  }, [sellAmount, holdings, currentPrice, currentCandle, balance]);

  const handleNextCandle = useCallback(() => {
    if (revealedCount >= allCandles.length) {
      setFinished(true);
    } else {
      setRevealedCount((c) => c + 1);
    }
  }, [revealedCount, allCandles.length]);

  const handleReset = useCallback(() => {
    setBalance(scenario?.startingBalance ?? 10000);
    setHoldings(0);
    setAvgCost(0);
    setTrades([]);
    setRevealedCount(Math.min(20, allCandles.length));
    setFinished(false);
    setBuyAmount("");
    setSellAmount("");
  }, [scenario, allCandles.length]);

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (!scenario) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          color: TEXT,
        }}
      >
        <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>
          Scenario not found
        </div>
        <Link
          href="/scenarios"
          style={{ color: GREEN, textDecoration: "none", fontSize: "0.9rem" }}
        >
          Back to Scenarios
        </Link>
      </div>
    );
  }

  const baseSymbol = scenario.symbol.replace("_USDT", "");
  const isAtEnd = revealedCount >= allCandles.length && allCandles.length > 0;
  const progress =
    allCandles.length > 0
      ? Math.round((revealedCount / allCandles.length) * 100)
      : 0;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1.25rem",
            borderBottom: `1px solid ${BORDER}`,
            background: CARD,
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <Link
              href="/scenarios"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                color: MUTED,
                textDecoration: "none",
                fontSize: "0.82rem",
                fontWeight: 600,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = TEXT)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = MUTED)
              }
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Scenarios
            </Link>
            <span style={{ color: BORDER }}>|</span>
            <div>
              <span
                style={{ fontWeight: 800, fontSize: "0.95rem", color: TEXT }}
              >
                {scenario.name}
              </span>
              <span
                style={{ fontSize: "0.78rem", color: MUTED, marginLeft: "0.5rem" }}
              >
                {scenario.symbol.replace("_", "/")}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.78rem",
              color: MUTED,
            }}
          >
            <span>
              Candle {revealedCount} / {allCandles.length || "..."}
            </span>
            <div
              style={{
                width: 120,
                height: 5,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #4edea3, #2fc98e)",
                  borderRadius: 3,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span style={{ fontFamily: "monospace" }}>{progress}%</span>
          </div>
        </div>

        {/* Main layout: chart (left 60%) + panel (right 40%) */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* ── Left: Chart ─────────────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderRight: `1px solid ${BORDER}`,
                minHeight: "calc(100vh - 56px)",
              }}
            >
              {/* Chart header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  borderBottom: `1px solid ${BORDER}`,
                  background: "#0d0d14",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <TrendingUp
                    style={{ width: 14, height: 14, color: GREEN }}
                  />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: TEXT_DIM }}>
                    {scenario.symbol.replace("_", "/")} · {scenario.interval.toUpperCase()}
                  </span>
                </div>
                {currentCandle && (
                  <div style={{ fontSize: "0.8rem", color: MUTED }}>
                    {fmtDate(currentCandle.time)}
                  </div>
                )}
              </div>

              {/* Loading / error */}
              {loadingCandles && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: MUTED,
                    fontSize: "0.85rem",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      border: `2px solid ${GREEN}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Loading historical candles...
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              {fetchError && !loadingCandles && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: SELL_COLOR,
                    fontSize: "0.85rem",
                  }}
                >
                  Failed to load candles: {fetchError}
                </div>
              )}

              {/* Chart canvas */}
              <div
                ref={chartContainerRef}
                style={{
                  flex: 1,
                  width: "100%",
                  display: loadingCandles || fetchError ? "none" : "block",
                }}
              />
            </div>

            {/* ── Right: Trading panel ─────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                padding: "1rem",
                gap: "0.85rem",
                background: "#0d0d14",
              }}
            >
              {/* Portfolio stats */}
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: MUTED,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Portfolio
                </span>
                {[
                  {
                    label: "Balance",
                    value: `$${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
                    color: TEXT,
                  },
                  {
                    label: "Holdings",
                    value: fmtCoins(holdings, scenario.symbol),
                    color: TEXT_DIM,
                  },
                  {
                    label: "Current Price",
                    value: currentPrice > 0 ? `$${fmtPrice(currentPrice)}` : "—",
                    color: TEXT,
                  },
                  {
                    label: "Avg Cost",
                    value:
                      avgCost > 0 ? `$${fmtPrice(avgCost)}` : "—",
                    color: TEXT_DIM,
                  },
                  {
                    label: "Total Value",
                    value: `$${totalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
                    color: TEXT,
                    bold: true,
                  },
                  {
                    label: "P&L",
                    value: `${isProfit ? "+" : ""}$${pnl.toLocaleString("en-US", { maximumFractionDigits: 2 })} (${isProfit ? "+" : ""}${pnlPct.toFixed(2)}%)`,
                    color: isProfit ? GREEN : SELL_COLOR,
                    bold: true,
                  },
                ].map(({ label, value, color, bold }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", color: MUTED }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: bold ? 800 : 600,
                        color,
                        fontFamily: "monospace",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buy panel */}
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: BUY_COLOR,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Buy {baseSymbol}
                </span>
                <TradeInput
                  label={`Amount (USDT)`}
                  value={buyAmount}
                  onChange={setBuyAmount}
                  suffix="USDT"
                  placeholder={`Max $${balance.toFixed(2)}`}
                />
                {buyAmount && parseFloat(buyAmount) > 0 && currentPrice > 0 && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: MUTED,
                      background: "rgba(0,212,170,0.06)",
                      border: "1px solid rgba(0,212,170,0.15)",
                      borderRadius: 7,
                      padding: "0.4rem 0.65rem",
                    }}
                  >
                    You&apos;ll receive ~{" "}
                    <span style={{ color: BUY_COLOR, fontWeight: 700 }}>
                      {(parseFloat(buyAmount) / currentPrice).toFixed(8)}{" "}
                      {baseSymbol}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleBuy}
                  disabled={
                    !buyAmount ||
                    parseFloat(buyAmount) <= 0 ||
                    parseFloat(buyAmount) > balance ||
                    currentPrice <= 0
                  }
                  style={{
                    padding: "0.65rem",
                    borderRadius: 9,
                    border: "none",
                    background:
                      !buyAmount ||
                      parseFloat(buyAmount) <= 0 ||
                      parseFloat(buyAmount) > balance
                        ? "rgba(0,212,170,0.18)"
                        : `linear-gradient(135deg, ${BUY_COLOR}, #00b896)`,
                    color:
                      !buyAmount ||
                      parseFloat(buyAmount) <= 0 ||
                      parseFloat(buyAmount) > balance
                        ? `${BUY_COLOR}55`
                        : "#041a14",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor:
                      !buyAmount ||
                      parseFloat(buyAmount) <= 0 ||
                      parseFloat(buyAmount) > balance
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Buy {baseSymbol}
                </button>
              </div>

              {/* Sell panel */}
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: SELL_COLOR,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Sell {baseSymbol}
                </span>
                <TradeInput
                  label={`Amount (${baseSymbol})`}
                  value={sellAmount}
                  onChange={setSellAmount}
                  suffix={baseSymbol}
                  placeholder={`Max ${holdings.toFixed(8)}`}
                />
                {sellAmount && parseFloat(sellAmount) > 0 && currentPrice > 0 && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: MUTED,
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      borderRadius: 7,
                      padding: "0.4rem 0.65rem",
                    }}
                  >
                    You&apos;ll receive ~{" "}
                    <span style={{ color: SELL_COLOR, fontWeight: 700 }}>
                      $
                      {(parseFloat(sellAmount) * currentPrice).toLocaleString(
                        "en-US",
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      USDT
                    </span>
                  </div>
                )}
                <button
                  onClick={handleSell}
                  disabled={
                    !sellAmount ||
                    parseFloat(sellAmount) <= 0 ||
                    parseFloat(sellAmount) > holdings ||
                    currentPrice <= 0
                  }
                  style={{
                    padding: "0.65rem",
                    borderRadius: 9,
                    border: "none",
                    background:
                      !sellAmount ||
                      parseFloat(sellAmount) <= 0 ||
                      parseFloat(sellAmount) > holdings
                        ? "rgba(239,68,68,0.18)"
                        : `linear-gradient(135deg, ${SELL_COLOR}, #d03535)`,
                    color:
                      !sellAmount ||
                      parseFloat(sellAmount) <= 0 ||
                      parseFloat(sellAmount) > holdings
                        ? `${SELL_COLOR}55`
                        : "#fff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor:
                      !sellAmount ||
                      parseFloat(sellAmount) <= 0 ||
                      parseFloat(sellAmount) > holdings
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Sell {baseSymbol}
                </button>
              </div>

              {/* Next candle / Finish button */}
              <button
                onClick={handleNextCandle}
                disabled={loadingCandles || allCandles.length === 0}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: 10,
                  border: "none",
                  background:
                    loadingCandles || allCandles.length === 0
                      ? "rgba(78,222,163,0.15)"
                      : isAtEnd
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : "linear-gradient(135deg, #4edea3, #2fc98e)",
                  color:
                    loadingCandles || allCandles.length === 0
                      ? "rgba(78,222,163,0.4)"
                      : isAtEnd
                      ? "#1a0f00"
                      : "#071a11",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  cursor:
                    loadingCandles || allCandles.length === 0
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  transition: "all 0.15s",
                  boxShadow:
                    loadingCandles || allCandles.length === 0
                      ? "none"
                      : isAtEnd
                      ? "0 4px 14px rgba(245,158,11,0.35)"
                      : "0 4px 14px rgba(78,222,163,0.3)",
                }}
              >
                {isAtEnd ? (
                  "Finish Scenario"
                ) : (
                  <>
                    Next Candle
                    <ChevronRight style={{ width: 15, height: 15 }} />
                  </>
                )}
              </button>

              {/* Trade log */}
              {trades.length > 0 && (
                <div
                  style={{
                    background: CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Trade Log ({trades.length})
                  </span>
                  <div
                    style={{
                      maxHeight: 220,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    {trades.map((trade) => (
                      <div
                        key={trade.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.45rem 0.65rem",
                          borderRadius: 7,
                          background:
                            trade.type === "BUY"
                              ? "rgba(0,212,170,0.06)"
                              : "rgba(239,68,68,0.06)",
                          border: `1px solid ${trade.type === "BUY" ? "rgba(0,212,170,0.15)" : "rgba(239,68,68,0.15)"}`,
                          animation: "fadeIn 0.2s ease",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              color:
                                trade.type === "BUY" ? BUY_COLOR : SELL_COLOR,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginRight: "0.35rem",
                            }}
                          >
                            {trade.type}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: TEXT_DIM,
                              fontFamily: "monospace",
                            }}
                          >
                            {trade.coins.toFixed(6)} {baseSymbol}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: TEXT,
                              fontFamily: "monospace",
                              fontWeight: 700,
                            }}
                          >
                            @${fmtPrice(trade.price)}
                          </div>
                          <div
                            style={{ fontSize: "10px", color: MUTED }}
                          >
                            {fmtDate(trade.time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results overlay */}
      {finished && (
        <ResultsOverlay
          startingBalance={startingBalance}
          finalValue={totalValue}
          tradeCount={trades.length}
          onReset={handleReset}
        />
      )}
    </>
  );
}
