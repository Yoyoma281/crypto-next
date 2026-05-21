"use client";

import Image from "next/image";
import { useState } from "react";

function tickerColor(ticker: string) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++)
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
}

const ICON_SOURCES = (t: string) => [
  `/Coin-icons/${t.toLowerCase()}.svg`,
  `https://assets.coincap.io/assets/icons/${t.toLowerCase()}@2x.png`,
  `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@latest/svg/color/${t.toLowerCase()}.svg`,
  `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/${t.toLowerCase()}.png`,
];

export default function CoinIcon({
  ticker,
  size = 32,
  className = "",
}: {
  ticker: string;
  size?: number;
  className?: string;
}) {
  const [stage, setStage] = useState(0);
  const sources = ICON_SOURCES(ticker);

  if (stage >= sources.length) {
    return (
      <div
        className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.375,
          background: tickerColor(ticker),
        }}
      >
        {ticker[0]}
      </div>
    );
  }

  return (
    <Image
      key={sources[stage]}
      src={sources[stage]}
      alt={ticker}
      width={size}
      height={size}
      className={`rounded-full flex-shrink-0 ${className}`}
      onError={() => setStage((s) => s + 1)}
      unoptimized
    />
  );
}
