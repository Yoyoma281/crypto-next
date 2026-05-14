"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

const TIMEFRAMES = [
  { label: "1m",  interval: "1m"  },
  { label: "5m",  interval: "5m"  },
  { label: "15m", interval: "15m" },
  { label: "1h",  interval: "1h"  },
  { label: "4h",  interval: "4h"  },
  { label: "1d",  interval: "1d"  },
  { label: "1w",  interval: "1w"  },
] as const;

type Interval = (typeof TIMEFRAMES)[number]["interval"];

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function PriceChart({
  symbol,
  livePrice,
}: {
  symbol: string;
  livePrice?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef    = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lastBarRef = useRef<Candle | null>(null);

  const [interval, setInterval] = useState<Interval>("1h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Create chart once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#070d1f" },
        textColor: "#909097",
        fontFamily: "monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e2535" },
        horzLines: { color: "#1e2535" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#4edea350", labelBackgroundColor: "#1a2235" },
        horzLine: { color: "#4edea350", labelBackgroundColor: "#1a2235" },
      },
      rightPriceScale: { borderColor: "#2e3447" },
      timeScale: {
        borderColor: "#2e3447",
        timeVisible: true,
        secondsVisible: false,
      },
      width: el.clientWidth,
      height: el.clientHeight,
    });

    const candles = chart.addCandlestickSeries({
      upColor:        "#4edea3",
      downColor:      "#ffb3ad",
      borderUpColor:  "#4edea3",
      borderDownColor:"#ffb3ad",
      wickUpColor:    "#4edea3",
      wickDownColor:  "#ffb3ad",
    });

    const vol = chart.addHistogramSeries({
      priceFormat:  { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current  = chart;
    candleRef.current = candles;
    volRef.current    = vol;

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current  = null;
      candleRef.current = null;
      volRef.current    = null;
    };
  }, []);

  // Fetch candles when symbol or interval changes
  const fetchCandles = useCallback(async (sym: string, tf: Interval) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/market/candles?symbol=${sym}&interval=${tf}&limit=200`,
      );
      if (!res.ok) throw new Error("fetch failed");
      const data: { candles: Candle[] } = await res.json();
      const rows = data.candles ?? [];
      if (!rows.length) return;

      lastBarRef.current = rows[rows.length - 1];

      candleRef.current?.setData(
        rows.map((c) => ({
          time:  c.time as UTCTimestamp,
          open:  c.open,
          high:  c.high,
          low:   c.low,
          close: c.close,
        })),
      );
      volRef.current?.setData(
        rows.map((c) => ({
          time:  c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? "#4edea322" : "#ffb3ad22",
        })),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandles(symbol, interval);
  }, [symbol, interval, fetchCandles]);

  // Update last candle in real-time from live ticker price
  useEffect(() => {
    if (!livePrice || !candleRef.current || !lastBarRef.current) return;
    const price = parseFloat(livePrice);
    if (isNaN(price)) return;
    const last = lastBarRef.current;
    const updated: Candle = {
      ...last,
      close: price,
      high:  Math.max(last.high, price),
      low:   Math.min(last.low,  price),
    };
    lastBarRef.current = updated;
    candleRef.current.update({
      time:  updated.time as UTCTimestamp,
      open:  updated.open,
      high:  updated.high,
      low:   updated.low,
      close: updated.close,
    });
  }, [livePrice]);

  return (
    <div className="relative flex flex-col w-full h-full bg-[#070d1f]">
      {/* Timeframe bar */}
      <div className="flex items-center gap-0.5 px-3 h-9 border-b border-[#2e3447] shrink-0 bg-[#0b1222]">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.interval}
            onClick={() => setInterval(tf.interval)}
            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-colors ${
              interval === tf.interval
                ? "text-[#4edea3] bg-[#4edea3]/10"
                : "text-[#909097] hover:text-[#dce1fb]"
            }`}
          >
            {tf.label}
          </button>
        ))}
        {loading && (
          <span className="ml-2 text-[9px] text-[#909097] animate-pulse font-mono">
            Loading…
          </span>
        )}
        {error && !loading && (
          <span className="ml-2 text-[9px] text-[#ffb3ad] font-mono">
            Failed to load candles
          </span>
        )}
      </div>

      {/* Chart canvas */}
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}
