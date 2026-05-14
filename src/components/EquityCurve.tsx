"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

interface HistoryPoint {
  date: string;
  value: number;
}

const RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

function abbreviateDollar(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return "$" + (value / 1_000_000).toFixed(1) + "M";
  }
  if (Math.abs(value) >= 1_000) {
    return "$" + (value / 1_000).toFixed(1) + "K";
  }
  return "$" + value.toFixed(0);
}

function formatXAxisDate(dateStr: string, range: Range): string {
  try {
    const d = parseISO(dateStr);
    if (range === "1D") return format(d, "HH:mm");
    if (range === "1W") return format(d, "EEE");
    if (range === "1M") return format(d, "MMM d");
    return format(d, "MMM d");
  } catch {
    return dateStr;
  }
}

function formatTooltipDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0].value;
  return (
    <div
      className="rounded-md px-3 py-2 text-xs"
      style={{
        background: "#0b1222",
        border: "1px solid #2e3447",
        color: "#dce1fb",
      }}
    >
      <p className="text-[#909097] mb-0.5">{label ? formatTooltipDate(label) : ""}</p>
      <p className="font-bold" style={{ color: "#4edea3" }}>
        {"$" +
          value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
      </p>
    </div>
  );
}

export default function EquityCurve() {
  const [range, setRange] = useState<Range>("1M");
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(`/api/portfolio/history?range=${range}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { history: HistoryPoint[] }) => {
        setHistory(data.history ?? []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setError(true);
        setLoading(false);
      });
  }, [range]);

  const gradientId = "equityCurveGradient";

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: "#0b1222",
        borderColor: "#2e3447",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color: "#dce1fb" }}
        >
          Equity Curve
        </h3>

        {/* Range pills */}
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors"
              style={
                range === r
                  ? { background: "#4edea3", color: "#003824" }
                  : { background: "transparent", color: "#909097" }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      {loading ? (
        <div
          className="h-[180px] rounded-lg animate-pulse"
          style={{ background: "#1a2235" }}
        />
      ) : error || history.length === 0 ? (
        <div
          className="h-[180px] flex items-center justify-center text-sm"
          style={{ color: "#909097" }}
        >
          Snapshot history will appear after the first daily snapshot
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={history}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4edea3" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4edea3" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2e3447"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(val) => formatXAxisDate(val, range)}
              tick={{ fill: "#909097", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />

            <YAxis
              tickFormatter={abbreviateDollar}
              tick={{ fill: "#909097", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4edea3"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: "#4edea3", stroke: "#0b1222", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
