"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  BarChart2,
  ShieldAlert,
  Loader2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────────────
const BG = "#0a0a0f";
const CARD = "#12121a";
const BORDER = "rgba(255,255,255,0.07)";
const GREEN = "#4edea3";
const BUY = "#00d4aa";
const MUTED = "#909097";
const TEXT = "#e8e8f0";
const TEXT_DIM = "#c2c2cc";

// ── Confetti dot component ─────────────────────────────────────────────────
interface ConfettiDot {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  life: number;
}

function useConfetti(active: boolean) {
  const [dots, setDots] = useState<ConfettiDot[]>([]);

  useEffect(() => {
    if (!active) return;
    const colors = [GREEN, BUY, "#ffd700", "#ff6b9d", "#8ccdff", "#c084fc"];
    const initial: ConfettiDot[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 5 + 2),
      life: 1,
    }));
    setDots(initial);

    const interval = setInterval(() => {
      setDots((prev) =>
        prev
          .map((d) => ({
            ...d,
            x: d.x + d.vx,
            y: d.y + d.vy,
            vy: d.vy + 0.25,
            life: d.life - 0.03,
          }))
          .filter((d) => d.life > 0)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [active]);

  return dots;
}

// ── Progress indicator ─────────────────────────────────────────────────────
function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "2rem",
      }}
    >
      <span style={{ fontSize: "0.75rem", color: MUTED, fontWeight: 500 }}>
        Step {current} of {total}
      </span>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;
          return (
            <div
              key={stepNum}
              style={{
                width: isActive ? 28 : isDone ? 22 : 10,
                height: 10,
                borderRadius: 5,
                background: isDone
                  ? GREEN
                  : isActive
                  ? GREEN
                  : "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: isActive ? `0 0 8px ${GREEN}60` : "none",
              }}
            >
              {isDone && (
                <CheckCircle2
                  style={{ width: 7, height: 7, color: "#0a0a0f" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Nav buttons ────────────────────────────────────────────────────────────
function NavButtons({
  step,
  totalSteps,
  onNext,
  onBack,
  nextDisabled,
  nextLabel,
}: {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: step === 1 ? "flex-end" : "space-between",
        alignItems: "center",
        marginTop: "2rem",
        gap: "0.75rem",
      }}
    >
      {step > 1 && (
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.6rem 1.2rem",
            borderRadius: 10,
            border: `1px solid ${BORDER}`,
            background: "transparent",
            color: MUTED,
            fontSize: "0.87rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            e.currentTarget.style.color = TEXT;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = BORDER;
            e.currentTarget.style.color = MUTED;
          }}
        >
          <ChevronLeft style={{ width: 15, height: 15 }} />
          Back
        </button>
      )}
      {step < totalSteps && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.6rem 1.5rem",
            borderRadius: 10,
            border: "none",
            background: nextDisabled
              ? "rgba(78,222,163,0.2)"
              : `linear-gradient(135deg, ${GREEN}, #2fc98e)`,
            color: nextDisabled ? "rgba(78,222,163,0.45)" : "#071a11",
            fontSize: "0.87rem",
            fontWeight: 700,
            cursor: nextDisabled ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: nextDisabled ? "none" : `0 4px 14px ${GREEN}40`,
          }}
        >
          {nextLabel ?? "Next"}
          <ChevronRight style={{ width: 15, height: 15 }} />
        </button>
      )}
    </div>
  );
}

