"use client";

import { portfolioCoin } from "@/app/types/coin";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { T } from "@/lib/i18n/translations";

type EnrichedCoin = portfolioCoin & {
  avgBuyPrice?: number;
  unrealizedPnl?: number;
  unrealizedPnlPct?: number;
};

function fmtAmount(val: string) {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("en-US", { maximumFractionDigits: 8 });
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

function fmtWorth(val: string) {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return fmtUSD(n);
}

export function makeColumns(t: T): ColumnDef<EnrichedCoin>[] {
  return [
    {
      id: "rank",
      header: t.portfolio.colRank,
      cell: (props) => (
        <span className="text-muted-foreground text-sm font-medium">
          {props.row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "symbol",
      header: t.portfolio.colAsset,
      cell: (props) => {
        const sym = props.getValue() as string;
        const ticker = sym.replace(/USDT$/i, "").replace("/", "");
        return (
          <div className="flex items-center gap-3">
            <Image
              src={`../Coin-icons/${ticker.toLowerCase()}.svg`}
              alt={ticker}
              width={32}
              height={32}
              className="rounded-full"
              onError={() => {}}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-[14px]">{ticker || sym}</span>
              <span className="text-muted-foreground text-[12px]">{sym}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: t.portfolio.colHoldings,
      cell: (props) => (
        <span className="font-medium text-[14px]">
          {fmtAmount(props.getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "CurrentWorth",
      header: t.portfolio.colCurrentValue,
      cell: (props) => (
        <span className="font-semibold text-[14px]">
          {fmtWorth(props.getValue() as string)}
        </span>
      ),
    },
    {
      id: "avgBuyPrice",
      header: t.portfolio.colAvgBuy,
      cell: (props) => {
        const avg = props.row.original.avgBuyPrice;
        if (avg == null || avg === 0)
          return <span className="text-muted-foreground text-sm">—</span>;
        return <span className="font-medium text-[14px]">{fmtUSD(avg)}</span>;
      },
    },
    {
      id: "unrealizedPnl",
      header: t.portfolio.colPnl,
      cell: (props) => {
        const pnl = props.row.original.unrealizedPnl;
        const pct = props.row.original.unrealizedPnlPct;
        if (pnl == null)
          return <span className="text-muted-foreground text-sm">—</span>;
        const color = pnl >= 0 ? "#4edea3" : "#ffb3ad";
        const sign = pnl >= 0 ? "+" : "";
        return (
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[14px]" style={{ color }}>
              {sign}
              {fmtUSD(Math.abs(pnl)).replace("$", pnl >= 0 ? "+$" : "-$")}
            </span>
            {pct != null && (
              <span className="text-[11px]" style={{ color }}>
                {sign}
                {pct.toFixed(2)}%
              </span>
            )}
          </div>
        );
      },
    },
  ];
}
