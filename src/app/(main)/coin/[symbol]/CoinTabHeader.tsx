"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

function CoinImage({ ticker }: { ticker: string }) {
  const [stage, setStage] = useState(0);
  if (stage >= 2) {
    return (
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ background: `hsl(${(ticker.charCodeAt(0) * 47) % 360}, 55%, 45%)` }}
      >
        {ticker[0]}
      </div>
    );
  }
  const src =
    stage === 0
      ? `/Coin-icons/${ticker.toLowerCase()}.svg`
      : `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/${ticker.toLowerCase()}.png`;
  return (
    <Image
      key={src}
      src={src}
      alt={ticker}
      width={32}
      height={32}
      className="rounded-full shrink-0"
      onError={() => setStage((s) => s + 1)}
      unoptimized
    />
  );
}

interface Props {
  symbol: string; // e.g. "BTCUSDT"
  price?: string;
  isUp?: boolean;
  changePct?: string;
}

export default function CoinTabHeader({ symbol, price, isUp, changePct }: Props) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const ticker = symbol.replace("USDT", "");
  const changeColor = isUp ? "#16c784" : "#ea3943";

  const tabClass = (tab: string) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div
      className="flex items-center justify-between border-b border-border bg-card px-4"
      style={{ minHeight: 48 }}
    >
      {/* Left: coin identity + price */}
      <div className="flex items-center gap-3">
        <CoinImage ticker={ticker} />
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{ticker}</span>
          <span className="text-xs text-muted-foreground">/USDT</span>
        </div>
        {price && (
          <div className="flex items-center gap-2 ml-2">
            <span className="font-bold tabular-nums text-sm" style={{ color: changeColor }}>
              {price}
            </span>
            {changePct && (
              <span className="text-xs font-semibold" style={{ color: changeColor }}>
                {isUp ? "▲" : "▼"} {Math.abs(parseFloat(changePct)).toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: tabs */}
      <div className="flex items-center">
        <Link href={`?tab=overview`} className={tabClass("overview")}>
          Overview
        </Link>
        <Link href={`?tab=trade`} className={tabClass("trade")}>
          Trade
        </Link>
      </div>
    </div>
  );
}