// ── Step 1: Welcome ────────────────────────────────────────────────────────
function StepWelcome() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "1.25rem",
          paddingBottom: "1rem",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(78,222,163,0.18) 0%, rgba(78,222,163,0.05) 70%)`,
            border: `2px solid ${GREEN}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GraduationCap
            style={{ width: 34, height: 34, color: GREEN }}
          />
        </div>
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: TEXT,
              margin: "0 0 0.5rem",
            }}
          >
            Welcome to CrySer!
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: TEXT_DIM,
              lineHeight: 1.65,
              maxWidth: 460,
              margin: "0 auto",
            }}
          >
            Let&apos;s learn to trade. This 5-step tutorial will walk you
            through everything you need to place your first trade — safely,
            with no real money at risk.
          </p>
        </div>

        {/* Balance card */}
        <div
          style={{
            background: `linear-gradient(135deg, rgba(78,222,163,0.1), rgba(0,212,170,0.06))`,
            border: `1px solid rgba(78,222,163,0.25)`,
            borderRadius: 14,
            padding: "1.1rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            width: "100%",
            maxWidth: 300,
          }}
        >
          <span style={{ fontSize: "0.72rem", color: MUTED, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your Starting Balance
          </span>
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              color: GREEN,
              letterSpacing: "-0.02em",
            }}
          >
            $1,000
          </span>
          <span style={{ fontSize: "0.78rem", color: MUTED }}>
            Virtual USDT — risk-free
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.6rem",
            width: "100%",
          }}
        >
          {[
            { icon: "📈", label: "Live prices" },
            { icon: "🛡️", label: "Zero risk" },
            { icon: "🏆", label: "Real rankings" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "0.7rem 0.5rem",
                textAlign: "center",
                fontSize: "0.75rem",
                color: MUTED,
              }}
            >
              <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                {icon}
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Reading the Market ─────────────────────────────────────────────
function StepMarket() {
  const [highlight, setHighlight] = useState<"price" | "change" | "volume" | null>(null);

  const callouts = [
    {
      id: "price" as const,
      label: "Price",
      desc: "The current market price in USDT. This updates in real-time as trades happen.",
      color: TEXT,
    },
    {
      id: "change" as const,
      label: "24h Change",
      desc: "How much the price has moved in the last 24 hours, as a percentage.",
      color: BUY,
    },
    {
      id: "volume" as const,
      label: "Volume",
      desc: "Total USDT traded in 24 hours. Higher volume = more liquidity and reliable prices.",
      color: "#8ccdff",
    },
  ];

  return (
    <div>
      <h2
        style={{
          fontSize: "1.35rem",
          fontWeight: 800,
          color: TEXT,
          marginBottom: "0.4rem",
        }}
      >
        Reading the Market
      </h2>
      <p style={{ color: MUTED, fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Every coin shows key stats at a glance. Hover each callout below to learn what it means.
      </p>

      {/* Mock ticker card */}
      <div
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: "1.25rem 1.5rem",
          marginBottom: "1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* subtle glow behind */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(78,222,163,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f7931a, #e8820c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "0.8rem",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            BTC
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>
              Bitcoin
            </div>
            <div style={{ fontSize: "0.72rem", color: MUTED }}>BTC / USDT</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "flex-end" }}>
          {/* Price */}
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              padding: "0.4rem 0.6rem",
              borderRadius: 8,
              border: `1px solid ${highlight === "price" ? `${GREEN}60` : "transparent"}`,
              background: highlight === "price" ? `rgba(78,222,163,0.07)` : "transparent",
              transition: "all 0.2s",
            }}
            onMouseEnter={() => setHighlight("price")}
            onMouseLeave={() => setHighlight(null)}
          >
            {highlight === "price" && (
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: 9,
                  border: `2px solid ${GREEN}`,
                  animation: "pulse-ring 1.2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={{ fontSize: "0.65rem", color: MUTED, marginBottom: 2, fontWeight: 500 }}>
              PRICE
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}>
              $43,250.00
            </div>
          </div>

          {/* Change */}
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              padding: "0.4rem 0.6rem",
              borderRadius: 8,
              border: `1px solid ${highlight === "change" ? `${BUY}60` : "transparent"}`,
              background: highlight === "change" ? `rgba(0,212,170,0.07)` : "transparent",
              transition: "all 0.2s",
            }}
            onMouseEnter={() => setHighlight("change")}
            onMouseLeave={() => setHighlight(null)}
          >
            {highlight === "change" && (
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: 9,
                  border: `2px solid ${BUY}`,
                  animation: "pulse-ring 1.2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={{ fontSize: "0.65rem", color: MUTED, marginBottom: 2, fontWeight: 500 }}>
              24H CHANGE
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: BUY }}>
              +2.4%
            </div>
          </div>

          {/* Volume */}
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              padding: "0.4rem 0.6rem",
              borderRadius: 8,
              border: `1px solid ${highlight === "volume" ? "rgba(140,205,255,0.5)" : "transparent"}`,
              background: highlight === "volume" ? `rgba(140,205,255,0.07)` : "transparent",
              transition: "all 0.2s",
            }}
            onMouseEnter={() => setHighlight("volume")}
            onMouseLeave={() => setHighlight(null)}
          >
            {highlight === "volume" && (
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: 9,
                  border: `2px solid #8ccdff`,
                  animation: "pulse-ring 1.2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={{ fontSize: "0.65rem", color: MUTED, marginBottom: 2, fontWeight: 500 }}>
              24H VOLUME
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#8ccdff" }}>
              $1.24B
            </div>
          </div>
        </div>
      </div>

      {/* Callout legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {callouts.map((c) => (
          <div
            key={c.id}
            onMouseEnter={() => setHighlight(c.id)}
            onMouseLeave={() => setHighlight(null)}
            style={{
              background: highlight === c.id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${highlight === c.id ? "rgba(255,255,255,0.12)" : BORDER}`,
              borderRadius: 10,
              padding: "0.65rem 0.9rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.7rem",
              cursor: "default",
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c.color,
                marginTop: 5,
                flexShrink: 0,
                boxShadow: highlight === c.id ? `0 0 6px ${c.color}` : "none",
                transition: "box-shadow 0.2s",
              }}
            />
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: TEXT }}>
                {c.label}
              </span>
              <span style={{ fontSize: "0.8rem", color: MUTED, marginLeft: "0.5rem" }}>
                {c.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 3: Order Types ────────────────────────────────────────────────────
function StepOrderTypes({ onAllVisited }: { onAllVisited: () => void }) {
  const [active, setActive] = useState<"market" | "limit" | "stop">("market");
  const [visited, setVisited] = useState<Set<string>>(new Set(["market"]));

  const tabs = [
    {
      id: "market" as const,
      label: "Market",
      icon: TrendingUp,
      color: GREEN,
      title: "Market Order",
      when: "Use it when you want to buy or sell immediately at the best available price.",
      desc: "A market order executes instantly at the current price. It guarantees execution but not the exact price — in fast markets there can be slight slippage. Best for high-liquidity coins like BTC and ETH.",
      example: "\"Buy 0.01 BTC right now, whatever the price is.\"",
    },
    {
      id: "limit" as const,
      label: "Limit",
      icon: BarChart2,
      color: "#8ccdff",
      title: "Limit Order",
      when: "Use it when you want to set your own price and are patient enough to wait.",
      desc: "A limit order only fills at your specified price or better. It gives you price control but may never execute if the market doesn't reach your level. Common strategy: set a limit buy below current price to 'catch a dip'.",
      example: "\"Buy BTC only if it drops to $42,000.\"",
    },
    {
      id: "stop" as const,
      label: "Stop-Loss",
      icon: ShieldAlert,
      color: "#ff6b9d",
      title: "Stop-Loss Order",
      when: "Use it to protect yourself from large losses on an open position.",
      desc: "A stop-loss automatically sells your position when the price falls to a trigger level. It removes emotion from bad situations — you set your maximum acceptable loss in advance and let the system handle it.",
      example: "\"If BTC drops below $40,000, sell everything.\"",
    },
  ];

  const handleTab = useCallback(
    (id: "market" | "limit" | "stop") => {
      setActive(id);
      setVisited((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (next.size === 3) onAllVisited();
        return next;
      });
    },
    [onAllVisited]
  );

  const current = tabs.find((t) => t.id === active)!;
  const CurrentIcon = current.icon;

  return (
    <div>
      <h2
        style={{
          fontSize: "1.35rem",
          fontWeight: 800,
          color: TEXT,
          marginBottom: "0.4rem",
        }}
      >
        Order Types
      </h2>
      <p style={{ color: MUTED, fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
        Click each tab to learn when and why to use it. You must visit all three to continue.
      </p>

      {/* Tab strip */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "0.3rem",
          marginBottom: "1.25rem",
          border: `1px solid ${BORDER}`,
        }}
      >
        {tabs.map((t) => {
          const isVisited = visited.has(t.id);
          const isActive = active === t.id;
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleTab(t.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.6rem 0.5rem",
                borderRadius: 9,
                border: "none",
                background: isActive ? `rgba(${t.id === "market" ? "78,222,163" : t.id === "limit" ? "140,205,255" : "255,107,157"},0.12)` : "transparent",
                color: isActive ? t.color : isVisited ? `${t.color}90` : MUTED,
                fontSize: "0.8rem",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              <TabIcon style={{ width: 14, height: 14 }} />
              {t.label}
              {isVisited && !isActive && (
                <CheckCircle2
                  style={{
                    width: 10,
                    height: 10,
                    color: t.color,
                    opacity: 0.7,
                    position: "absolute",
                    top: 3,
                    right: 4,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div
        style={{
          background: CARD,
          border: `1px solid rgba(255,255,255,0.09)`,
          borderRadius: 14,
          padding: "1.25rem 1.4rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `rgba(${active === "market" ? "78,222,163" : active === "limit" ? "140,205,255" : "255,107,157"},0.12)`,
              border: `1px solid ${current.color}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CurrentIcon style={{ width: 16, height: 16, color: current.color }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: TEXT }}>
            {current.title}
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: TEXT_DIM, lineHeight: 1.7, margin: 0 }}>
          {current.desc}
        </p>
        <div
          style={{
            background: `rgba(${active === "market" ? "78,222,163" : active === "limit" ? "140,205,255" : "255,107,157"},0.06)`,
            border: `1px solid ${current.color}25`,
            borderRadius: 9,
            padding: "0.65rem 0.9rem",
          }}
        >
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: current.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            When to use
          </span>
          <p style={{ fontSize: "0.82rem", color: TEXT_DIM, margin: "0.25rem 0 0", lineHeight: 1.6 }}>
            {current.when}
          </p>
        </div>
        <div
          style={{
            fontSize: "0.82rem",
            color: MUTED,
            fontStyle: "italic",
            borderLeft: `3px solid ${current.color}40`,
            paddingLeft: "0.75rem",
          }}
        >
          {current.example}
        </div>
      </div>

      {/* Progress chips */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginTop: "1rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: MUTED, marginRight: "0.25rem" }}>
          Progress:
        </span>
        {tabs.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.2rem 0.55rem",
              borderRadius: 20,
              background: visited.has(t.id) ? `rgba(${t.id === "market" ? "78,222,163" : t.id === "limit" ? "140,205,255" : "255,107,157"},0.12)` : "rgba(255,255,255,0.04)",
              border: `1px solid ${visited.has(t.id) ? `${t.color}40` : BORDER}`,
              transition: "all 0.2s",
            }}
          >
            {visited.has(t.id) ? (
              <CheckCircle2 style={{ width: 10, height: 10, color: t.color }} />
            ) : (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: MUTED }} />
            )}
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: visited.has(t.id) ? t.color : MUTED,
              }}
            >
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 4: Place Your First Trade ─────────────────────────────────────────
function StepTrade({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const MOCK_PRICE = 43250;
  const parsed = parseFloat(amount);
  const valid = !isNaN(parsed) && parsed >= 1 && parsed <= 100;
  const btcAmount = valid ? (parsed / MOCK_PRICE).toFixed(8) : null;

  const confettiDots = useConfetti(success);

  async function handleTrade() {
    if (!valid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 2200);
  }

  return (
    <div>
      <h2
        style={{
          fontSize: "1.35rem",
          fontWeight: 800,
          color: TEXT,
          marginBottom: "0.4rem",
        }}
      >
        Place Your First Trade
      </h2>
      <p style={{ color: MUTED, fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        This is a simulated order — no real money involved. Fill in an amount and hit the button.
      </p>

      {/* Order form */}
      <div
        style={{
          background: CARD,
          border: `1px solid rgba(255,255,255,0.09)`,
          borderRadius: 16,
          padding: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Confetti overlay */}
        {success && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {confettiDots.map((d) => (
              <div
                key={d.id}
                style={{
                  position: "absolute",
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  width: d.size,
                  height: d.size,
                  borderRadius: "50%",
                  background: d.color,
                  opacity: d.life,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        )}

        {/* Success overlay */}
        {success && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,10,15,0.88)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              zIndex: 5,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(78,222,163,0.15)",
                border: `2px solid ${GREEN}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <CheckCircle2 style={{ width: 32, height: 32, color: GREEN }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: TEXT, marginBottom: "0.25rem" }}>
                Trade Placed!
              </div>
              <div style={{ fontSize: "0.82rem", color: MUTED }}>
                Moving to the next step...
              </div>
            </div>
          </div>
        )}

        {/* Pair + type header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f7931a, #e8820c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.62rem",
                fontWeight: 900,
                color: "#fff",
              }}
            >
              BTC
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}>
              BTC / USDT
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <span
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: 6,
                background: "rgba(78,222,163,0.12)",
                border: `1px solid ${GREEN}40`,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: GREEN,
              }}
            >
              MARKET
            </span>
            <span
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: 6,
                background: "rgba(0,212,170,0.12)",
                border: `1px solid ${BUY}40`,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: BUY,
              }}
            >
              BUY
            </span>
          </div>
        </div>

        {/* Amount field */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: MUTED,
              marginBottom: "0.4rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Amount (USDT)
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              min={1}
              max={100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter 1–100"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${valid && amount ? `${GREEN}60` : BORDER}`,
                borderRadius: 10,
                padding: "0.75rem 3.5rem 0.75rem 0.9rem",
                fontSize: "1rem",
                fontWeight: 600,
                color: TEXT,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = `${GREEN}80`)
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  valid && amount ? `${GREEN}60` : BORDER)
              }
            />
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: MUTED,
              }}
            >
              USDT
            </span>
          </div>
          {amount && !valid && (
            <p style={{ fontSize: "0.75rem", color: "#ff6b9d", marginTop: "0.3rem" }}>
              Please enter an amount between 1 and 100 USDT.
            </p>
          )}
        </div>

        {/* Preview */}
        {btcAmount && (
          <div
            style={{
              background: "rgba(78,222,163,0.06)",
              border: `1px solid rgba(78,222,163,0.2)`,
              borderRadius: 10,
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.82rem", color: MUTED }}>
              You&apos;ll receive ~
            </span>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1rem",
                  color: GREEN,
                }}
              >
                {btcAmount} BTC
              </span>
              <div style={{ fontSize: "0.7rem", color: MUTED }}>
                at $43,250.00
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleTrade}
          disabled={!valid || loading || success}
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: 11,
            border: "none",
            background:
              !valid || loading
                ? "rgba(0,212,170,0.2)"
                : `linear-gradient(135deg, ${BUY}, #00b896)`,
            color: !valid || loading ? `${BUY}60` : "#041a14",
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: !valid || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
            boxShadow: valid && !loading ? `0 4px 16px ${BUY}35` : "none",
          }}
        >
          {loading ? (
            <>
              <Loader2
                style={{
                  width: 16,
                  height: 16,
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Processing...
            </>
          ) : (
            "Place Trade"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Step 5: You're Ready ───────────────────────────────────────────────────
function StepReady() {
  const tips = [
    {
      icon: "🎯",
      title: "Start small",
      desc: "Trade $10–$50 at first. Get comfortable with the interface before going bigger.",
    },
    {
      icon: "🛡️",
      title: "Always set a Stop-Loss",
      desc: "Decide your maximum loss before entering a trade. This one habit separates pros from gamblers.",
    },
    {
      icon: "📊",
      title: "Check the leaderboard",
      desc: "See what strategies top traders use. Studying winners accelerates your learning.",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "1.25rem",
          marginBottom: "1.75rem",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(78,222,163,0.2) 0%, rgba(78,222,163,0.04) 70%)",
            border: `2px solid ${GREEN}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          🏆
        </div>
        <div>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 900,
              color: TEXT,
              margin: "0 0 0.5rem",
            }}
          >
            You&apos;re Ready!
          </h2>
          <p style={{ color: TEXT_DIM, fontSize: "0.92rem", lineHeight: 1.65, maxWidth: 420, margin: "0 auto" }}>
            Your sandbox trade was a success! You now have{" "}
            <span style={{ color: GREEN, fontWeight: 700 }}>$1,000 real VUSDT</span>{" "}
            to trade with live prices.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        {tips.map((tip) => (
          <div
            key={tip.title}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "0.9rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.85rem",
            }}
          >
            <span style={{ fontSize: "1.2rem", marginTop: "0.05rem", flexShrink: 0 }}>
              {tip.icon}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: TEXT, marginBottom: "0.2rem" }}>
                {tip.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: MUTED, lineHeight: 1.6 }}>
                {tip.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/Exchange/BTC_USDT"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.9rem",
          borderRadius: 12,
          background: `linear-gradient(135deg, ${GREEN}, #2fc98e)`,
          color: "#071a11",
          fontSize: "0.97rem",
          fontWeight: 800,
          textDecoration: "none",
          boxShadow: `0 4px 20px ${GREEN}45`,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Start Trading
        <ArrowRight style={{ width: 16, height: 16 }} />
      </Link>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TutorialPage() {
  const [step, setStep] = useState(1);
  const [allTabsVisited, setAllTabsVisited] = useState(false);
  const TOTAL_STEPS = 5;

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }
  function handleTradeSuccess() {
    setStep(5);
  }

  const isNextDisabled = step === 3 && !allTabsVisited;

  return (
    <>
      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes pulse-ring {
          0%   { opacity: 0.8; transform: scale(1); }
          50%  { opacity: 0.4; transform: scale(1.04); }
          100% { opacity: 0.8; transform: scale(1); }
        }
        @keyframes pop-in {
          0%   { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2.5rem 1.25rem 4rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: 600 }}>
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {/* Step card */}
          <div
            key={step}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: "1.75rem 1.75rem",
              animation: "fade-in 0.3s ease",
            }}
          >
            {step === 1 && <StepWelcome />}
            {step === 2 && <StepMarket />}
            {step === 3 && (
              <StepOrderTypes onAllVisited={() => setAllTabsVisited(true)} />
            )}
            {step === 4 && <StepTrade onSuccess={handleTradeSuccess} />}
            {step === 5 && <StepReady />}

            {step !== 4 && step !== 5 && (
              <NavButtons
                step={step}
                totalSteps={TOTAL_STEPS}
                onNext={next}
                onBack={back}
                nextDisabled={isNextDisabled}
                nextLabel={
                  isNextDisabled
                    ? "Visit all tabs first"
                    : step === 3
                    ? "Continue"
                    : "Next"
                }
              />
            )}
            {step === 4 && (
              <NavButtons
                step={step}
                totalSteps={TOTAL_STEPS}
                onNext={next}
                onBack={back}
                nextDisabled={true}
                nextLabel="Place the trade above"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
