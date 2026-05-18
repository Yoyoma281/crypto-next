"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type Time,
} from "lightweight-charts";
import { Minus, TrendingUp, Triangle, X, Trash2 } from "lucide-react";

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

// ── Drawing types ───────────────────────────────────────────────────────────────

type DrawingTool = "none" | "horizontal" | "trendline" | "fib";

interface DrawingPoint {
  price: number;
  time: number;
  x: number;
  y: number;
}

interface Drawing {
  id: string;
  type: DrawingTool;
  points: DrawingPoint[];
  color: string;
}

// Fibonacci retracement levels
const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 1.0] as const;
const FIB_COLORS: Record<number, string> = {
  0:     "#4edea3",
  0.236: "#a78bfa",
  0.382: "#f59e0b",
  0.5:   "#60a5fa",
  0.618: "#f87171",
  1.0:   "#4edea3",
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

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

// ── Drawing tool icon button ─────────────────────────────────────────────────────

function DrawingToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={
        active
          ? {
              background: "rgba(78,222,163,0.18)",
              color: "#4edea3",
              border: "1px solid rgba(78,222,163,0.35)",
            }
          : {
              background: "rgba(255,255,255,0.06)",
              color: "#909097",
              border: "1px solid transparent",
            }
      }
      className="flex items-center justify-center w-6 h-6 transition-all hover:text-[#dce1fb]"
    >
      {children}
    </button>
  );
}

// ── SVG drawing renderers ────────────────────────────────────────────────────────

