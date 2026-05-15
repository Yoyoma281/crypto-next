"use client";

import Link from "next/link";
import { Swords, Clock, TrendingDown, TrendingUp, ShieldAlert } from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const CARD = "#12121a";
const BORDER = "rgba(255,255,255,0.07)";
const MUTED = "#909097";
const TEXT = "#e8e8f0";
const TEXT_DIM = "#c2c2cc";

const DIFF_COLORS: Record<string, string> = {
  EASY: "#4edea3",
  MEDIUM: "#f59e0b",
  HARD: "#ef4444",
};

// ── Scenario definitions ───────────────────────────────────────────────────
export const SCENARIOS = [
  {
    id: "may-2021-crash",
    name: "May 2021 BTC Crash",
    description:
      "Navigate Bitcoin's 47% crash from $57k to $30k. Can you short it or escape in time?",
    symbol: "BTC_USDT",
    difficulty: "HARD" as const,
    dateRange: "May 2021",
    fromTs: 1619827200,
    toTs: 1622419200,
    interval: "4h",
    startingBalance: 10000,
    icon: TrendingDown,
    iconColor: "#ef4444",
  },
  {
    id: "eth-2021-rally",
    name: "ETH 2021 Bull Run",
    description:
      "Ride Ethereum's explosive rally from $1,800 to $4,000. Time your entries and exits.",
    symbol: "ETH_USDT",
    difficulty: "MEDIUM" as const,
    dateRange: "Apr – May 2021",
    fromTs: 1617235200,
    toTs: 1620259200,
    interval: "4h",
    startingBalance: 5000,
    icon: TrendingUp,
    iconColor: "#4edea3",
  },
  {
    id: "btc-2022-bear",
    name: "2022 Bear Market",
    description:
      "Survive Bitcoin's yearlong fall from $47k to $16k. Protect your capital.",
    symbol: "BTC_USDT",
    difficulty: "HARD" as const,
    dateRange: "Jan – Dec 2022",
    fromTs: 1641081600,
    toTs: 1672531200,
    interval: "1d",
    startingBalance: 10000,
    icon: ShieldAlert,
    iconColor: "#f59e0b",
  },
];

// ── Difficulty badge ───────────────────────────────────────────────────────
function DifficultyBadge({ level }: { level: string }) {
  const color = DIFF_COLORS[level] ?? MUTED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 6,
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      {level}
    </span>
  );
}

// ── Scenario card ──────────────────────────────────────────────────────────
function ScenarioCard({ scenario }: { scenario: (typeof SCENARIOS)[number] }) {
  const IconComponent = scenario.icon;
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(255,255,255,0.15)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = BORDER;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${scenario.iconColor}18`,
            border: `1px solid ${scenario.iconColor}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComponent
            style={{ width: 20, height: 20, color: scenario.iconColor }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1rem",
              color: TEXT,
              marginBottom: "0.2rem",
            }}
          >
            {scenario.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              flexWrap: "wrap",
            }}
          >
            <DifficultyBadge level={scenario.difficulty} />
            <span
              style={{
                fontSize: "11px",
                color: MUTED,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Clock style={{ width: 11, height: 11 }} />
              {scenario.dateRange}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: MUTED,
              }}
            >
              {scenario.symbol.replace("_", "/")}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "0.85rem",
          color: TEXT_DIM,
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {scenario.description}
      </p>

      {/* Footer: starting balance + CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "0.75rem",
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div>
          <span
            style={{
              fontSize: "10px",
              color: MUTED,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Starting Balance
          </span>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 900,
              color: "#4edea3",
              letterSpacing: "-0.01em",
            }}
          >
            ${scenario.startingBalance.toLocaleString()} VUSDT
          </div>
        </div>

        <Link
          href={`/scenarios/${scenario.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.6rem 1.2rem",
            borderRadius: 10,
            background: "linear-gradient(135deg, #4edea3, #2fc98e)",
            color: "#071a11",
            fontSize: "0.82rem",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 3px 12px rgba(78,222,163,0.3)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
          }
        >
          Start Scenario
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ScenariosPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        padding: "2rem 1.25rem 4rem",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            marginBottom: "0.6rem",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(78,222,163,0.12)",
              border: "1px solid rgba(78,222,163,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Swords style={{ width: 22, height: 22, color: "#4edea3" }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: TEXT,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Scenario Challenges
            </h1>
            <p
              style={{
                fontSize: "0.82rem",
                color: MUTED,
                margin: "2px 0 0",
              }}
            >
              Trade through famous historical crypto events with replayed candles
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div
          style={{
            background: "rgba(78,222,163,0.06)",
            border: "1px solid rgba(78,222,163,0.2)",
            borderRadius: 12,
            padding: "0.85rem 1.1rem",
            marginBottom: "1.75rem",
            marginTop: "1.25rem",
            fontSize: "0.82rem",
            color: TEXT_DIM,
            lineHeight: 1.6,
          }}
        >
          Each scenario gives you virtual USDT and replays historical candles one
          at a time. Buy, sell, and see how your decisions hold up against real
          market history. No live funds involved.
        </div>

        {/* Scenario cards */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
