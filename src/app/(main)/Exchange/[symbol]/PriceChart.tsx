"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  SeriesMarker,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { TrendingUp, TrendingDown, X, Newspaper } from "lucide-react";

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
type Interval = (typeof INTERVALS)[number];

// Bybit kline interval codes
const BYBIT_INTERVAL: Record<Interval, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "1h": "60",
  "4h": "240",
  "1d": "D",
};

const INTERVAL_SECONDS: Record<Interval, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};
const INTERVAL_LIMITS: Record<Interval, number> = {
  "1m": 500,
  "5m": 1000,
  "15m": 1000,
  "1h": 1000,
  "4h": 1000,
  "1d": 1000,
};

const SPIKE_THRESHOLD = 0.025;

interface Candle extends CandlestickData {
  time: Time;
}

interface SpikeEvent {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
  pct: number;
  direction: "up" | "down";
}

interface NewsItem {
  id: number;
  title: string;
  url: string;
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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtPrice(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export default function PriceChart({ symbol }: { symbol: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const base = symbol.replace("USDT", "");

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const spikesRef = useRef<SpikeEvent[]>([]);
  const newsMapRef = useRef<Map<number, NewsItem[]>>(new Map());

  const [interval, setInterval] = useState<Interval>("1h");
  const [clicked, setClicked] = useState<ClickedInfo | null>(null);

  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
  const scaleColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

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
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: {
        borderColor: scaleColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: { borderColor: scaleColor },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#4edea3",
      downColor: "#ffb3ad",
      borderUpColor: "#4edea3",
      borderDownColor: "#ffb3ad",
      wickUpColor: "#4edea3",
      wickDownColor: "#ffb3ad",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ivSec = INTERVAL_SECONDS[interval];
    const limit = INTERVAL_LIMITS[interval];
    const bybitIv = BYBIT_INTERVAL[interval];

    // Fetch candles + news in parallel
    let cancelled = false;
    Promise.all([
      fetch(
        `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${bybitIv}&limit=${limit}`,
      ).then((r) => r.json()),
      fetch(`/api/news?currency=${base}`)
        .then((r) => r.json())
        .then((d) => (d.results ?? []) as NewsItem[])
        .catch(() => [] as NewsItem[]),
    ])
      .then(
        ([klineRes, newsItems]: [
          { result: { list: string[][] } },
          NewsItem[],
        ]) => {
          if (cancelled) return;

          // Bybit returns newest-first; reverse to oldest-first for the chart
          const candles: Candle[] = [...(klineRes.result?.list ?? [])]
            .reverse()
            .map((k) => ({
              time: (parseInt(k[0]) / 1000) as Time,
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
            }));

          series.setData(candles);
          chart.timeScale().fitContent();

          // Detect spikes
          const spikes: SpikeEvent[] = candles
            .filter(
              (c) => Math.abs((c.close - c.open) / c.open) >= SPIKE_THRESHOLD,
            )
            .map((c) => ({
              time: c.time as number,
              open: c.open,
              close: c.close,
              high: c.high,
              low: c.low,
              pct: (c.close - c.open) / c.open,
              direction: c.close >= c.open ? "up" : ("down" as "up" | "down"),
            }));
          spikesRef.current = spikes;

          // Match news to nearest candle
          const newsMap = new Map<number, NewsItem[]>();
          const candleTimes = candles.map((c) => c.time as number);
          newsItems.forEach((item) => {
            const pubSec = new Date(item.published_at).getTime() / 1000;
            let bestTime = -1,
              bestDiff = Infinity;
            for (const ct of candleTimes) {
              const diff = Math.abs(ct - pubSec);
              if (diff < bestDiff && diff <= ivSec * 2) {
                bestDiff = diff;
                bestTime = ct;
              }
            }
            if (bestTime !== -1) {
              if (!newsMap.has(bestTime)) newsMap.set(bestTime, []);
              newsMap.get(bestTime)!.push(item);
            }
          });
          newsMapRef.current = newsMap;

          // Build markers
          const markers: SeriesMarker<Time>[] = [];
          spikes.forEach((s) =>
            markers.push({
              time: s.time as Time,
              position: s.direction === "up" ? "belowBar" : "aboveBar",
              color: s.direction === "up" ? "#4edea3" : "#ffb3ad",
              shape: s.direction === "up" ? "arrowUp" : "arrowDown",
              text: `${s.pct >= 0 ? "+" : ""}${(s.pct * 100).toFixed(1)}%`,
              size: 1,
            }),
          );
          newsMap.forEach((_, t) => {
            if (!spikes.find((s) => s.time === t)) {
              markers.push({
                time: t as Time,
                position: "aboveBar",
                color: "#7a9db4",
                shape: "circle",
                text: "●",
                size: 0,
              });
            }
          });

          markers.sort((a, b) => (a.time as number) - (b.time as number));
          series.setMarkers(markers);
        },
      )
      .catch(() => {});

    // Click handler
    chart.subscribeClick((param) => {
      if (!param.time) {
        setClicked(null);
        return;
      }
      const t = param.time as number;
      const spike = spikesRef.current.find((s) => s.time === t) ?? null;
      const news = newsMapRef.current.get(t) ?? [];
      if (spike || news.length > 0) {
        setClicked({ time: t, spike, news });
      } else {
        setClicked(null);
      }
    });

    // Live WebSocket klines
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [`kline.${bybitIv}.${symbol}`],
        }),
      );
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (!msg.topic || !msg.topic.startsWith("kline")) return;
      const k = msg.data?.[0];
      if (!k) return;
      series.update({
        time: (parseInt(k.start) / 1000) as Time,
        open: parseFloat(k.open),
        high: parseFloat(k.high),
        low: parseFloat(k.low),
        close: parseFloat(k.close),
      });
    };

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      cancelled = true;
      ws.close();
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol, interval, isDark]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = buildChart();
    return cleanup;
  }, [buildChart]);

  return (
    <div className="flex flex-col">
      {/* Interval buttons */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className="px-3 py-1 text-xs rounded-md font-medium transition-colors"
            style={{
              background: interval === iv ? "#4edea3" : "#151b2d",
              color: interval === iv ? "#000000" : "#909097",
              border: interval === iv ? "1px solid #4edea3" : "1px solid #2e3447",
            }}
          >
            {iv}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-[10px]" style={{ color: "#909097" }}>
          <span className="flex items-center gap-1">
            <span style={{ color: "#4edea3" }}>▲</span> Spike up
          </span>
          <span className="flex items-center gap-1">
            <span style={{ color: "#ffb3ad" }}>▼</span> Spike down
          </span>
          <span className="flex items-center gap-1">
            <span style={{ color: "#7a9db4" }}>●</span> News
          </span>
          <span style={{ color: "#c6c6cd" }}>Click markers for details</span>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="w-full" />

      {/* Detail panel */}
      {clicked && (
        <div
          className="mx-3 mb-3 mt-2 rounded-lg p-4 flex flex-col gap-3"
          style={{
            background: "#151b2d",
            border: "1px solid #2e3447",
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "12px", color: "#909097" }}>
              {fmtTime(clicked.time)}
            </span>
            <button
              onClick={() => setClicked(null)}
              className="transition-colors"
              style={{ color: "#909097" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {clicked.spike && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {clicked.spike.direction === "up" ? (
                  <TrendingUp
                    className="h-4 w-4"
                    style={{ color: "#4edea3" }}
                  />
                ) : (
                  <TrendingDown
                    className="h-4 w-4"
                    style={{ color: "#ffb3ad" }}
                  />
                )}
                <span
                  className="font-bold text-sm"
                  style={{
                    color:
                      clicked.spike.direction === "up" ? "#4edea3" : "#ffb3ad",
                  }}
                >
                  {clicked.spike.pct >= 0 ? "+" : ""}
                  {(clicked.spike.pct * 100).toFixed(2)}% candle
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["open", "high", "low", "close"] as const).map((k) => (
                  <div
                    key={k}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5"
                    style={{ background: "rgba(78,222,163,0.08)" }}
                  >
                    <span style={{ fontSize: "10px", color: "#909097", textTransform: "capitalize" }}>
                      {k}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#dce1fb" }} className="tabular-nums">
                      {fmtPrice(clicked.spike![k])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {clicked.news.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5" style={{ color: "#909097" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#909097", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  News around this time
                </span>
              </div>
              {clicked.news.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 px-2.5 py-2 rounded-lg transition-colors"
                  style={{ border: "1px solid #2e3447" }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "#dce1fb" }} className="leading-snug line-clamp-2">
                    {item.title}
                  </span>
                  <span style={{ fontSize: "10px", color: "#909097" }}>
                    {item.source.title} ·{" "}
                    {new Date(item.published_at).toLocaleDateString()}
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
