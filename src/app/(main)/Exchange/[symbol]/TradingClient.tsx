'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import OrderBook from './OrderBook';
import RecentTrades from './RecentTrades';
import TradeForm from './TradeForm';

// Lazy-load the chart (needs DOM, can't SSR)
const PriceChart = dynamic(() => import('./PriceChart'), { ssr: false });

interface Ticker {
  price: string;
  change: string;
  changePct: string;
  high: string;
  low: string;
  volume: string;
}

function CoinImage({ ticker }: { ticker: string }) {
  const [stage, setStage] = useState(0);
  if (stage === 2) {
    return (
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
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
      className="rounded-full"
      onError={() => setStage((s) => s + 1)}
      unoptimized
    />
  );
}

export default function TradingClient({ symbol }: { symbol: string }) {
  const ticker = symbol.replace('USDT', '');
  const [tickerData, setTickerData] = useState<Ticker | null>(null);

  // Live 24h ticker via WebSocket
  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
    );
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setTickerData({
        price: d.c,
        change: d.p,
        changePct: d.P,
        high: d.h,
        low: d.l,
        volume: d.q, // quote volume in USDT
      });
    };
    return () => ws.close();
  }, [symbol]);

  const isUp = tickerData ? parseFloat(tickerData.changePct) >= 0 : true;
  const changeColor = isUp ? '#16c784' : '#ea3943';

  const fmtPrice = (v: string) =>
    parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });

  const fmtVol = (v: string) => {
    const n = parseFloat(v);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col gap-0 min-h-0">
      {/* ── Ticker Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 border-b border-border bg-card">
        {/* Pair identity */}
        <div className="flex items-center gap-2">
          <CoinImage ticker={ticker} />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base">{ticker}/USDT</span>
            <span className="text-muted-foreground text-[11px]">{symbol}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col leading-tight">
          <span className="text-2xl font-bold tabular-nums" style={{ color: changeColor }}>
            {tickerData ? fmtPrice(tickerData.price) : '—'}
          </span>
          <span className="text-xs tabular-nums" style={{ color: changeColor }}>
            {tickerData
              ? `${isUp ? '+' : ''}${parseFloat(tickerData.change).toFixed(2)} (${parseFloat(tickerData.changePct).toFixed(2)}%)`
              : '—'}
          </span>
        </div>

        {/* Stats */}
        {tickerData && (
          <div className="flex gap-6 text-xs ml-auto flex-wrap">
            <StatCell label="24h High" value={fmtPrice(tickerData.high)} />
            <StatCell label="24h Low" value={fmtPrice(tickerData.low)} />
            <StatCell label="24h Volume" value={fmtVol(tickerData.volume)} />
          </div>
        )}
      </div>

      {/* ── Main Layout ───────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 divide-x divide-border">
        {/* Left — Order Book */}
        <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-border">
          <OrderBook symbol={symbol} />
        </div>

        {/* Center — Chart + Trade Form */}
        <div className="flex flex-col flex-1 min-w-0 divide-y divide-border">
          {/* Chart */}
          <div className="flex-1 p-3 bg-card">
            <PriceChart symbol={symbol} />
          </div>

          {/* Trade Form */}
          <div className="bg-card">
            <TradeForm symbol={symbol} />
          </div>
        </div>

        {/* Right — Recent Trades */}
        <div className="w-56 flex-shrink-0 border-l border-border overflow-y-auto">
          <RecentTrades symbol={symbol} />
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  );
}
