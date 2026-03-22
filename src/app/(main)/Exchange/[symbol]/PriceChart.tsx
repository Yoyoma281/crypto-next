'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart, ColorType, CrosshairMode,
  IChartApi, ISeriesApi, CandlestickData, Time, SeriesMarker,
} from 'lightweight-charts';
import { useTheme } from 'next-themes';
import { TrendingUp, TrendingDown, X, Newspaper } from 'lucide-react';

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;
type Interval = (typeof INTERVALS)[number];

const INTERVAL_SECONDS: Record<Interval, number> = {
  '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400,
};
const INTERVAL_LIMITS: Record<Interval, number> = {
  '1m': 500, '5m': 1000, '15m': 1000, '1h': 1000, '4h': 1000, '1d': 1000,
};

const SPIKE_THRESHOLD = 0.025;

interface Candle extends CandlestickData { time: Time; }

interface SpikeEvent {
  time: number;
  open: number; close: number; high: number; low: number;
  pct: number; direction: 'up' | 'down';
}

interface NewsItem {
  id: number; title: string; url: string;
  published_at: string;
  source: { title: string; domain: string };
  currencies: { code: string }[] | null;
}

interface ClickedInfo {
  time: number;
  spike: SpikeEvent | null;
  news: NewsItem[];
}

