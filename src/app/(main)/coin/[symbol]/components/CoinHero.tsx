"use client";

import Image from "next/image";

interface CoinHeroProps {
  coinTicker: string;
  symbol: string;
  currentPrice: string;
  isUp: boolean;
  priceChangePct: number;
  onExchange: () => void;
}

export default function CoinHero({
  coinTicker,
  symbol,
  currentPrice,
  isUp,
  priceChangePct,
  onExchange,
}: CoinHeroProps) {
  const changeColor = isUp ? "#4edea3" : "#ffb3ad";
  const changeBg = isUp ? "rgba(22,199,132,0.1)" : "rgba(234,57,67,0.1)";

  return (
    <div className="flex flex-wrap items-start gap-4 mb-8">
      {/* Coin icon */}
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mt-1">
        <Image
          src={`/Coin-icons/${coinTicker.toLowerCase()}.svg`}
          alt={coinTicker}
          width={48}
          height={48}
        />
      </div>

      {/* Name + price block */}
      <div className="flex flex-col gap-1">
        {/* Top row: name + symbol badge + rank badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold">{coinTicker}</h1>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {symbol}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Rank #1
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-end gap-3 flex-wrap">
          <span className="text-4xl font-bold tracking-tight">
            {currentPrice}
          </span>
          <span
            className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg mb-1"
            style={{ color: changeColor, background: changeBg }}
          >
            {isUp ? "▲" : "▼"} {Math.abs(priceChangePct).toFixed(2)}%
          </span>
        </div>

        {/* Sub-label */}
        <p className="text-xs text-muted-foreground">
          1 {coinTicker} = {currentPrice} USD
        </p>
      </div>

      {/* Action buttons – pushed to the right */}
      <div className="ml-auto flex gap-2 flex-shrink-0 items-start pt-1 flex-wrap">
        <button
          onClick={onExchange}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: "#8dc647" }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#6ba832")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#8dc647")}
        >
          Trade
        </button>
        <button
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
          style={{
            background: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--foreground))",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "hsl(var(--muted))")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "hsl(var(--card))")
          }
        >
          ★ Watchlist
        </button>
      </div>
    </div>
  );
}
