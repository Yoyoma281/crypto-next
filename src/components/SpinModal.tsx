"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Zap } from "lucide-react";

interface SpinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Prize {
  label: string;
  subLabel: string;
  color: string;
  bg: string;
  glow: string;
}

const PRIZES: Prize[] = [
  { label: "$2 VUSDT",  subLabel: "+ 5 XP",   color: "#4edea3", bg: "rgba(78,222,163,0.12)",  glow: "rgba(78,222,163,0.4)"  },
  { label: "$5 VUSDT",  subLabel: "+ 10 XP",  color: "#4edea3", bg: "rgba(78,222,163,0.15)",  glow: "rgba(78,222,163,0.5)"  },
  { label: "$10 VUSDT", subLabel: "+ 20 XP",  color: "#f5c842", bg: "rgba(245,200,66,0.12)",  glow: "rgba(245,200,66,0.45)" },
  { label: "$20 VUSDT", subLabel: "+ 35 XP",  color: "#f5c842", bg: "rgba(245,200,66,0.15)",  glow: "rgba(245,200,66,0.55)" },
  { label: "$50 VUSDT", subLabel: "+ 75 XP",  color: "#ff9f43", bg: "rgba(255,159,67,0.15)",  glow: "rgba(255,159,67,0.55)" },
  { label: "+100 XP",   subLabel: "XP Boost", color: "#8ccdff", bg: "rgba(140,205,255,0.12)", glow: "rgba(140,205,255,0.4)" },
];

const BG = "#0b1222";
const PANEL = "#191f31";
const BORDER = "#2e3447";
const TEXT = "#dce1fb";
const MUTED = "#909097";
const GOLD = "#f5c842";

function msToCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function SpinModal({ isOpen, onClose }: SpinModalProps) {
  const [canSpin, setCanSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [winnerData, setWinnerData] = useState<{ label: string; xp?: number } | null>(null);
  const [msUntilReset, setMsUntilReset] = useState(0);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/spin/status", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCanSpin(!!data.canSpin);
        if (!data.canSpin && data.nextSpinAt) {
          const diff = new Date(data.nextSpinAt).getTime() - Date.now();
          setMsUntilReset(Math.max(0, diff));
        } else {
          // calculate ms until next UTC midnight
          const now = new Date();
          const midnight = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
          );
          setMsUntilReset(Math.max(0, midnight.getTime() - now.getTime()));
        }
      }
    } catch {
      // backend may not have spin yet — allow spinning optimistically
      setCanSpin(true);
    } finally {
      setStatusLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setWinnerIdx(null);
      setWinnerData(null);
      setFlashIdx(null);
      setShowSparkles(false);
    }
  }, [isOpen, loadStatus]);

  // Countdown timer
  useEffect(() => {
    if (!canSpin && msUntilReset > 0 && isOpen) {
      countdownRef.current = setInterval(() => {
        setMsUntilReset((prev) => {
          const next = prev - 1000;
          if (next <= 0) {
            clearInterval(countdownRef.current!);
            setCanSpin(true);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [canSpin, msUntilReset, isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  async function handleSpin() {
    if (!canSpin || spinning) return;
    setSpinning(true);
    setWinnerIdx(null);
    setWinnerData(null);
    setShowSparkles(false);

    // Start rapid flash animation
    let flashCount = 0;
    const totalFlashes = 20;
    flashTimerRef.current = setInterval(() => {
      setFlashIdx((prev) => {
        const next = ((prev ?? -1) + 1) % PRIZES.length;
        return next;
      });
      flashCount++;
      if (flashCount >= totalFlashes) {
        clearInterval(flashTimerRef.current!);
      }
    }, 80);

    // Wait a minimum 300ms, then call API
    const [apiRes] = await Promise.all([
      fetch("/api/spin", { method: "POST", credentials: "include" }),
      new Promise((r) => setTimeout(r, 300)),
    ]);

    clearInterval(flashTimerRef.current!);

    let resultIdx = Math.floor(Math.random() * PRIZES.length);
    let resultLabel = PRIZES[resultIdx].label;
    let resultXp: number | undefined;

    if (apiRes.ok) {
      try {
        const data = await apiRes.json();
        const prize = data.prize;
        if (prize && typeof prize === "object") {
          resultLabel = prize.label ?? resultLabel;
          resultXp = prize.xp;
        } else {
          resultLabel = prize ?? data.reward ?? data.label ?? resultLabel;
          resultXp = data.xp;
        }
        if (typeof data.slotIndex === "number") {
          resultIdx = data.slotIndex % PRIZES.length;
        } else {
          const match = PRIZES.findIndex((p) => p.label === resultLabel);
          if (match !== -1) resultIdx = match;
        }
      } catch {
        // use random
      }
    }

    // Slow deceleration flash to winner
    let slowCount = 0;
    const slowTotal = 8;
    let currentIdx = (flashIdx ?? 0) % PRIZES.length;
    const slowTimer = setInterval(() => {
      currentIdx = (currentIdx + 1) % PRIZES.length;
      setFlashIdx(currentIdx);
      slowCount++;
      if (slowCount >= slowTotal) {
        clearInterval(slowTimer);
        setFlashIdx(null);
        setWinnerIdx(resultIdx);
        setWinnerData({ label: resultLabel, xp: resultXp });
        setCanSpin(false);
        setSpinning(false);
        setShowSparkles(true);
        // Calculate next UTC midnight
        const now = new Date();
        const midnight = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
        );
        setMsUntilReset(Math.max(0, midnight.getTime() - now.getTime()));
      }
    }, 150);
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 24,
          padding: "2rem 1.75rem",
          width: "min(520px, 96vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          boxShadow: `0 0 60px rgba(245,200,66,0.08), 0 24px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Zap style={{ width: 20, height: 20, color: GOLD }} />
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: TEXT }}>
              Daily Spin
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: MUTED,
              padding: 4,
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Subtitle */}
        <p style={{ color: MUTED, fontSize: "0.82rem", margin: "-0.75rem 0 0", lineHeight: 1.5 }}>
          Spin once per day to win virtual USDT or XP boosts.
        </p>

        {/* Prize grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.625rem",
          }}
        >
          {PRIZES.map((prize, idx) => {
            const isFlashing = flashIdx === idx;
            const isWinner = winnerIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isWinner
                    ? prize.bg
                    : isFlashing
                    ? prize.bg
                    : "rgba(255,255,255,0.025)",
                  border: `2px solid ${
                    isWinner
                      ? prize.color
                      : isFlashing
                      ? `${prize.color}88`
                      : BORDER
                  }`,
                  borderRadius: 14,
                  padding: "1rem 0.75rem",
                  textAlign: "center",
                  transition: "all 0.1s",
                  boxShadow: isWinner
                    ? `0 0 20px ${prize.glow}, 0 0 40px ${prize.glow}60`
                    : isFlashing
                    ? `0 0 10px ${prize.glow}60`
                    : "none",
                  transform: isWinner ? "scale(1.03)" : "scale(1)",
                  position: "relative",
                }}
              >
                {isWinner && showSparkles && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      fontSize: "1.1rem",
                      animation: "spinStar 0.6s ease-out",
                    }}
                  >
                    ★
                  </span>
                )}
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: isWinner || isFlashing ? prize.color : TEXT,
                    transition: "color 0.1s",
                  }}
                >
                  {prize.label}
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: isWinner || isFlashing ? prize.color : MUTED,
                    marginTop: "0.2rem",
                    opacity: 0.85,
                  }}
                >
                  {prize.subLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Win banner */}
        {winnerData && (
          <div
            style={{
              background: `linear-gradient(135deg, rgba(245,200,66,0.12), rgba(78,222,163,0.08))`,
              border: `1px solid rgba(245,200,66,0.4)`,
              borderRadius: 14,
              padding: "1.25rem",
              textAlign: "center",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: MUTED, marginBottom: "0.4rem" }}>
              You won
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: GOLD,
                lineHeight: 1.2,
              }}
            >
              {winnerData.label}
              {winnerData.xp ? (
                <span style={{ color: "#8ccdff", fontSize: "1rem" }}>
                  {" "}+ {winnerData.xp} XP
                </span>
              ) : null}
            </div>
            <div style={{ fontSize: "0.75rem", color: MUTED, marginTop: "0.5rem" }}>
              Added to your account
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          {statusLoaded && canSpin ? (
            <button
              onClick={handleSpin}
              disabled={spinning}
              style={{
                width: "100%",
                padding: "0.95rem",
                borderRadius: 14,
                border: "none",
                cursor: spinning ? "not-allowed" : "pointer",
                fontWeight: 900,
                fontSize: "1.05rem",
                letterSpacing: "0.04em",
                background: spinning
                  ? "rgba(255,255,255,0.06)"
                  : `linear-gradient(135deg, ${GOLD} 0%, #c4960a 100%)`,
                color: spinning ? MUTED : "#0b1222",
                boxShadow: spinning ? "none" : `0 4px 20px rgba(245,200,66,0.35)`,
                transition: "all 0.2s",
              }}
            >
              {spinning ? "Spinning..." : "SPIN!"}
            </button>
          ) : statusLoaded ? (
            <div style={{ textAlign: "center", width: "100%" }}>
              <div
                style={{
                  background: PANEL,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "1rem",
                }}
              >
                <div style={{ color: MUTED, fontSize: "0.8rem", marginBottom: "0.4rem" }}>
                  Come back tomorrow
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: TEXT,
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {msToCountdown(msUntilReset)}
                </div>
                <div style={{ color: MUTED, fontSize: "0.7rem", marginTop: "0.3rem" }}>
                  until next spin resets
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: MUTED, fontSize: "0.85rem" }}>Loading...</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spinStar {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          60% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
