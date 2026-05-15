"use client";

import { useEffect, useRef, useState } from "react";

export interface AiAssistantPanelProps {
  symbol: string;
  price: string | null;
  change24h: string | null;
  volume: string | null;
  tradeContext?: {
    side: "BUY" | "SELL";
    orderType: "MARKET" | "LIMIT";
    amount: string;
    usdtBalance: number;
    coinBalance: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "summarize" | "risk" | "chart";

const TABS: { key: Tab; label: string }[] = [
  { key: "summarize", label: "Summarize" },
  { key: "risk", label: "Risk Score" },
  { key: "chart", label: "Chart Insight" },
];

function getRiskBadge(text: string): { label: string; color: string; bg: string } | null {
  const first = text.trim().split(/[\s\n]/)[0].toUpperCase();
  if (first === "LOW")
    return { label: "LOW", color: "#4edea3", bg: "rgba(78,222,163,0.12)" };
  if (first === "MEDIUM" || first === "MED")
    return { label: "MEDIUM", color: "#f5c842", bg: "rgba(245,200,66,0.12)" };
  if (first === "HIGH")
    return { label: "HIGH", color: "#ffb3ad", bg: "rgba(255,179,173,0.12)" };
  return null;
}

export default function AiAssistantPanel({
  symbol,
  price,
  change24h,
  volume,
  tradeContext,
  isOpen,
  onClose,
}: AiAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("summarize");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom as tokens stream in
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [text]);

  // Run query whenever the panel opens or the tab changes
  useEffect(() => {
    if (!isOpen) return;
    runQuery(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab]);

  // Abort in-flight request when panel closes
  useEffect(() => {
    if (!isOpen && abortRef.current) {
      abortRef.current.abort();
    }
  }, [isOpen]);

  async function runQuery(tab: Tab) {
    // Abort any previous stream
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText("");
    setError(null);
    setLoading(true);

    try {
      let type: string;
      let context: Record<string, unknown>;

      if (tab === "summarize") {
        type = "coin_summary";
        context = { symbol, price, change24h, volume };
      } else if (tab === "risk") {
        if (!tradeContext) {
          setText("");
          setLoading(false);
          return;
        }
        type = "risk_score";
        context = { symbol, price, change24h, volume, trade: tradeContext };
      } else {
        // chart insight — fetch candles first
        type = "chart_pattern";
        let candles: unknown[] = [];
        try {
          const candleRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/market/candles?symbol=${symbol}&interval=1h&limit=20`,
            { credentials: "include", signal: controller.signal }
          );
          if (candleRes.ok) {
            candles = await candleRes.json();
          }
        } catch {
          // candles optional — proceed without them
        }
        context = { symbol, price, change24h, volume, candles };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ai/assist`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, context }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error((errJson as { error?: string }).error ?? `Server error ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setText(accumulated);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleTabClick(tab: Tab) {
    if (tab === activeTab) {
      // Re-run the same tab
      runQuery(tab);
      return;
    }
    setActiveTab(tab);
    // useEffect will fire runQuery via dependency change
  }

  const riskBadge = activeTab === "risk" && text ? getRiskBadge(text) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          background: "rgba(7,13,31,0.6)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "300px",
          maxWidth: "100vw",
          zIndex: 50,
          background: "#0b1222",
          borderLeft: "1px solid #2e3447",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid #2e3447",
            background: "#0b1222",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                color: "#4edea3",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              ✦
            </span>
            <span
              style={{
                color: "#dce1fb",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              AI Assistant
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#909097",
              fontSize: "16px",
              lineHeight: 1,
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close AI assistant"
          >
            ×
          </button>
        </div>

        {/* Symbol context strip */}
        <div
          style={{
            padding: "6px 16px",
            borderBottom: "1px solid #2e3447",
            background: "#191f31",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 900,
              color: "#dce1fb",
              fontFamily: "monospace",
            }}
          >
            {symbol.replace("USDT", "")}/USDT
          </span>
          {price && (
            <span
              style={{
                fontSize: "10px",
                color: "#4edea3",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              ${parseFloat(price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
          )}
          {change24h && (
            <span
              style={{
                fontSize: "9px",
                fontFamily: "monospace",
                color: parseFloat(change24h) >= 0 ? "#4edea3" : "#ffb3ad",
              }}
            >
              {parseFloat(change24h) >= 0 ? "+" : ""}
              {parseFloat(change24h).toFixed(2)}%
            </span>
          )}
        </div>

        {/* Tab row */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #2e3447",
            background: "#0b1222",
            flexShrink: 0,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDisabled = tab.key === "risk" && !tradeContext;
            return (
              <button
                key={tab.key}
                onClick={() => !isDisabled && handleTabClick(tab.key)}
                disabled={isDisabled}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  border: "none",
                  borderBottom: isActive
                    ? "2px solid #4edea3"
                    : "2px solid transparent",
                  background: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  color: isDisabled
                    ? "#45464d"
                    : isActive
                    ? "#4edea3"
                    : "#909097",
                  transition: "color 0.15s, border-color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Output area */}
        <div
          ref={outputRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Risk score badge */}
          {riskBadge && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                background: riskBadge.bg,
                border: `1px solid ${riskBadge.color}40`,
                alignSelf: "flex-start",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: riskBadge.color,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: riskBadge.color,
                  fontFamily: "monospace",
                }}
              >
                {riskBadge.label} RISK
              </span>
            </div>
          )}

          {/* No trade context message for Risk tab */}
          {activeTab === "risk" && !tradeContext && (
            <p
              style={{
                fontSize: "11px",
                color: "#909097",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Fill in the trade form first to get a risk score.
            </p>
          )}

          {/* Loading state */}
          {loading && !text && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#909097",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  animation: "aiPulse 1.4s ease-in-out infinite",
                }}
              >
                Thinking...
              </span>
            </div>
          )}

          {/* Streamed text */}
          {text && (
            <div
              style={{
                fontSize: "11px",
                color: "#dce1fb",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {text}
              {loading && (
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "12px",
                    background: "#4edea3",
                    marginLeft: "2px",
                    verticalAlign: "text-bottom",
                    animation: "aiCursor 1s step-end infinite",
                  }}
                />
              )}
            </div>
          )}

          {/* Error state */}
          {error && (
            <p
              style={{
                fontSize: "11px",
                color: "#ffb3ad",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer — retry button */}
        {!loading && (text || error) && (
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid #2e3447",
              flexShrink: 0,
              background: "#0b1222",
            }}
          >
            <button
              onClick={() => runQuery(activeTab)}
              style={{
                width: "100%",
                padding: "7px",
                fontSize: "9px",
                fontWeight: 900,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                border: "1px solid rgba(78,222,163,0.25)",
                background: "rgba(78,222,163,0.07)",
                color: "#4edea3",
                cursor: "pointer",
              }}
            >
              ↺ Regenerate
            </button>
          </div>
        )}
      </div>

      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes aiCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
