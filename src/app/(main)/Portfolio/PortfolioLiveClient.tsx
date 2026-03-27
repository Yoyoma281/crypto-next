"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { portfolioCoin } from "@/app/types/coin";
import { CostBasisEntry } from "@/app/data/services";
import { useI18n } from "@/lib/i18n";

interface Props {
  initialCoins: portfolioCoin[];
  initialBalance: number;
  costBasis: Record<string, CostBasisEntry>;
}

interface TradeRecord {
  _id: string;
  symbol: string;
  type: "BUY" | "SELL";
  usdAmount: string;
  coinAmount: string;
  price: string;
  createdAt: string;
}

function fmtUSD(n: number) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtPnl(n: number) {
  const abs =
    "$" +
    Math.abs(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return (n >= 0 ? "+" : "-") + abs;
}

const DONUT_COLORS = [
  "#4edea3",
  "#b9c7e0",
  "#8ccdff",
  "#ffd700",
  "#f97316",
  "#a855f7",
];

/** Deterministic hue from a string for letter-avatar fallback */
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 40%)`;
}

interface CoinIconProps {
  ticker: string;
  size?: number;
}

function CoinIcon({ ticker, size = 28 }: CoinIconProps) {
  const [failed, setFailed] = useState(false);
  const lower = ticker.toLowerCase();

  if (failed) {
    return (
      <span
        className="flex items-center justify-center rounded-full text-white font-bold text-xs flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: hashColor(ticker),
          fontSize: size * 0.4,
        }}
      >
        {ticker.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={`/Coin-icons/${lower}.svg`}
      alt={ticker}
      width={size}
      height={size}
      className="rounded-full flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

/** SVG donut chart using stroke-dasharray technique */
interface DonutSlice {
  symbol: string;
  percentage: number;
  color: string;
}

function DonutChart({ slices, hovered }: { slices: DonutSlice[]; hovered: DonutSlice | null }) {
  const r = 15.9155;
  const circumference = 2 * Math.PI * r; // ~100.0

  let offset = 0;
  const paths = slices.map((slice) => {
    const dash = (slice.percentage / 100) * circumference;
    const gap = circumference - dash;
    const currentOffset = offset;
    offset += dash;
    const isHovered = hovered?.symbol === slice.symbol;
    return (
      <circle
        key={slice.symbol}
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={slice.color}
        strokeWidth={isHovered ? 5.5 : 4}
        strokeDasharray={`${dash.toFixed(4)} ${gap.toFixed(4)}`}
        strokeDashoffset={circumference - currentOffset}
        strokeLinecap="round"
        opacity={hovered && !isHovered ? 0.35 : 1}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-width 0.15s, opacity 0.15s",
        }}
      />
    );
  });

  return (
    <div className="relative w-44 h-44 flex-shrink-0">
      <svg viewBox="0 0 36 36" width={176} height={176} overflow="visible">
        {/* Background track */}
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="4"
          opacity="0.2"
        />
        {paths}
        {/* Center tooltip */}
        {hovered ? (
          <g style={{ pointerEvents: "none" }}>
            <text x="18" y="16" textAnchor="middle" fill="#dce2f7" fontSize="3.2" fontWeight="bold" fontFamily="monospace">
              {hovered.symbol}
            </text>
            <text x="18" y="21.5" textAnchor="middle" fill={hovered.color} fontSize="4.5" fontWeight="bold" fontFamily="monospace">
              {hovered.percentage.toFixed(1)}%
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}

export default function PortfolioLiveClient({
  initialCoins,
  initialBalance,
  costBasis,
}: Props) {
  useI18n();
  const [coins, setCoins] = useState<portfolioCoin[]>(initialCoins);
  const [streamStatus, setStreamStatus] = useState<
    "connecting" | "live" | "error"
  >("connecting");
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredSlice, setHoveredSlice] = useState<DonutSlice | null>(null);
  const [allocationChartData, setAllocationChartData] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allocation: any[];
    totalWorth: number;
  } | null>(null);

  // SSE stream for live portfolio updates
  useEffect(() => {
    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_BASE_URL}/portfolio/stream`,
      {
        withCredentials: true,
      },
    );
    es.onopen = () => setStreamStatus("live");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as portfolioCoin[];
        setCoins(data);
        setStreamStatus("live");
      } catch {
        /* ignore malformed frames */
      }
    };
    es.onerror = () => setStreamStatus("error");
    return () => es.close();
  }, []);

  // Fetch recent trade history
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/trades`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : { trades: [] }))
      .then((data) => {
        const list: TradeRecord[] = Array.isArray(data)
          ? data
          : (data.trades ?? []);
        setTrades(list.slice(0, 10));
      })
      .catch(() => setTrades([]));
  }, []);

  // Fetch open copy positions
  const [copyPositions, setCopyPositions] = useState<Array<{
    _id: string; symbol: string; coinAmount: string; entryUsdAmount: string;
    currentWorth: string | null; pnl: string | null; leaderUsername: string; openedAt: string;
  }>>([]);
  useEffect(() => {
    fetch("/api/copy-trading/positions")
      .then((r) => r.ok ? r.json() : { positions: [] })
      .then((d) => setCopyPositions(d.positions ?? []))
      .catch(() => {});
  }, []);

  // Fetch allocation data for the chart
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/portfolio/allocation`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setAllocationChartData(data);
        }
      })
      .catch(() => setAllocationChartData(null));
  }, [coins]);

  const holdings = coins.filter((c) => !c.symbol.includes("/"));
  const cashCoin = coins.find((c) => c.symbol === "USD/USDT");
  const cashBalance = cashCoin
    ? parseFloat(cashCoin.amount || "0")
    : initialBalance;

  const holdingsTotal = holdings.reduce(
    (sum, c) => sum + parseFloat(c.CurrentWorth || "0"),
    0,
  );
  const totalValue = holdingsTotal + cashBalance;
  const numAssets = holdings.filter(
    (c) => parseFloat(c.amount || "0") > 0,
  ).length;

  const STARTING_BALANCE = 1000;
  const pnl = totalValue - STARTING_BALANCE;
  const pnlPct = (pnl / STARTING_BALANCE) * 100;
  const pnlColor = pnl >= 0 ? "#4edea3" : "#ffb3ad";

  // Enrich each holding with its avg buy price and unrealized P&L
  const enrichedHoldings = holdings.map((c) => {
    const basis = costBasis[c.symbol];
    const currentWorth = parseFloat(c.CurrentWorth || "0");
    const qty = parseFloat(c.amount || "0");
    if (!basis || basis.avgBuyPrice === 0 || qty === 0) return c;
    const costAtAvg = basis.avgBuyPrice * qty;
    const unrealizedPnl = currentWorth - costAtAvg;
    const unrealizedPnlPct = (unrealizedPnl / costAtAvg) * 100;
    return {
      ...c,
      avgBuyPrice: basis.avgBuyPrice,
      unrealizedPnl,
      unrealizedPnlPct,
    };
  });

  // Build donut slices from API data
  const donutSlices: DonutSlice[] = (allocationChartData?.allocation || [])
    .slice(0, DONUT_COLORS.length)
    .map((a, i) => ({
      symbol: a.symbol.replace(/USDT$/, ""),
      percentage: a.percentage,
      color: DONUT_COLORS[i],
    }));

  // Whole-portfolio allocation including cash
  const cashPct = totalValue > 0 ? (cashBalance / totalValue) * 100 : 0;

  // Dollar split for header display
  const totalStr = fmtUSD(totalValue);
  const dotIdx = totalStr.lastIndexOf(".");
  const totalWhole = totalStr.slice(0, dotIdx);
  const totalDecimals = totalStr.slice(dotIdx); // ".XX"

  return (
    <>
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Total Portfolio Value
          </p>
          <div className="flex items-end gap-1 leading-none">
            <span className="text-5xl md:text-6xl font-extrabold tracking-tight">
              {totalWhole}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-muted-foreground mb-1">
              {totalDecimals}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <span
              className="flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: pnlColor }}
            >
              <span className="text-base">{pnlPct >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(pnlPct).toFixed(2)}%</span>
              <span className="font-normal opacity-75 text-xs">
                ({fmtPnl(pnl)})
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              since starting balance
            </span>
          </div>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            className="px-6 py-3 rounded-md text-sm font-bold transition-opacity hover:opacity-90 active:scale-95 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #4edea3, #009365)",
              color: "#003824",
            }}
          >
            <span>+</span> DEPOSIT
          </button>
          <button className="px-6 py-3 rounded-md text-sm font-bold border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <span>–</span> WITHDRAW
          </button>
        </div>
      </div>

      {/* ── 12-COL GRID ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* LEFT — Asset Holdings (8 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
            <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <h3 className="font-bold text-base">Asset Holdings</h3>
              <div className="flex items-center gap-2 text-muted-foreground bg-[hsl(var(--muted))] px-3 py-1.5 rounded-full border border-[hsl(var(--border))]">
                <span className="text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                  className="bg-transparent border-none text-xs focus:ring-0 w-32 placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Asset
                    </th>
                    <th className="text-right px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Balance
                    </th>
                    <th className="text-right px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Value (USD)
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Allocation
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {/* Cash / USDT row */}
                  {!searchQuery ||
                  "available usdt".includes(searchQuery) ||
                  "usdt".includes(searchQuery) ? (
                    <tr className="group hover:bg-[hsl(var(--muted)/0.2)] transition-colors">
                      {/* Asset */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex items-center justify-center rounded-full text-white font-bold text-xs flex-shrink-0"
                            style={{
                              width: 40,
                              height: 40,
                              background: "#009365",
                              fontSize: 18,
                            }}
                          >
                            $
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-tight">
                              USD Coin
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              USDT
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Balance */}
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-medium tabular-nums">
                          {cashBalance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      {/* Value */}
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-semibold tabular-nums">
                          {fmtUSD(cashBalance)}
                        </span>
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          Stable
                        </p>
                      </td>
                      {/* Allocation bar */}
                      <td className="px-6 py-5">
                        <div
                          className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ background: "hsl(var(--muted))" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: totalValue > 0 ? `${cashPct}%` : "0%",
                              background: "#b9c7e0",
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 text-right">
                          {cashPct.toFixed(1)}%
                        </p>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <span className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          —
                        </span>
                      </td>
                    </tr>
                  ) : null}

                  {/* Coin rows */}
                  {enrichedHoldings
                    .filter((c) => parseFloat(c.amount || "0") > 0)
                    .filter(
                      (c) =>
                        !searchQuery ||
                        c.symbol.toLowerCase().includes(searchQuery),
                    )
                    .map((coin, idx) => {
                      const worth = parseFloat(coin.CurrentWorth || "0");
                      const qty = parseFloat(coin.amount || "0");
                      const alloc =
                        totalValue > 0 ? (worth / totalValue) * 100 : 0;
                      const uPnl = (coin as { unrealizedPnl?: number })
                        .unrealizedPnl;
                      const uPnlPct = (coin as { unrealizedPnlPct?: number })
                        .unrealizedPnlPct;
                      const barColor = DONUT_COLORS[idx % DONUT_COLORS.length];

                      return (
                        <tr
                          key={coin.symbol}
                          className="group hover:bg-[hsl(var(--muted)/0.2)] transition-colors"
                        >
                          {/* Asset */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <CoinIcon ticker={coin.symbol} size={40} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold leading-tight">
                                  {coin.symbol}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {coin.symbol}USDT
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Balance */}
                          <td className="px-6 py-5 text-right">
                            <span className="text-sm font-medium tabular-nums">
                              {qty.toLocaleString("en-US", {
                                minimumFractionDigits: 4,
                                maximumFractionDigits: 8,
                              })}
                            </span>
                          </td>

                          {/* Value / USD */}
                          <td className="px-6 py-5 text-right">
                            <p className="text-sm font-semibold tabular-nums">
                              {fmtUSD(worth)}
                            </p>
                            {uPnl !== undefined && uPnlPct !== undefined && (
                              <p
                                className="text-[10px] font-medium tabular-nums"
                                style={{
                                  color: uPnl >= 0 ? "#4edea3" : "#ffb3ad",
                                }}
                              >
                                {uPnl >= 0 ? "+" : ""}
                                {uPnlPct.toFixed(2)}%
                              </p>
                            )}
                          </td>

                          {/* Allocation bar */}
                          <td className="px-6 py-5">
                            <div
                              className="w-full h-1.5 rounded-full overflow-hidden"
                              style={{ background: "hsl(var(--muted))" }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${alloc}%`,
                                  background: barColor,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">
                              {alloc.toFixed(1)}%
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/coin/${coin.symbol}USDT`}
                                className="p-1.5 hover:text-primary transition-colors"
                                title="Trade"
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 18 18"
                                  fill="none"
                                >
                                  <path
                                    d="M3 6L9 12M9 12L15 6M9 12V1"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {enrichedHoldings.filter(
                    (c) => parseFloat(c.amount || "0") > 0,
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-muted-foreground"
                      >
                        No coin holdings yet. Start trading to build your
                        portfolio.
                      </td>
                    </tr>
                  )}
                  {enrichedHoldings.filter(
                    (c) =>
                      parseFloat(c.amount || "0") > 0 &&
                      (!searchQuery ||
                        c.symbol.toLowerCase().includes(searchQuery)),
                  ).length === 0 &&
                    enrichedHoldings.filter(
                      (c) => parseFloat(c.amount || "0") > 0,
                    ).length > 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-sm text-muted-foreground"
                        >
                          No assets match your search.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT — Performance Summary + Allocation Donut (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Performance Summary card */}
          <div
            className="rounded-xl border bg-[hsl(var(--card))] p-6 flex flex-col gap-4"
            style={{
              borderColor: `${pnlColor}50`,
              boxShadow: `0 0 32px ${pnlColor}18`,
              transition: "box-shadow 0.6s ease, border-color 0.6s ease",
            }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Performance Summary</h3>
              <div className="flex items-center gap-1.5">
                {streamStatus === "live" && (
                  <>
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#4edea3" }}
                    />
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: "#4edea3" }}
                    >
                      LIVE
                    </span>
                  </>
                )}
                {streamStatus === "connecting" && (
                  <>
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#b9c7e0" }}
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      CONNECTING
                    </span>
                  </>
                )}
                {streamStatus === "error" && (
                  <>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#ffb3ad" }}
                    />
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: "#ffb3ad" }}
                    >
                      ERROR
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Total Gain/Loss */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
                Total Gain / Loss
              </p>
              <p
                className="text-3xl font-extrabold tabular-nums"
                style={{ color: pnlColor }}
              >
                {fmtPnl(pnl)}
              </p>
            </div>

            {/* Return % */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
                Return
              </p>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: pnlColor }}
              >
                {pnlPct >= 0 ? "+" : ""}
                {pnlPct.toFixed(2)}%
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">
                  Starting Balance
                </p>
                <p className="text-sm font-semibold">$1,000.00</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">
                  Active Assets
                </p>
                <p className="text-sm font-semibold">{numAssets}</p>
              </div>
            </div>
          </div>

          {/* Allocation Donut card */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex flex-col gap-5 flex-1 relative">
            {/* Gradient accent background */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            <h3 className="font-bold text-base relative z-10">Allocation</h3>

            {donutSlices.length > 0 ? (
              <>
                <div className="flex flex-row items-center gap-6 relative z-10">
                  <DonutChart slices={donutSlices} hovered={hoveredSlice} />

                  {/* Legend */}
                  <div className="space-y-3 flex-1">
                    {donutSlices.map((slice) => (
                      <Link
                        key={slice.symbol}
                        href={`/coin/${slice.symbol}USDT`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        onMouseEnter={() => setHoveredSlice(slice)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      >
                        <span
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ background: slice.color }}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">
                            {slice.percentage.toFixed(0)}% {slice.symbol}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {slice.symbol}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {(allocationChartData?.allocation.length ?? 0) >
                      DONUT_COLORS.length && (
                      <p className="text-[10px] text-muted-foreground pt-2">
                        +
                        {(allocationChartData?.allocation.length ?? 0) -
                          DONUT_COLORS.length}{" "}
                        more
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No holdings to display
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── ACTIVITY LEDGER ──────────────────────────────────────── */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-2xl">Activity Ledger</h2>
          <button className="px-4 py-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[11px] font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
            Export CSV
          </button>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[hsl(var(--muted)/0.3)]">
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Status / Type
                  </th>
                  <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Asset
                  </th>
                  <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Transaction ID
                  </th>
                  <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Date / Time
                  </th>
                  <th className="text-right px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {trades.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-10 text-center text-sm text-muted-foreground"
                    >
                      No recent activity found.
                    </td>
                  </tr>
                )}
                {trades.map((trade) => {
                  const isBuy = trade.type === "BUY";
                  const typeColor = isBuy ? "#4edea3" : "#ffb3ad";
                  const date = new Date(trade.createdAt);
                  const dateStr = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const timeStr = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const usd = parseFloat(trade.usdAmount || "0");
                  const coinAmt = parseFloat(trade.coinAmount || "0");
                  // Derive base ticker from symbol (e.g. "BTCUSDT" -> "BTC")
                  const ticker = trade.symbol.replace(/USDT$/, "");

                  return (
                    <tr
                      key={trade._id}
                      className="hover:bg-[hsl(var(--muted)/0.2)] transition-colors"
                    >
                      {/* Status / Type */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${typeColor}15`,
                            }}
                          >
                            {isBuy ? (
                              // Download arrow for BUY
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M8 2v8M5 7l3 3 3-3M3 13h10"
                                  stroke={typeColor}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              // Upload arrow for SELL
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M8 14V6M5 9l3-3 3 3M3 3h10"
                                  stroke={typeColor}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="block text-sm font-semibold">
                              {trade.type}
                            </span>
                            <span
                              className="text-[10px] uppercase font-bold tracking-tighter"
                              style={{ color: typeColor }}
                            >
                              Completed
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Asset */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {ticker}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">
                            {ticker === "BTC"
                              ? "BITCOIN NETWORK"
                              : ticker === "ETH"
                                ? "ETHEREUM MAINNET"
                                : "BLOCKCHAIN"}
                          </span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs text-muted-foreground">
                          {trade._id.slice(0, 4)}...{trade._id.slice(-4)}
                        </span>
                      </td>

                      {/* Date / Time */}
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium">{dateStr}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {timeStr} UTC
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-8 py-6 text-right">
                        <div
                          className="text-sm font-bold tabular-nums"
                          style={{ color: typeColor }}
                        >
                          {isBuy ? "+" : "-"}
                          {coinAmt.toLocaleString("en-US", {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 8,
                          })}{" "}
                          {ticker}
                        </div>
                        <div className="text-[10px] text-muted-foreground tabular-nums">
                          {fmtUSD(usd)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Copy Positions */}
      {copyPositions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Copy Positions
            </h2>
            <a href="/copy-trading" className="text-xs underline" style={{ color: "#4edea3" }}>
              Manage
            </a>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                  style={{ borderBottom: "1px solid hsl(var(--border))" }}
                >
                  <th className="text-left px-5 py-3">Asset</th>
                  <th className="text-right px-5 py-3">Entry</th>
                  <th className="text-right px-5 py-3">Current</th>
                  <th className="text-right px-5 py-3">PnL</th>
                  <th className="text-left px-5 py-3">Copied from</th>
                </tr>
              </thead>
              <tbody>
                {copyPositions.map((pos, i) => {
                  const pnl = pos.pnl !== null ? Number(pos.pnl) : null;
                  const isUp = pnl !== null && pnl >= 0;
                  const ticker = pos.symbol.replace("USDT", "");
                  return (
                    <tr
                      key={pos._id}
                      className="transition-colors hover:bg-muted/40"
                      style={i < copyPositions.length - 1 ? { borderBottom: "1px solid hsl(var(--border))" } : {}}
                    >
                      <td className="px-5 py-3.5 font-semibold">{ticker} <span className="text-xs text-muted-foreground font-normal">/ USDT</span></td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs">{fmtUSD(Number(pos.entryUsdAmount))}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs">{pos.currentWorth ? fmtUSD(Number(pos.currentWorth)) : "—"}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs">
                        {pnl !== null ? (
                          <span style={{ color: isUp ? "#4edea3" : "#ffb3ad" }}>
                            {isUp ? "+" : ""}{fmtPnl(pnl)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{pos.leaderUsername}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