function fmtTime(unix: number) {
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function fmtPrice(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function PriceChart({ symbol }: { symbol: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';
  const base = symbol.replace('USDT', '');

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsRef        = useRef<WebSocket | null>(null);
  const spikesRef    = useRef<SpikeEvent[]>([]);
  const newsMapRef   = useRef<Map<number, NewsItem[]>>(new Map());

  const [interval, setInterval] = useState<Interval>('1h');
  const [clicked, setClicked]   = useState<ClickedInfo | null>(null);

  const textColor  = isDark ? '#9ca3af' : '#6b7280';
  const gridColor  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const scaleColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  const buildChart = useCallback(() => {
    if (!containerRef.current) return;
    wsRef.current?.close();
    chartRef.current?.remove();
    newsMapRef.current.clear();
    spikesRef.current = [];
    setClicked(null);

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 440,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: scaleColor, timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: scaleColor },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#16c784', downColor: '#ea3943',
      borderUpColor: '#16c784', borderDownColor: '#ea3943',
      wickUpColor: '#16c784', wickDownColor: '#ea3943',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ivSec = INTERVAL_SECONDS[interval];
    const limit = INTERVAL_LIMITS[interval];

    // Fetch candles + news in parallel
    let cancelled = false;
    Promise.all([
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)
        .then(r => r.json()),
      fetch(`/api/news?currency=${base}`)
        .then(r => r.json())
        .then(d => (d.results ?? []) as NewsItem[])
        .catch(() => [] as NewsItem[]),
    ]).then(([klines, newsItems]: [unknown[][], NewsItem[]]) => {
      if (cancelled) return;
      const candles: Candle[] = klines.map(k => ({
        time: ((k[0] as number) / 1000) as Time,
        open:  parseFloat(k[1] as string),
        high:  parseFloat(k[2] as string),
        low:   parseFloat(k[3] as string),
        close: parseFloat(k[4] as string),
      }));

      series.setData(candles);
      chart.timeScale().fitContent();

      // Detect spikes
      const spikes: SpikeEvent[] = candles
        .filter(c => Math.abs((c.close - c.open) / c.open) >= SPIKE_THRESHOLD)
        .map(c => ({
          time: c.time as number,
          open: c.open, close: c.close, high: c.high, low: c.low,
          pct: (c.close - c.open) / c.open,
          direction: c.close >= c.open ? 'up' : 'down' as 'up' | 'down',
        }));
      spikesRef.current = spikes;

      // Match news to nearest candle
      const newsMap = new Map<number, NewsItem[]>();
      const candleTimes = candles.map(c => c.time as number);
      newsItems.forEach(item => {
        const pubSec = new Date(item.published_at).getTime() / 1000;
        // Find closest candle within ±2 intervals
        let bestTime = -1, bestDiff = Infinity;
        for (const ct of candleTimes) {
          const diff = Math.abs(ct - pubSec);
          if (diff < bestDiff && diff <= ivSec * 2) {
            bestDiff = diff; bestTime = ct;
          }
        }
        if (bestTime !== -1) {
          if (!newsMap.has(bestTime)) newsMap.set(bestTime, []);
          newsMap.get(bestTime)!.push(item);
        }
      });
      newsMapRef.current = newsMap;

      // Build markers: spikes first, then news
      const markers: SeriesMarker<Time>[] = [];
      spikes.forEach(s => markers.push({
        time: s.time as Time,
        position: s.direction === 'up' ? 'belowBar' : 'aboveBar',
        color: s.direction === 'up' ? '#16c784' : '#ea3943',
        shape: s.direction === 'up' ? 'arrowUp' : 'arrowDown',
        text: `${s.pct >= 0 ? '+' : ''}${(s.pct * 100).toFixed(1)}%`,
        size: 1,
      }));
      newsMap.forEach((_, t) => {
        // Only add news marker if no spike already at this time
        if (!spikes.find(s => s.time === t)) {
          markers.push({
            time: t as Time,
            position: 'aboveBar',
            color: '#f59e0b',
            shape: 'circle',
            text: '●',
            size: 0,
          });
        }
      });

      // Sort markers by time (required by lightweight-charts)
      markers.sort((a, b) => (a.time as number) - (b.time as number));
      series.setMarkers(markers);
    }).catch(() => {});

    // Click handler
    chart.subscribeClick(param => {
      if (!param.time) { setClicked(null); return; }
      const t = param.time as number;
      const spike = spikesRef.current.find(s => s.time === t) ?? null;
      const news  = newsMapRef.current.get(t) ?? [];
      if (spike || news.length > 0) {
        setClicked({ time: t, spike, news });
      } else {
        setClicked(null);
      }
    });

    // Live WebSocket
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
    wsRef.current = ws;
    ws.onmessage = e => {
      const k = JSON.parse(e.data).k;
      series.update({
        time: (k.t / 1000) as Time,
        open: parseFloat(k.o), high: parseFloat(k.h),
        low: parseFloat(k.l), close: parseFloat(k.c),
      });
    };

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => { cancelled = true; ws.close(); ro.disconnect(); chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, [symbol, interval, isDark]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = buildChart();
    return cleanup;
  }, [buildChart]);

  return (
    <div className="flex flex-col">
      {/* Interval buttons */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2">
        {INTERVALS.map(iv => (
          <button key={iv} onClick={() => setInterval(iv)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              interval === iv
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >{iv}</button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span style={{color:'#16c784'}}>▲</span> Spike up</span>
          <span className="flex items-center gap-1"><span style={{color:'#ea3943'}}>▼</span> Spike down</span>
          <span className="flex items-center gap-1"><span style={{color:'#f59e0b'}}>●</span> News</span>
          <span className="opacity-60">Click markers for details</span>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="w-full" />

      {/* Detail panel */}
      {clicked && (
        <div className="mx-3 mb-3 mt-2 rounded-xl p-4 flex flex-col gap-3"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{fmtTime(clicked.time)}</span>
            <button onClick={() => setClicked(null)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {clicked.spike && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {clicked.spike.direction === 'up'
                  ? <TrendingUp className="h-4 w-4" style={{color:'#16c784'}} />
                  : <TrendingDown className="h-4 w-4" style={{color:'#ea3943'}} />}
                <span className="font-bold text-sm"
                  style={{ color: clicked.spike.direction === 'up' ? '#16c784' : '#ea3943' }}>
                  {clicked.spike.pct >= 0 ? '+' : ''}{(clicked.spike.pct * 100).toFixed(2)}% candle
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['open','high','low','close'] as const).map(k => (
                  <div key={k} className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5"
                    style={{ background: 'hsl(var(--muted)/0.5)' }}>
                    <span className="text-[10px] text-muted-foreground capitalize">{k}</span>
                    <span className="text-xs font-semibold tabular-nums">{fmtPrice(clicked.spike![k])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {clicked.news.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  News around this time
                </span>
              </div>
              {clicked.news.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors"
                  style={{ border: '1px solid hsl(var(--border))' }}>
                  <span className="text-xs font-medium leading-snug line-clamp-2">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.source.title} · {new Date(item.published_at).toLocaleDateString()}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
