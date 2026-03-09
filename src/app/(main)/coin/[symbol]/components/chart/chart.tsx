"use client";

import { useRouter } from "next/navigation";
import { PriceLineChart } from "@/app/components/priceChart";
import { BinanceKline } from "@/app/types";
import { fmtCoinPrice, fmtLarge } from "@/lib/utils";
import CoinHero from "../CoinHero";
import CoinStatCards, { StatCard } from "../CoinStatCards";

const INTERVAL_OPTIONS = ["1m", "5m", "15m", "1h", "1d"] as const;

interface Props {
  symbol: string;
  interval: string;
  chartData: BinanceKline[];
}

interface CoinStats {
  currentPrice: number;
  priceChange: number;
  priceChangePct: number;
  high: number;
  low: number;
  volume: number;
}

function computeCoinStats(chartData: BinanceKline[]): CoinStats {
  if (chartData.length === 0) {
    return { currentPrice: 0, priceChange: 0, priceChangePct: 0, high: 0, low: 0, volume: 0 };
  }

  const openPrice = parseFloat(chartData[0][1]);
  const currentPrice = parseFloat(chartData[chartData.length - 1][4]);
  const priceChange = currentPrice - openPrice;
  const priceChangePct = (priceChange / openPrice) * 100;

  let high = 0;
  let low = Infinity;
  let volume = 0;

  for (const candle of chartData) {
    const h = parseFloat(candle[2]);
    const l = parseFloat(candle[3]);
    if (h > high) high = h;
    if (l < low) low = l;
    volume += parseFloat(candle[7]);
  }

  return { currentPrice, priceChange, priceChangePct, high, low: low === Infinity ? 0 : low, volume };
}

function buildStatCards(stats: CoinStats, interval: string): StatCard[] {
  const { currentPrice, priceChange, priceChangePct, high, low, volume } = stats;
  const isUp = priceChange >= 0;

  return [
    { label: "Current Price", value: fmtCoinPrice(currentPrice) },
    {
      label: "Price Change",
      value: `${isUp ? "+" : ""}${priceChange.toFixed(4)}`,
      sub: `${Math.abs(priceChangePct).toFixed(2)}%`,
      up: isUp,
    },
    { label: `High (${interval})`, value: fmtCoinPrice(high), up: true },
    { label: `Low (${interval})`, value: fmtCoinPrice(low), up: false },
    { label: "Volume", value: fmtLarge(volume) },
  ];
}

export default function CoinOverviewClient({ symbol, interval, chartData }: Props) {
  const router = useRouter();
  const coinTicker = symbol.replace("USDT", "");

  const stats = computeCoinStats(chartData);
  const isUp = stats.priceChange >= 0;

  const handleIntervalChange = (next: string) => {
    router.push(`?interval=${encodeURIComponent(next)}`);
  };

  const handleExchange = () => {
    router.push(`/Exchange/${symbol}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-9" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CoinHero
        coinTicker={coinTicker}
        symbol={symbol}
        currentPrice={fmtCoinPrice(stats.currentPrice)}
        isUp={isUp}
        priceChangePct={stats.priceChangePct}
        onExchange={handleExchange}
      />

      <CoinStatCards stats={buildStatCards(stats, interval)} />

      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        }}
      >
        <PriceLineChart
          coinName={symbol}
          loading={false}
          data={chartData}
          xIndex={0}
          yIndex={1}
          intervalOptions={[...INTERVAL_OPTIONS]}
          selectedInterval={interval}
          onIntervalChange={handleIntervalChange}
          className="border-none shadow-none rounded-none"
        />
      </div>
    </div>
  );
}
