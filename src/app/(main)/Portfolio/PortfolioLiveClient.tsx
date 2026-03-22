"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/app/components/table";
import { makeColumns } from "./columns";
import { portfolioCoin } from "@/app/types/coin";
import { CostBasisEntry } from "@/app/data/services";

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

function StatCard({
  label, value, sub, valueColor,
}: {
  label: string; value: string; sub?: string; valueColor?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 px-6 py-5 rounded-xl flex-1 min-w-[160px]"
      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-bold tracking-tight" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function PortfolioLiveClient({ initialCoins, initialBalance, costBasis }: Props) {
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
  const pnlColor = pnl >= 0 ? "#16c784" : "#ea3943";

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

  const columns = makeColumns();

  return (
    <>
      {/* Summary cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard label="Total Value" value={fmtUSD(totalValue)} sub="Holdings + Cash" />
        <StatCard
          label="Total P&L"
          value={fmtPnl(pnl)}
          sub={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}% vs $1,000 start`}
          valueColor={pnlColor}
        />
        <StatCard label="Holdings Value" value={fmtUSD(holdingsTotal)} />
        <StatCard label="Available Balance" value={fmtUSD(cashBalance)} sub="USDT" />
        <StatCard label="Assets" value={String(numAssets)} sub="active positions" />
      </div>

      {/* Holdings table */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Holdings
          </h2>
          {streamStatus === "live" && (
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ color: "#16c784", background: "rgba(22,199,132,0.1)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#16c784" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#16c784" }} />
              </span>
              Live
            </span>
          )}
          {streamStatus === "connecting" && (
            <span className="text-xs text-muted-foreground animate-pulse">Connecting…</span>
          )}
          {streamStatus === "error" && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ color: "#ea3943", background: "rgba(234,57,67,0.1)" }}>
              Disconnected
            </span>
          )}
        </div>

        <DataTable data={enrichedHoldings} columns={columns} params="symbol" />
      </div>
    </>
  );
}
