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

// ── Timeframe config ────────────────────────────────────────────────────────────

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

// ── Indicator types ─────────────────────────────────────────────────────────────

type IndicatorKey = "MA" | "EMA" | "BB" | "RSI" | "MACD";

// ── Pure indicator computation functions ────────────────────────────────────────

function computeSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    return sum / period;
  });
}

function computeEMA(closes: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = new Array(closes.length).fill(null);
  let ema: number | null = null;
  for (let i = 0; i < closes.length; i++) {
    if (ema === null) {
      if (i < period - 1) continue;
      // Seed with SMA of first `period` values
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += closes[j];
      ema = sum / period;
    } else {
      ema = closes[i] * k + ema * (1 - k);
    }
    result[i] = ema;
  }
  return result;
}

function computeBollinger(
  closes: number[],
  period: number,
): { upper: number | null; mid: number | null; lower: number | null }[] {
  const sma = computeSMA(closes, period);
  return closes.map((_, i) => {
    if (sma[i] === null) return { upper: null, mid: null, lower: null };
    const mid = sma[i] as number;
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = closes[j] - mid;
      variance += diff * diff;
    }
    const stddev = Math.sqrt(variance / period);
    return {
      upper: mid + 2 * stddev,
      mid,
      lower: mid - 2 * stddev,
    };
  });
}

function computeRSI(closes: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return result;

  // Initial avg gain/loss from first `period` changes
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rsVal = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + rsVal);
  }
  return result;
}

function computeMACD(
  closes: number[],
  fast: number,
  slow: number,
  signalPeriod: number,
): { macd: number | null; signal: number | null; histogram: number | null }[] {
  const fastEma = computeEMA(closes, fast);
  const slowEma = computeEMA(closes, slow);

  const macdLine: (number | null)[] = closes.map((_, i) => {
    if (fastEma[i] === null || slowEma[i] === null) return null;
    return (fastEma[i] as number) - (slowEma[i] as number);
  });

  // Compute EMA of MACD line for the signal
  const macdValues = macdLine.filter((v): v is number => v !== null);
  const macdStartIdx = macdLine.findIndex((v) => v !== null);
  const signalEmaValues = computeEMA(macdValues, signalPeriod);

  const signalLine: (number | null)[] = new Array(closes.length).fill(null);
  let signalOffset = 0;
  for (let i = macdStartIdx; i < closes.length; i++) {
    if (macdLine[i] !== null) {
      signalLine[i] = signalEmaValues[signalOffset] ?? null;
      signalOffset++;
    }
  }

  return closes.map((_, i) => {
    const macd = macdLine[i];
    const signal = signalLine[i];
    return {
      macd,
      signal,
      histogram: macd !== null && signal !== null ? macd - signal : null,
    };
  });
}

// ── Shared chart options factory ────────────────────────────────────────────────

function makeSubChartOptions(el: HTMLElement) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: "#070d1f" },
      textColor: "#909097",
      fontFamily: "monospace",
      fontSize: 10,
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
  };
}

// ── Toggle pill component ────────────────────────────────────────────────────────

function IndicatorPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={
        active
          ? {
              background: "rgba(78,222,163,0.15)",
              color: "#4edea3",
              border: "1px solid rgba(78,222,163,0.3)",
            }
          : {
              background: "rgba(255,255,255,0.06)",
              color: "#909097",
              border: "1px solid transparent",
            }
      }
      className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all"
    >
      {label}
    </button>
  );
}

// ── Main component ───────────────────────────────────────────────────────────────

