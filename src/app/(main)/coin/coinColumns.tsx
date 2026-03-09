'use client';

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatPrice } from "@/lib/utils";
import { CoinTableRow } from "@/app/types/coin";
import Sparkline from "@/app/components/sparkline";

// Deterministic color from ticker name
function tickerColor(ticker: string) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
}

// Fallback chain: local SVG → GitHub PNG → letter avatar
const GITHUB_ICON = (t: string) =>
  `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/${t.toLowerCase()}.png`;

function CoinIcon({ ticker }: { ticker: string }) {
  // 0 = local SVG, 1 = GitHub PNG, 2 = letter avatar
  const [stage, setStage] = useState(0);

  if (stage === 2) {
    return (
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: tickerColor(ticker) }}
      >
        {ticker[0]}
      </div>
    );
  }

  const src =
    stage === 0
      ? `/Coin-icons/${ticker.toLowerCase()}.svg`
      : GITHUB_ICON(ticker);

  return (
    <Image
      key={src}
      src={src}
      alt={ticker}
      width={32}
      height={32}
      className="rounded-full flex-shrink-0"
      onError={() => setStage((s) => s + 1)}
      unoptimized
    />
  );
}

function PctBadge({ value }: { value: string }) {
    const num = parseFloat(value);
    const isUp = num >= 0;
    return (
        <span
            style={{
                color: isUp ? "#16c784" : "#ea3943",
                background: isUp ? "rgba(22,199,132,0.1)" : "rgba(234,57,67,0.1)",
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

/** Pass the page offset so rank is globally correct (e.g. page 2 → #11, #12 …) */
export function makeColumns(offset: number): ColumnDef<CoinTableRow>[] {
  return [
    {
        id: "rank",
        header: "#",
        cell: (props) => (
            <span className="text-muted-foreground font-medium text-sm">
                {offset + props.row.index + 1}
            </span>
        ),
    },
    {
        accessorKey: "symbol",
        header: "Name",
        cell: (props) => {
            const sym = props.getValue() as string;
            const ticker = sym.replace("USDT", "");
            return (
                <div className="flex items-center gap-3">
                    <CoinIcon ticker={ticker} />
                    <div className="flex flex-col leading-tight">
                        <span className="font-semibold text-[14px]">{ticker}</span>
                        <span className="text-muted-foreground text-[12px]">{sym}</span>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "lastPrice",
        header: "Price",
        cell: (props) => (
            <span className="font-semibold text-[14px]">
                {formatPrice(props.getValue() as string)}
            </span>
        ),
    },
    {
        accessorKey: "priceChange",
        header: "24h Change",
        cell: (props) => {
            const val = parseFloat(props.getValue() as string);
            const isUp = val >= 0;
            return (
                <span style={{ color: isUp ? "#16c784" : "#ea3943", fontWeight: 500, fontSize: "13px" }}>
                    {isUp ? "+" : ""}{formatPrice((props.getValue() as string))}
                </span>
            );
        },
    },
    {
        accessorKey: "priceChangePercent",
        header: "24h %",
        cell: (props) => <PctBadge value={props.getValue() as string} />,
    },
    {
        accessorKey: "weightedAvgPrice",
        header: "Avg Price",
        cell: (props) => (
            <span className="text-muted-foreground text-[13px]">
                {formatPrice(props.getValue() as string)}
            </span>
        ),
    },
    {
        accessorKey: "prevClosePrice",
        header: "Prev Close",
        cell: (props) => (
            <span className="text-muted-foreground text-[13px]">
                {formatPrice(props.getValue() as string)}
            </span>
        ),
    },
    {
        id: "sparkline",
        header: "7d Chart",
        cell: (props) => {
            const data = props.row.original.sparkData;
            if (!data || data.length === 0) {
                return <div className="w-[100px] h-[30px] rounded bg-muted/40 animate-pulse" />;
            }
            return (
                <div className="w-[100px]">
                    <Sparkline data={data} />
                </div>
            );
        }
    },
    {
        id: "trade",
        header: "",
        cell: (props) => {
            const sym = props.row.original.symbol;
            return (
                <Link
                    href={`/Exchange/${sym}`}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold border border-border hover:bg-muted transition-colors whitespace-nowrap"
                >
                    Trade
                </Link>
            );
        }
    }
  ];
}
