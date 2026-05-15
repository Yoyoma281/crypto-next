"use client";

import { useEffect, useState } from "react";

interface RiskAnalytics {
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number | null;
  maxDrawdown: number;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  totalTrades: number;
  totalPnl: number;
}

const CARD_STYLE: React.CSSProperties = {
  background: "#12121a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: 24,
};

const GREEN = "#00d4aa";
const RED = "#ef4444";
const NEUTRAL = "#dce1fb";
const LABEL = "#45464d";

function fmt(value: number | null, suffix = ""): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(2) + suffix;
}

function fmtUSD(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return (
    "$" +
    Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtPnl(value: number | null): string {
  if (value === null || value === undefined) return "—";
  const abs =
    "$" +
    Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return (value >= 0 ? "+" : "-") + abs;
}

interface MetricCellProps {
  label: string;
  value: string;
  color: string;
}

function MetricCell({ label, value, color }: MetricCellProps) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 700,
          color: LABEL,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 20,
          fontWeight: 800,
          color,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 140,
            height: 18,
            borderRadius: 6,
            background: "rgba(255,255,255,0.07)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 68,
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}

export default function RiskAnalyticsCard() {
  const [analytics, setAnalytics] = useState<RiskAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/portfolio/risk`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.analytics) {
          setAnalytics(data.analytics);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  if (!analytics || analytics.totalTrades === 0) {
    return (
      <div style={CARD_STYLE}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: NEUTRAL, margin: 0 }}>
            Risk Analytics
          </h3>
        </div>
        <p
          style={{
            fontSize: 13,
            color: LABEL,
            textAlign: "center",
            padding: "32px 0",
          }}
        >
          Place your first trade to see risk analytics.
        </p>
      </div>
    );
  }

  const sharpeColor =
    analytics.sharpeRatio === null
      ? NEUTRAL
      : analytics.sharpeRatio >= 1
        ? GREEN
        : RED;

  const sortinoColor =
    analytics.sortinoRatio === null
      ? NEUTRAL
      : analytics.sortinoRatio >= 1
        ? GREEN
        : RED;

  const pnlColor = analytics.totalPnl >= 0 ? GREEN : RED;

  return (
    <div style={CARD_STYLE}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: NEUTRAL, margin: 0 }}>
          Risk Analytics
        </h3>

        {/* Tooltip trigger */}
        <div style={{ position: "relative" }}>
          <button
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
            aria-label="Risk analytics info"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: LABEL,
              fontSize: 11,
              fontWeight: 700,
              cursor: "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ?
          </button>
          {tooltipVisible && (
            <div
              role="tooltip"
              style={{
                position: "absolute",
                top: 28,
                right: 0,
                width: 240,
                background: "#1c1c2a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 11.5,
                lineHeight: 1.6,
                color: "#a0a3b1",
                zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <strong style={{ color: NEUTRAL, display: "block", marginBottom: 6 }}>
                How to read these metrics
              </strong>
              <span style={{ color: GREEN, fontWeight: 600 }}>Sharpe &gt; 1</span> is good — higher means better risk-adjusted return.
              <br />
              <span style={{ color: RED, fontWeight: 600 }}>Max Drawdown</span> shows your worst peak-to-trough portfolio loss.
              <br />
              <span style={{ color: NEUTRAL, fontWeight: 600 }}>Win Rate</span> is the % of sells that were profitable.
            </div>
          )}
        </div>
      </div>

      {/* Top row: Win Rate, Avg Win, Avg Loss */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <MetricCell
          label="Win Rate"
          value={fmt(analytics.winRate, "%")}
          color={analytics.winRate >= 50 ? GREEN : RED}
        />
        <MetricCell
          label="Avg Win"
          value={fmtUSD(analytics.avgWin)}
          color={GREEN}
        />
        <MetricCell
          label="Avg Loss"
          value={fmtUSD(analytics.avgLoss)}
          color={RED}
        />
      </div>

      {/* Bottom row: Sharpe, Sortino, Max Drawdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <MetricCell
          label="Sharpe"
          value={fmt(analytics.sharpeRatio)}
          color={sharpeColor}
        />
        <MetricCell
          label="Sortino"
          value={fmt(analytics.sortinoRatio)}
          color={sortinoColor}
        />
        <MetricCell
          label="Max Drawdown"
          value={fmt(analytics.maxDrawdown, "%")}
          color={RED}
        />
      </div>

      {/* Footer strip */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: LABEL }}>Profit Factor:</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color:
              analytics.profitFactor === null
                ? NEUTRAL
                : analytics.profitFactor >= 1
                  ? GREEN
                  : RED,
            marginRight: 12,
          }}
        >
          {analytics.profitFactor === null ? "—" : analytics.profitFactor.toFixed(2)}
        </span>

        <span
          style={{
            width: 1,
            height: 14,
            background: "rgba(255,255,255,0.1)",
            flexShrink: 0,
            marginRight: 12,
          }}
        />

        <span style={{ fontSize: 12, color: LABEL }}>Total P&amp;L:</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: pnlColor,
            marginRight: 12,
          }}
        >
          {fmtPnl(analytics.totalPnl)}
        </span>

        <span
          style={{
            width: 1,
            height: 14,
            background: "rgba(255,255,255,0.1)",
            flexShrink: 0,
            marginRight: 12,
          }}
        />

        <span style={{ fontSize: 12, color: LABEL }}>Trades:</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: NEUTRAL }}>
          {analytics.totalTrades}
        </span>
      </div>
    </div>
  );
}