interface SvgDrawingProps {
  drawing: Drawing;
  svgWidth: number;
  svgHeight: number;
  priceToY: (price: number) => number | null;
  timeToX: (time: number) => number | null;
  onDelete: (id: string) => void;
  hoveredId: string | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

function SvgDrawing({
  drawing,
  svgWidth,
  priceToY,
  timeToX,
  onDelete,
  hoveredId,
  onMouseEnter,
  onMouseLeave,
}: SvgDrawingProps) {
  const isHovered = hoveredId === drawing.id;

  if (drawing.type === "horizontal") {
    const pt = drawing.points[0];
    const y = priceToY(pt.price);
    if (y === null || y < 0) return null;

    return (
      <g
        onMouseEnter={() => onMouseEnter(drawing.id)}
        onMouseLeave={onMouseLeave}
      >
        <line
          x1={0}
          y1={y}
          x2={svgWidth}
          y2={y}
          stroke={drawing.color}
          strokeWidth={isHovered ? 2 : 1}
          strokeDasharray="4 3"
          opacity={0.85}
        />
        <text
          x={6}
          y={y - 4}
          fill={drawing.color}
          fontSize={9}
          fontFamily="monospace"
          opacity={0.9}
        >
          {pt.price.toPrecision(6)}
        </text>
        {isHovered && (
          <g
            onClick={() => onDelete(drawing.id)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={svgWidth - 20}
              y={y - 9}
              width={16}
              height={14}
              rx={2}
              fill="rgba(255,90,80,0.8)"
            />
            <text
              x={svgWidth - 17}
              y={y + 2}
              fill="white"
              fontSize={10}
              fontFamily="monospace"
            >
              ×
            </text>
          </g>
        )}
      </g>
    );
  }

  if (drawing.type === "trendline") {
    if (drawing.points.length < 2) return null;
    const p1 = drawing.points[0];
    const p2 = drawing.points[1];
    const x1 = timeToX(p1.time);
    const y1 = priceToY(p1.price);
    const x2 = timeToX(p2.time);
    const y2 = priceToY(p2.price);
    if (x1 === null || y1 === null || x2 === null || y2 === null) return null;

    return (
      <g
        onMouseEnter={() => onMouseEnter(drawing.id)}
        onMouseLeave={onMouseLeave}
      >
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={drawing.color}
          strokeWidth={isHovered ? 2 : 1.5}
          opacity={0.9}
        />
        <circle cx={x1} cy={y1} r={3} fill={drawing.color} opacity={0.8} />
        <circle cx={x2} cy={y2} r={3} fill={drawing.color} opacity={0.8} />
        {isHovered && (
          <g
            onClick={() => onDelete(drawing.id)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={(x1 + x2) / 2 - 8}
              y={(y1 + y2) / 2 - 9}
              width={16}
              height={14}
              rx={2}
              fill="rgba(255,90,80,0.8)"
            />
            <text
              x={(x1 + x2) / 2 - 5}
              y={(y1 + y2) / 2 + 2}
              fill="white"
              fontSize={10}
              fontFamily="monospace"
            >
              ×
            </text>
          </g>
        )}
      </g>
    );
  }

  if (drawing.type === "fib") {
    if (drawing.points.length < 2) return null;
    const p1 = drawing.points[0];
    const p2 = drawing.points[1];
    const highPrice = Math.max(p1.price, p2.price);
    const lowPrice  = Math.min(p1.price, p2.price);
    const range = highPrice - lowPrice;

    const levels = FIB_LEVELS.map((ratio) => ({
      ratio,
      price: highPrice - ratio * range,
    }));

    return (
      <g
        onMouseEnter={() => onMouseEnter(drawing.id)}
        onMouseLeave={onMouseLeave}
      >
        {levels.map(({ ratio, price }) => {
          const y = priceToY(price);
          if (y === null || y < 0) return null;
          const color = FIB_COLORS[ratio] ?? drawing.color;
          return (
            <g key={ratio}>
              <line
                x1={0}
                y1={y}
                x2={svgWidth}
                y2={y}
                stroke={color}
                strokeWidth={isHovered ? 1.5 : 1}
                strokeDasharray="6 4"
                opacity={0.75}
              />
              <text
                x={6}
                y={y - 3}
                fill={color}
                fontSize={8}
                fontFamily="monospace"
                opacity={0.9}
              >
                {(ratio * 100).toFixed(1)}% — {price.toPrecision(6)}
              </text>
            </g>
          );
        })}
        {isHovered && (() => {
          const midRatio = 0.5;
          const midPrice = highPrice - midRatio * range;
          const midY = priceToY(midPrice);
          if (midY === null) return null;
          return (
            <g
              onClick={() => onDelete(drawing.id)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={svgWidth - 20}
                y={midY - 9}
                width={16}
                height={14}
                rx={2}
                fill="rgba(255,90,80,0.8)"
              />
              <text
                x={svgWidth - 17}
                y={midY + 2}
                fill="white"
                fontSize={10}
                fontFamily="monospace"
              >
                ×
              </text>
            </g>
          );
        })()}
      </g>
    );
  }

  return null;
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

  // SVG drawing overlay
  const svgRef = useRef<SVGSVGElement>(null);

  // Cached candle data for re-computing indicators on toggle
  const candleDataRef = useRef<Candle[]>([]);

  const [interval, setInterval] = useState<Interval>("1h");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const [activeIndicators, setActiveIndicators] = useState<Set<IndicatorKey>>(
    new Set(),
  );

  // Drawing state
  const [activeTool, setActiveTool]       = useState<DrawingTool>("none");
  const [drawings, setDrawings]           = useState<Drawing[]>([]);
  const [pendingPoints, setPendingPoints] = useState<DrawingPoint[]>([]);
  const [svgSize, setSvgSize]             = useState({ width: 0, height: 0 });
  const [hoveredDrawingId, setHoveredDrawingId] = useState<string | null>(null);
  // Tick counter to trigger SVG re-render when price/layout updates
  const [renderTick, setRenderTick] = useState(0);

  const toggleIndicator = (key: IndicatorKey) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isActive = (key: IndicatorKey) => activeIndicators.has(key);

  // ── Coordinate conversion helpers ──────────────────────────────────────────

  const priceToY = useCallback((price: number): number | null => {
    // priceToCoordinate lives on ISeriesApi, not IPriceScaleApi
    const y = candleRef.current?.priceToCoordinate(price);
    return y !== undefined && y !== null ? y : null;
  }, []);

  const timeToX = useCallback((time: number): number | null => {
    const x = chartRef.current?.timeScale().timeToCoordinate(time as Time);
    return x !== undefined && x !== null ? x : null;
  }, []);

  // ── Load drawings from backend ─────────────────────────────────────────────

  useEffect(() => {
    if (!symbol) return;
    fetch(`${BASE_URL}/drawings/${symbol}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { drawings: { _id: string; type: string; points: { price: number; time: number }[]; color: string }[] }) => {
        const loaded: Drawing[] = data.drawings.map((d) => ({
          id: d._id,
          type: d.type as DrawingTool,
          color: d.color,
          // Persist price+time from backend; x/y will be computed from chart at render time
          points: d.points.map((p) => ({ price: p.price, time: p.time, x: 0, y: 0 })),
        }));
        setDrawings(loaded);
      })
      .catch(() => {
        // Not authenticated or network error — drawings just stay empty
      });
  }, [symbol]);

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

    // Update SVG size and re-render drawings on every crosshair/scroll move
    chart.subscribeCrosshairMove(() => {
      setRenderTick((t) => t + 1);
    });
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      setRenderTick((t) => t + 1);
    });

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
      setSvgSize({ width: el.clientWidth, height: el.clientHeight });
      setRenderTick((t) => t + 1);
    });
    ro.observe(el);

    // Set initial SVG size
    setSvgSize({ width: el.clientWidth, height: el.clientHeight });

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

        applyIndicators(rows, activeIndicators);
        if (activeIndicators.has("RSI"))  applyRSI(rows);
        if (activeIndicators.has("MACD")) applyMACD(rows);

        // Trigger SVG re-render now that chart has data
        setRenderTick((t) => t + 1);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applyIndicators, applyRSI, applyMACD],
  );

  useEffect(() => {
    fetchCandles(symbol, interval);
  }, [symbol, interval, fetchCandles]);

  // ── Re-apply overlay indicators when toggle changes ─────────────────────────

  useEffect(() => {
    const rows = candleDataRef.current;
    if (!rows.length) return;

    applyIndicators(rows, activeIndicators);

    if (activeIndicators.has("RSI")) {
      setTimeout(() => applyRSI(rows), 0);
    } else {
      destroyRSI();
    }

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
    // Bump render tick so SVG drawings reposition with updated price scale
    setRenderTick((t) => t + 1);
  }, [livePrice]);

  // ── Drawing tool: cancel on Escape ───────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveTool("none");
        setPendingPoints([]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ── SVG click handler ────────────────────────────────────────────────────────

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (activeTool === "none") return;
    const chart = chartRef.current;
    if (!chart) return;

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // coordinateToPrice lives on ISeriesApi in lightweight-charts v4
    const price = candleRef.current?.coordinateToPrice(y) ?? null;
    const time  = chart.timeScale().coordinateToTime(x);

    if (price === null || time === null) return;

    const newPoint: DrawingPoint = {
      price: price as number,
      time:  time as number,
      x,
      y,
    };

    const pointsNeeded = activeTool === "horizontal" ? 1 : 2;
    const next = [...pendingPoints, newPoint];

    if (next.length >= pointsNeeded) {
      const drawing: Drawing = {
        id:     `local-${Date.now()}`,
        type:   activeTool,
        points: next,
        color:  "#4edea3",
      };

      setDrawings((prev) => [...prev, drawing]);
      setPendingPoints([]);
      setActiveTool("none");

      // Persist to backend
      fetch(`${BASE_URL}/drawings/${symbol}`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:   drawing.type,
          color:  drawing.color,
          points: drawing.points.map(({ price: p, time: t }) => ({ price: p, time: t })),
        }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data: { drawing: { _id: string } }) => {
          // Replace local ID with server-assigned ID
          setDrawings((prev) =>
            prev.map((d) =>
              d.id === drawing.id ? { ...d, id: data.drawing._id } : d,
            ),
          );
        })
        .catch(() => {
          // Remove drawing if save failed (e.g. unauthenticated)
          setDrawings((prev) => prev.filter((d) => d.id !== drawing.id));
        });
    } else {
      setPendingPoints(next);
    }
  }

  // ── Delete a drawing ─────────────────────────────────────────────────────────

  function handleDeleteDrawing(id: string) {
    setDrawings((prev) => prev.filter((d) => d.id !== id));
    if (!id.startsWith("local-")) {
      fetch(`${BASE_URL}/drawings/drawing/${id}`, {
        method:      "DELETE",
        credentials: "include",
      }).catch(() => {});
    }
  }

  // ── Clear all drawings for this symbol ───────────────────────────────────────

  function handleClearAllDrawings() {
    setDrawings([]);
    setPendingPoints([]);
    setActiveTool("none");
    fetch(`${BASE_URL}/drawings/${symbol}/all`, {
      method:      "DELETE",
      credentials: "include",
    }).catch(() => {});
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const INDICATORS: { key: IndicatorKey; label: string }[] = [
    { key: "MA",   label: "MA"   },
    { key: "EMA",  label: "EMA"  },
    { key: "BB",   label: "BB"   },
    { key: "RSI",  label: "RSI"  },
    { key: "MACD", label: "MACD" },
  ];

  // Instruction text shown when a tool is active
  const toolHint: Record<DrawingTool, string> = {
    none:       "",
    horizontal: "Click to place horizontal line",
    trendline:  pendingPoints.length === 0 ? "Click start point" : "Click end point",
    fib:        pendingPoints.length === 0 ? "Click high point"  : "Click low point",
  };

  // unused variable suppression (renderTick is read to trigger re-renders)
  void renderTick;

  return (
    <div className="relative flex flex-col w-full h-full bg-[#070d1f]">

      {/* ── Toolbar: timeframes + indicator pills + drawing tools ──────── */}
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

        {/* Divider */}
        <div className="h-4 w-px bg-[#2e3447] mx-1.5" />

        {/* Drawing tools */}
        <div className="flex items-center gap-1">
          <DrawingToolButton
            active={activeTool === "horizontal"}
            onClick={() => {
              setActiveTool((t) => (t === "horizontal" ? "none" : "horizontal"));
              setPendingPoints([]);
            }}
            title="Horizontal line"
          >
            <Minus size={12} />
          </DrawingToolButton>

          <DrawingToolButton
            active={activeTool === "trendline"}
            onClick={() => {
              setActiveTool((t) => (t === "trendline" ? "none" : "trendline"));
              setPendingPoints([]);
            }}
            title="Trendline"
          >
            <TrendingUp size={12} />
          </DrawingToolButton>

          <DrawingToolButton
            active={activeTool === "fib"}
            onClick={() => {
              setActiveTool((t) => (t === "fib" ? "none" : "fib"));
              setPendingPoints([]);
            }}
            title="Fibonacci retracement"
          >
            <Triangle size={12} />
          </DrawingToolButton>

          {/* Cancel active tool */}
          {activeTool !== "none" && (
            <DrawingToolButton
              active={false}
              onClick={() => {
                setActiveTool("none");
                setPendingPoints([]);
              }}
              title="Cancel drawing"
            >
              <X size={12} />
            </DrawingToolButton>
          )}

          {/* Clear all drawings */}
          {drawings.length > 0 && activeTool === "none" && (
            <DrawingToolButton
              active={false}
              onClick={handleClearAllDrawings}
              title="Clear all drawings"
            >
              <Trash2 size={12} />
            </DrawingToolButton>
          )}
        </div>

        {/* Active tool hint */}
        {activeTool !== "none" && (
          <span className="ml-2 text-[9px] text-[#4edea3] font-mono animate-pulse">
            {toolHint[activeTool]}
          </span>
        )}

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

      {/* ── Main price chart + SVG overlay ────────────────────────────── */}
      <div className="relative flex-1 w-full min-h-0">
        <div ref={containerRef} className="w-full h-full" />

        {/* SVG drawing overlay */}
        <svg
          ref={svgRef}
          width={svgSize.width}
          height={svgSize.height}
          className="absolute inset-0 z-10"
          style={{
            pointerEvents: activeTool !== "none" ? "auto" : "none",
            cursor:        activeTool !== "none" ? "crosshair" : "default",
          }}
          onClick={handleSvgClick}
        >
          {/* Render persisted drawings */}
          {drawings.map((d) => (
            <SvgDrawing
              key={d.id}
              drawing={d}
              svgWidth={svgSize.width}
              svgHeight={svgSize.height}
              priceToY={priceToY}
              timeToX={timeToX}
              onDelete={handleDeleteDrawing}
              hoveredId={hoveredDrawingId}
              onMouseEnter={(id) => {
                if (activeTool === "none") setHoveredDrawingId(id);
              }}
              onMouseLeave={() => setHoveredDrawingId(null)}
            />
          ))}

          {/* Pending first point indicator (trendline / fib) */}
          {pendingPoints.length === 1 && (
            <circle
              cx={pendingPoints[0].x}
              cy={pendingPoints[0].y}
              r={4}
              fill="#4edea3"
              opacity={0.8}
            />
          )}
        </svg>
      </div>

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