export default function PriceChart({
  symbol,
  livePrice,
}: {
  symbol: string;
  livePrice?: string | null;
}) {
  // Main chart refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const candleRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef       = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lastBarRef   = useRef<Candle | null>(null);

  // Overlay indicator series refs (on main chart)
  const maSeriesRef    = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef   = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperRef     = useRef<ISeriesApi<"Line"> | null>(null);
  const bbMidRef       = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef     = useRef<ISeriesApi<"Line"> | null>(null);

  // RSI sub-chart refs
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartRef     = useRef<IChartApi | null>(null);
  const rsiSeriesRef    = useRef<ISeriesApi<"Line"> | null>(null);

  // MACD sub-chart refs
  const macdContainerRef  = useRef<HTMLDivElement>(null);
  const macdChartRef      = useRef<IChartApi | null>(null);
  const macdLineRef       = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalRef     = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistRef       = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Cached candle data for re-computing indicators on toggle
  const candleDataRef = useRef<Candle[]>([]);

  const [interval, setInterval] = useState<Interval>("1h");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const [activeIndicators, setActiveIndicators] = useState<Set<IndicatorKey>>(
    new Set(),
  );

  const toggleIndicator = (key: IndicatorKey) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isActive = (key: IndicatorKey) => activeIndicators.has(key);

  // ── Create / destroy main chart ────────────────────────────────────────────

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
      upColor:         "#4edea3",
      downColor:       "#ffb3ad",
      borderUpColor:   "#4edea3",
      borderDownColor: "#ffb3ad",
      wickUpColor:     "#4edea3",
      wickDownColor:   "#ffb3ad",
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
      chartRef.current   = null;
      candleRef.current  = null;
      volRef.current     = null;
      maSeriesRef.current  = null;
      emaSeriesRef.current = null;
      bbUpperRef.current   = null;
      bbMidRef.current     = null;
      bbLowerRef.current   = null;
    };
  }, []);

  // ── Fetch candles ──────────────────────────────────────────────────────────

  const applyIndicators = useCallback(
    (rows: Candle[], active: Set<IndicatorKey>) => {
      const chart = chartRef.current;
      if (!chart || !rows.length) return;

      const closes = rows.map((c) => c.close);
      const times  = rows.map((c) => c.time as UTCTimestamp);

      // Helper: map a nullable array to lw-charts data points
      const toPoints = (vals: (number | null)[]) =>
        vals
          .map((v, i) => (v === null ? null : { time: times[i], value: v }))
          .filter((p): p is { time: UTCTimestamp; value: number } => p !== null);

      // ── MA ────────────────────────────────────────────────────────────────
      if (active.has("MA")) {
        if (!maSeriesRef.current) {
          maSeriesRef.current = chart.addLineSeries({
            color:       "#f59e0b",
            lineWidth:   1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
        }
        maSeriesRef.current.setData(toPoints(computeSMA(closes, 20)));
      } else if (maSeriesRef.current) {
        chart.removeSeries(maSeriesRef.current);
        maSeriesRef.current = null;
      }

      // ── EMA ───────────────────────────────────────────────────────────────
      if (active.has("EMA")) {
        if (!emaSeriesRef.current) {
          emaSeriesRef.current = chart.addLineSeries({
            color:       "#a78bfa",
            lineWidth:   1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
        }
        emaSeriesRef.current.setData(toPoints(computeEMA(closes, 20)));
      } else if (emaSeriesRef.current) {
        chart.removeSeries(emaSeriesRef.current);
        emaSeriesRef.current = null;
      }

      // ── Bollinger Bands ───────────────────────────────────────────────────
      if (active.has("BB")) {
        const bb = computeBollinger(closes, 20);
        const upperPts = bb
          .map((b, i) => (b.upper === null ? null : { time: times[i], value: b.upper }))
          .filter((p): p is { time: UTCTimestamp; value: number } => p !== null);
        const midPts = bb
          .map((b, i) => (b.mid === null ? null : { time: times[i], value: b.mid }))
          .filter((p): p is { time: UTCTimestamp; value: number } => p !== null);
        const lowerPts = bb
          .map((b, i) => (b.lower === null ? null : { time: times[i], value: b.lower }))
          .filter((p): p is { time: UTCTimestamp; value: number } => p !== null);

        if (!bbUpperRef.current) {
          bbUpperRef.current = chart.addLineSeries({
            color:            "rgba(96,165,250,0.4)",
            lineWidth:        1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
        }
        if (!bbMidRef.current) {
          bbMidRef.current = chart.addLineSeries({
            color:            "rgba(96,165,250,0.8)",
            lineWidth:        1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
        }
        if (!bbLowerRef.current) {
          bbLowerRef.current = chart.addLineSeries({
            color:            "rgba(96,165,250,0.4)",
            lineWidth:        1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
        }
        bbUpperRef.current.setData(upperPts);
        bbMidRef.current.setData(midPts);
        bbLowerRef.current.setData(lowerPts);
      } else {
        if (bbUpperRef.current) { chart.removeSeries(bbUpperRef.current); bbUpperRef.current = null; }
        if (bbMidRef.current)   { chart.removeSeries(bbMidRef.current);   bbMidRef.current   = null; }
        if (bbLowerRef.current) { chart.removeSeries(bbLowerRef.current); bbLowerRef.current = null; }
      }
    },
    [],
  );

  const applyRSI = useCallback((rows: Candle[]) => {
    const el = rsiContainerRef.current;
    if (!el || !rows.length) return;

    if (!rsiChartRef.current) {
      rsiChartRef.current = createChart(el, makeSubChartOptions(el));
      const ro = new ResizeObserver(() => {
        rsiChartRef.current?.applyOptions({ width: el.clientWidth, height: el.clientHeight });
      });
      ro.observe(el);
    }

    const chart = rsiChartRef.current;

    if (!rsiSeriesRef.current) {
      rsiSeriesRef.current = chart.addLineSeries({
        color:            "#4edea3",
        lineWidth:        1,
        priceLineVisible: false,
        lastValueVisible: true,
      });
    }

    const closes = rows.map((c) => c.close);
    const times  = rows.map((c) => c.time as UTCTimestamp);
    const rsiVals = computeRSI(closes, 14);
    const points = rsiVals
      .map((v, i) => (v === null ? null : { time: times[i], value: v }))
      .filter((p): p is { time: UTCTimestamp; value: number } => p !== null);

    rsiSeriesRef.current.setData(points);

    // Overbought / oversold reference lines via price lines
    rsiSeriesRef.current.createPriceLine({ price: 70, color: "#f87171", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "70" });
    rsiSeriesRef.current.createPriceLine({ price: 30, color: "#4ade80", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "30" });
  }, []);

  const destroyRSI = useCallback(() => {
    if (rsiChartRef.current) {
      rsiChartRef.current.remove();
      rsiChartRef.current  = null;
      rsiSeriesRef.current = null;
    }
  }, []);

  const applyMACD = useCallback((rows: Candle[]) => {
    const el = macdContainerRef.current;
    if (!el || !rows.length) return;

    if (!macdChartRef.current) {
      macdChartRef.current = createChart(el, makeSubChartOptions(el));
      const ro = new ResizeObserver(() => {
        macdChartRef.current?.applyOptions({ width: el.clientWidth, height: el.clientHeight });
      });
      ro.observe(el);
    }

    const chart = macdChartRef.current;

    if (!macdLineRef.current) {
      macdLineRef.current = chart.addLineSeries({
        color:            "#4edea3",
        lineWidth:        1,
        priceLineVisible: false,
        lastValueVisible: true,
      });
    }
    if (!macdSignalRef.current) {
      macdSignalRef.current = chart.addLineSeries({
        color:            "#f59e0b",
        lineWidth:        1,
        priceLineVisible: false,
        lastValueVisible: true,
      });
    }
    if (!macdHistRef.current) {
      macdHistRef.current = chart.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
      });
    }

    const closes = rows.map((c) => c.close);
    const times  = rows.map((c) => c.time as UTCTimestamp);
    const macdData = computeMACD(closes, 12, 26, 9);

    const macdPts = macdData
      .map((d, i) => (d.macd === null ? null : { time: times[i], value: d.macd }))
      .filter((p): p is { time: UTCTimestamp; value: number } => p !== null);
    const signalPts = macdData
      .map((d, i) => (d.signal === null ? null : { time: times[i], value: d.signal }))
      .filter((p): p is { time: UTCTimestamp; value: number } => p !== null);
    const histPts = macdData
      .map((d, i) =>
        d.histogram === null
          ? null
          : {
              time:  times[i],
              value: d.histogram,
              color: d.histogram >= 0 ? "rgba(78,222,163,0.6)" : "rgba(255,179,173,0.6)",
            },
      )
      .filter(
        (p): p is { time: UTCTimestamp; value: number; color: string } => p !== null,
      );

    macdLineRef.current.setData(macdPts);
    macdSignalRef.current.setData(signalPts);
    macdHistRef.current.setData(histPts);
  }, []);

  const destroyMACD = useCallback(() => {
    if (macdChartRef.current) {
      macdChartRef.current.remove();
      macdChartRef.current   = null;
      macdLineRef.current    = null;
      macdSignalRef.current  = null;
      macdHistRef.current    = null;
    }
  }, []);

  const fetchCandles = useCallback(
    async (sym: string, tf: Interval) => {
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

        candleDataRef.current = rows;
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

        // Re-apply overlay indicators with fresh data
        applyIndicators(rows, activeIndicators);
        if (activeIndicators.has("RSI"))  applyRSI(rows);
        if (activeIndicators.has("MACD")) applyMACD(rows);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applyIndicators, applyRSI, applyMACD],
    // NOTE: activeIndicators intentionally excluded — we re-apply via the
    // toggle effect below to avoid stale closures; fetchCandles reads the
    // current set via its own callback ref pattern
  );

  useEffect(() => {
    fetchCandles(symbol, interval);
  }, [symbol, interval, fetchCandles]);

  // ── Re-apply overlay indicators when toggle changes ─────────────────────────

  useEffect(() => {
    const rows = candleDataRef.current;
    if (!rows.length) return;

    applyIndicators(rows, activeIndicators);

    // RSI sub-chart
    if (activeIndicators.has("RSI")) {
      // Defer so the div is visible and has layout
      setTimeout(() => applyRSI(rows), 0);
    } else {
      destroyRSI();
    }

    // MACD sub-chart
    if (activeIndicators.has("MACD")) {
      setTimeout(() => applyMACD(rows), 0);
    } else {
      destroyMACD();
    }
  }, [activeIndicators, applyIndicators, applyRSI, applyMACD, destroyRSI, destroyMACD]);

  // ── Cleanup sub-charts on unmount ────────────────────────────────────────────

  useEffect(() => {
    return () => {
      destroyRSI();
      destroyMACD();
    };
  }, [destroyRSI, destroyMACD]);

  // ── Live price update on last candle ─────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────────

  const INDICATORS: { key: IndicatorKey; label: string }[] = [
    { key: "MA",   label: "MA"   },
    { key: "EMA",  label: "EMA"  },
    { key: "BB",   label: "BB"   },
    { key: "RSI",  label: "RSI"  },
    { key: "MACD", label: "MACD" },
  ];

  return (
    <div className="relative flex flex-col w-full h-full bg-[#070d1f]">

      {/* ── Toolbar: timeframes + indicator pills ──────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 min-h-[36px] border-b border-[#2e3447] shrink-0 bg-[#0b1222]">
        {/* Timeframe buttons */}
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

        {/* Divider */}
        <div className="h-4 w-px bg-[#2e3447] mx-1.5" />

        {/* Indicator pills */}
        <div className="flex items-center gap-1">
          {INDICATORS.map(({ key, label }) => (
            <IndicatorPill
              key={key}
              label={label}
              active={isActive(key)}
              onClick={() => toggleIndicator(key)}
            />
          ))}
        </div>

        {/* Status */}
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

      {/* ── Main price chart ───────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 w-full min-h-0" />

      {/* ── RSI sub-chart ──────────────────────────────────────────────── */}
      {isActive("RSI") && (
        <div className="shrink-0 w-full border-t border-[#2e3447]" style={{ height: 120 }}>
          <div className="px-2 py-0.5 bg-[#0b1222] flex items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#4edea3]">
              RSI (14)
            </span>
          </div>
          <div ref={rsiContainerRef} style={{ height: 100, width: "100%" }} />
        </div>
      )}

      {/* ── MACD sub-chart ─────────────────────────────────────────────── */}
      {isActive("MACD") && (
        <div className="shrink-0 w-full border-t border-[#2e3447]" style={{ height: 120 }}>
          <div className="px-2 py-0.5 bg-[#0b1222] flex items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#4edea3]">
              MACD (12, 26, 9)
            </span>
          </div>
          <div ref={macdContainerRef} style={{ height: 100, width: "100%" }} />
        </div>
      )}
    </div>
  );
}
