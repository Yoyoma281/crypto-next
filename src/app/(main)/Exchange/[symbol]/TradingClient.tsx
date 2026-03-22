'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
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

export default function TradingClient({ symbol, hiddenHeader }: { symbol: string; hiddenHeader?: boolean }) {
  const ticker = symbol.replace('USDT', '');
  const { t } = useI18n();
  const [tickerData, setTickerData] = useState<Ticker | null>(null);
  // Store last known values for delta merging
  const lastRef = useRef<Partial<Ticker>>({});

  // Live 24h ticker via Bybit WebSocket
  useEffect(() => {
    const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');

    ws.onopen = () => {
      ws.send(JSON.stringify({ op: 'subscribe', args: [`tickers.${symbol}`] }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (!msg.topic || !msg.topic.startsWith('tickers')) return;
      const d = msg.data;
      if (!d) return;

      // Merge delta fields into last known state
      if (d.lastPrice)     lastRef.current.price     = d.lastPrice;
      if (d.highPrice24h)  lastRef.current.high      = d.highPrice24h;
      if (d.lowPrice24h)   lastRef.current.low       = d.lowPrice24h;
      if (d.turnover24h)   lastRef.current.volume    = d.turnover24h;

      // price24hPcnt is a decimal fraction (e.g. "0.0234" = 2.34%)
      if (d.price24hPcnt !== undefined) {
        const pct = parseFloat(d.price24hPcnt) * 100;
        lastRef.current.changePct = pct.toFixed(2);
      }
      if (d.prevPrice24h !== undefined && d.lastPrice !== undefined) {
        lastRef.current.change = (parseFloat(d.lastPrice) - parseFloat(d.prevPrice24h)).toFixed(8);
      }

      const cur = lastRef.current;
      if (cur.price) {
        setTickerData({
          price:     cur.price     ?? '0',
          change:    cur.change    ?? '0',
          changePct: cur.changePct ?? '0',
          high:      cur.high      ?? '0',
          low:       cur.low       ?? '0',
          volume:    cur.volume    ?? '0',
        });
      }
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
      {!hiddenHeader && (
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
              <StatCell label={t.trading.high24h} value={fmtPrice(tickerData.high)} />
              <StatCell label={t.trading.low24h} value={fmtPrice(tickerData.low)} />
              <StatCell label={t.trading.volume24h} value={fmtVol(tickerData.volume)} />
            </div>
          )}
        </div>
      )}

      {/* ── Main Layout ───────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 divide-x divide-border">
        {/* Left — Order Book */}
        <div className="w-40 lg:w-48 xl:w-56 flex-shrink-0 overflow-y-auto border-r border-border">
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
        <div className="w-40 lg:w-48 xl:w-56 flex-shrink-0 border-l border-border overflow-y-auto">
          <RecentTrades symbol={symbol} />
        </div>

        {/* News panel — only on xl+ */}
        <div className="hidden xl:flex w-56 flex-shrink-0 border-l border-border overflow-y-auto flex-col">
          <NewsPanel base={ticker} />
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

function NewsPanel({ base }: { base: string }) {
  const [news, setNews] = useState<Array<{id:number;title:string;url:string;source:{title:string};published_at:string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news?currency=${base}`)
      .then((r) => r.json())
      .then((d) => { setNews((d.results ?? []).slice(0, 15)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [base]);

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <>
      <div className="px-3 py-2.5 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">News</span>
      </div>
      <div className="flex flex-col overflow-y-auto">
        {loading ? (
          Array.from({length: 6}).map((_, i) => (
            <div key={i} className="mx-2 my-1.5 h-14 rounded-lg animate-pulse bg-muted" />
          ))
        ) : news.length === 0 ? (
          <p className="text-xs text-muted-foreground p-3">No news found.</p>
        ) : (
          news.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className="flex flex-col gap-0.5 px-3 py-2.5 hover:bg-muted/40 transition-colors border-b border-border/50">
              <span className="text-[11px] font-medium leading-snug line-clamp-3 text-foreground">
                {item.title}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {item.source.title} · {timeAgo(item.published_at)}
              </span>
            </a>
          ))
        )}
      </div>
    </>
  );
}
