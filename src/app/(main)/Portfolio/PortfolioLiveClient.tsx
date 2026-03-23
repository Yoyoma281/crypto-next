"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/app/components/table";
import { makeColumns } from "./columns";
import { portfolioCoin } from "@/app/types/coin";
import { CostBasisEntry } from "@/app/data/services";
import { useI18n } from "@/lib/i18n";

interface Props {
  initialCoins: portfolioCoin[];
  initialBalance: number;
  costBasis: Record<string, CostBasisEntry>;
}

function fmtUSD(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPnl(n: number) {
  const abs = "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n >= 0 ? "+" : "-") + abs;
}

export default function PortfolioLiveClient({ initialCoins, initialBalance, costBasis }: Props) {
  const { t } = useI18n();
  const [coins, setCoins] = useState<portfolioCoin[]>(initialCoins);
  const [streamStatus, setStreamStatus] = useState<"connecting" | "live" | "error">("connecting");

  useEffect(() => {
    const es = new EventSource(`${process.env.NEXT_PUBLIC_BASE_URL}/portfolio/stream`, {
      withCredentials: true,
    });
    es.onopen = () => setStreamStatus("live");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as portfolioCoin[];
        setCoins(data);
        setStreamStatus("live");
      } catch { /* ignore malformed frames */ }
    };
    es.onerror = () => setStreamStatus("error");
    return () => es.close();
  }, []);

  const holdings = coins.filter((c) => !c.symbol.includes("/"));
  const cashCoin = coins.find((c) => c.symbol === "USD/USDT");
  const cashBalance = cashCoin ? parseFloat(cashCoin.amount || "0") : initialBalance;

  const holdingsTotal = holdings.reduce(
    (sum, c) => sum + parseFloat(c.CurrentWorth || "0"),
    0
  );
  const totalValue = holdingsTotal + cashBalance;
  const numAssets = holdings.filter((c) => parseFloat(c.amount || "0") > 0).length;

  const STARTING_BALANCE = 1000;
  const pnl = totalValue - STARTING_BALANCE;
  const pnlPct = (pnl / STARTING_BALANCE) * 100;
  const pnlColor = pnl >= 0 ? "#4edea3" : "#ffb3ad";

  // Calculate allocation percentages
  const allocationData = holdings
    .filter((c) => parseFloat(c.CurrentWorth || "0") > 0)
    .map((c) => ({
      symbol: c.symbol,
      worth: parseFloat(c.CurrentWorth || "0"),
      percentage: (parseFloat(c.CurrentWorth || "0") / holdingsTotal) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Enrich each holding with its avg buy price and unrealized P&L
  const enrichedHoldings = holdings.map((c) => {
    const basis = costBasis[c.symbol];
    const currentWorth = parseFloat(c.CurrentWorth || "0");
    const qty = parseFloat(c.amount || "0");
    if (!basis || basis.avgBuyPrice === 0 || qty === 0) return c;
    const costAtAvg = basis.avgBuyPrice * qty;
    const unrealizedPnl = currentWorth - costAtAvg;
    const unrealizedPnlPct = (unrealizedPnl / costAtAvg) * 100;
    return { ...c, avgBuyPrice: basis.avgBuyPrice, unrealizedPnl, unrealizedPnlPct };
  });

  const columns = makeColumns(t);

  return (
    <>
      {/* KINETIC Hero Section: Portfolio Stats */}
      <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
            {fmtUSD(totalValue)}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-semibold" style={{ color: pnlColor }}>
              <span>{pnlPct >= 0 ? "↑" : "↓"}</span>
              {fmtPnl(pnl)} ({pnlPct.toFixed(2)}%)
            </span>
            <span className="text-sm text-muted-foreground">vs $1,000 starting balance</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="px-6 py-3 rounded-md font-bold text-sm"
            style={{
              background: "#4edea3",
              color: "#003824",
            }}
          >
            + Deposit
          </button>
          <button
            className="px-6 py-3 rounded-md font-bold text-sm border"
            style={{
              borderColor: "hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            → Withdraw
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="rounded-xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Holdings Value</p>
          <p className="text-3xl font-bold mb-2">{fmtUSD(holdingsTotal)}</p>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{
                background: "#4edea3",
                width: totalValue > 0 ? `${(holdingsTotal / totalValue) * 100}%` : "0%",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalValue > 0 ? ((holdingsTotal / totalValue) * 100).toFixed(1) : "0"}% of portfolio
          </p>
        </div>

        <div className="rounded-xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Available Balance</p>
          <p className="text-3xl font-bold mb-2">{fmtUSD(cashBalance)}</p>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{
                background: "#b9c7e0",
                width: totalValue > 0 ? `${(cashBalance / totalValue) * 100}%` : "0%",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalValue > 0 ? ((cashBalance / totalValue) * 100).toFixed(1) : "0"}% of portfolio
          </p>
        </div>

        <div className="rounded-xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Active Assets</p>
          <p className="text-3xl font-bold mb-2">{numAssets}</p>
          <p className="text-xs text-muted-foreground">coins held</p>
        </div>

        <div className="rounded-xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Stream Status</p>
          <div className="flex items-center gap-2 mb-3">
            {streamStatus === "live" && (
              <>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4edea3" }} />
                <span className="text-sm font-semibold" style={{ color: "#4edea3" }}>LIVE</span>
              </>
            )}
            {streamStatus === "connecting" && (
              <>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#b9c7e0" }} />
                <span className="text-sm font-semibold text-muted-foreground">CONNECTING</span>
              </>
            )}
            {streamStatus === "error" && (
              <>
                <span className="w-2 h-2 rounded-full" style={{ background: "#ffb3ad" }} />
                <span className="text-sm font-semibold" style={{ color: "#ffb3ad" }}>ERROR</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">real-time updates</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Holdings Table - 2 columns */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Asset Holdings</h3>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              {holdings.filter((c) => parseFloat(c.amount || "0") > 0).length} assets
            </span>
          </div>
          <DataTable data={enrichedHoldings} columns={columns} params="symbol" />
        </div>

        {/* Right Sidebar - Allocation & Info */}
        <div className="space-y-6">
          {/* Allocation Card */}
          <div className="rounded-xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <h3 className="text-lg font-bold mb-6">Allocation</h3>
            <div className="space-y-3">
              {allocationData.slice(0, 5).map((asset) => (
                <div key={asset.symbol}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold">{asset.symbol}</span>
                    <span className="text-xs font-bold" style={{ color: "#4edea3" }}>
                      {asset.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        background: "#4edea3",
                        width: `${asset.percentage}%`,
                      }}
                    />
                  </div>
</div>
              ))}
              {allocationData.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{allocationData.length - 5} more asset(s)
                </p>
              )}
            </div>
          </div>

          {/* Performance Card */}
          <div className="rounded-xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <h3 className="text-lg font-bold mb-4">Performance Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Gain/Loss</p>
                <p className="text-2xl font-bold" style={{ color: pnlColor }}>
                  {fmtPnl(pnl)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Return %</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: pnlColor }}
                >
                  {pnlPct.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
