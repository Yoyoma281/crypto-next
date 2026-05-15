"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const STRATEGIES = [
  {
    id: "dca-btc",
    name: "DCA into BTC",
    description: "Buy $50 of Bitcoin every week regardless of price. Reduces timing risk.",
    symbol: "BTCUSDT",
    type: "BUY" as const,
    amountUsdt: 50,
    tags: ["Beginner", "Long-term"],
    icon: "📅",
    tips: [
      "Dollar-cost averaging removes the stress of trying to time the perfect entry.",
      "Consistent small purchases average out your cost basis over time.",
      "Best for investors with a long time horizon of 1+ years.",
    ],
  },
  {
    id: "buy-dip-eth",
    name: "Buy the 5% Dip",
    description: "Set a limit buy order 5% below current ETH price to catch dips.",
    symbol: "ETHUSDT",
    type: "BUY" as const,
    orderMode: "LIMIT",
    amountUsdt: 100,
    tags: ["Intermediate", "Limit Order"],
    icon: "📉",
    tips: [
      "Use limit orders instead of market orders to control your entry price.",
      "A 5% dip is common intraday on crypto — patience pays off.",
      "Always set a stop-loss 3–5% below your limit order to manage downside.",
    ],
  },
  {
    id: "momentum-sol",
    name: "Momentum Play",
    description: "Buy SOL when it breaks above recent highs; set a 3% take-profit.",
    symbol: "SOLUSDT",
    type: "BUY" as const,
    amountUsdt: 75,
    tags: ["Intermediate", "Active"],
    icon: "⚡",
    tips: [
      "Breakouts above resistance with high volume have the best follow-through.",
      "Set your take-profit immediately after entry — don't move it higher out of greed.",
      "Use the 1H chart to identify recent highs and confirm the breakout.",
    ],
  },
  {
    id: "safe-haven",
    name: "Safe Haven Rotation",
    description: "Sell 50% of your altcoins and move to BTC during high volatility.",
    symbol: "BTCUSDT",
    type: "BUY" as const,
    amountUsdt: 200,
    tags: ["Advanced", "Risk Management"],
    icon: "🛡️",
    tips: [
      "Bitcoin historically holds value better than altcoins during broad market sell-offs.",
      "Signs of high volatility: VIX spike, news-driven crashes, or 15%+ market-wide drops.",
      "Rotate back to altcoins once the market stabilizes for potential higher upside.",
    ],
  },
];

const TAG_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Beginner: { color: "#4edea3", bg: "rgba(78,222,163,0.1)", border: "rgba(78,222,163,0.25)" },
  Intermediate: { color: "#8ccdff", bg: "rgba(140,205,255,0.1)", border: "rgba(140,205,255,0.25)" },
  Advanced: { color: "#f5c842", bg: "rgba(245,200,66,0.1)", border: "rgba(245,200,66,0.25)" },
  "Long-term": { color: "#909097", bg: "rgba(144,144,151,0.1)", border: "rgba(144,144,151,0.2)" },
  "Limit Order": { color: "#8ccdff", bg: "rgba(140,205,255,0.08)", border: "rgba(140,205,255,0.2)" },
  Active: { color: "#f5c842", bg: "rgba(245,200,66,0.08)", border: "rgba(245,200,66,0.2)" },
  "Risk Management": { color: "#ffb3ad", bg: "rgba(255,179,173,0.1)", border: "rgba(255,179,173,0.2)" },
};

function TagPill({ tag }: { tag: string }) {
  const style = TAG_COLORS[tag] ?? { color: "#909097", bg: "rgba(144,144,151,0.1)", border: "rgba(144,144,151,0.2)" };
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: "99px",
        padding: "2px 8px",
      }}
    >
      {tag}
    </span>
  );
}

function StrategyCard({ strategy }: { strategy: typeof STRATEGIES[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "#191f31",
        border: "1px solid #2e3447",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(140,205,255,0.08)",
              border: "1px solid #2e3447",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
            }}
          >
            {strategy.icon}
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#dce1fb" }}>{strategy.name}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
              {strategy.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(78,222,163,0.1)",
            border: "1px solid rgba(78,222,163,0.25)",
            borderRadius: "8px",
            padding: "4px 10px",
            fontSize: "11px",
            fontWeight: "700",
            color: "#4edea3",
            flexShrink: 0,
          }}
        >
          ${strategy.amountUsdt}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: "13px", color: "#909097", lineHeight: "1.6", margin: 0 }}>
        {strategy.description}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link
          href={`/Exchange/${strategy.symbol}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #8ccdff, #004e7c)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          Apply Strategy
          <ExternalLink size={13} />
        </Link>

        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "rgba(220,225,251,0.05)",
            border: "1px solid #2e3447",
            color: "#909097",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Learn more
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expandable tips */}
      {expanded && (
        <div
          style={{
            background: "rgba(140,205,255,0.05)",
            border: "1px solid rgba(140,205,255,0.15)",
            borderRadius: "10px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {strategy.tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ color: "#8ccdff", fontSize: "13px", marginTop: "1px", flexShrink: 0 }}>•</span>
              <span style={{ fontSize: "12px", color: "#dce1fb", lineHeight: "1.6" }}>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StrategiesPage() {
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 16px 60px", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Back */}
      <Link
        href="/learn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "#909097",
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={13} /> Back to Learn
      </Link>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "rgba(245,200,66,0.1)",
              border: "1px solid rgba(245,200,66,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Target size={20} style={{ color: "#f5c842" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#dce1fb", margin: 0 }}>
              Strategy Templates
            </h1>
            <p style={{ fontSize: "13px", color: "#909097", margin: "3px 0 0" }}>
              Ready-made trading strategies — pick one and apply it instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: "16px",
        }}
      >
        {STRATEGIES.map((s) => (
          <StrategyCard key={s.id} strategy={s} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "28px 32px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(140,205,255,0.06) 0%, rgba(66,224,154,0.06) 100%)",
          border: "1px solid rgba(140,205,255,0.2)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#dce1fb", margin: "0 0 4px" }}>
            Not sure which strategy suits you?
          </h2>
          <p style={{ fontSize: "13px", color: "#909097", margin: 0, lineHeight: "1.5" }}>
            Read the Risk Management guide to understand position sizing and stop-losses before applying any strategy.
          </p>
        </div>
        <Link
          href="/learn/risk-management"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 18px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #8ccdff, #004e7c)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
            textDecoration: "none",
            alignSelf: "flex-start",
          }}
        >
          Read Risk Management <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
