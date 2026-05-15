"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  streakDayInCycle: number;
  claimedToday: boolean;
  onClaim: () => Promise<void>;
}

const REWARDS = [
  { day: 1, vusdt: 5,  xp: 10 },
  { day: 2, vusdt: 8,  xp: 15 },
  { day: 3, vusdt: 12, xp: 20 },
  { day: 4, vusdt: 16, xp: 25 },
  { day: 5, vusdt: 20, xp: 30 },
  { day: 6, vusdt: 25, xp: 35 },
  { day: 7, vusdt: 35, xp: 50 },
];

export default function StreakCalendarModal({
  isOpen,
  onClose,
  streak,
  streakDayInCycle,
  claimedToday,
  onClaim,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Reset success message when modal closes/reopens
  useEffect(() => {
    if (!isOpen) setSuccess(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const todayReward = REWARDS[streakDayInCycle - 1];
  const streakColor = streak >= 7 ? "#f5c842" : "#4edea3";

  async function handleClaim() {
    setLoading(true);
    try {
      await onClaim();
      setSuccess(true);
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  }

  function getDayState(day: number): "past" | "today" | "future" {
    if (day < streakDayInCycle) return "past";
    if (day === streakDayInCycle) return "today";
    return "future";
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        style={{
          background: "#0b1222",
          border: "1px solid #2e3447",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          color: "#dce1fb",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🔥</span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#dce1fb",
              }}
            >
              Daily Streak
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#909097",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Streak counter */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "42px",
              fontWeight: 900,
              color: streakColor,
              fontFamily: "monospace",
              lineHeight: 1,
            }}
          >
            Day {streak}
          </span>
          <p
            style={{
              fontSize: "11px",
              color: "#909097",
              marginTop: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Current Login Streak
          </p>
        </div>

        {/* Day cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          {REWARDS.slice(0, 4).map((r) => (
            <DayCard
              key={r.day}
              reward={r}
              state={getDayState(r.day)}
              claimedToday={claimedToday}
            />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr) 1fr",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {REWARDS.slice(4, 6).map((r) => (
            <DayCard
              key={r.day}
              reward={r}
              state={getDayState(r.day)}
              claimedToday={claimedToday}
            />
          ))}
          {/* Day 7 — gold special card, spans remaining column */}
          <div style={{ gridColumn: "3 / 5" }}>
            <DayCard
              reward={REWARDS[6]}
              state={getDayState(7)}
              claimedToday={claimedToday}
              isSpecial
            />
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div
            style={{
              background: "rgba(78,222,163,0.12)",
              border: "1px solid rgba(78,222,163,0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "12px",
              fontSize: "13px",
              color: "#4edea3",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Reward claimed! +{todayReward?.vusdt} VUSDT · +{todayReward?.xp} XP
          </div>
        )}

        {/* Claim button */}
        {claimedToday || success ? (
          <button
            disabled
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid rgba(78,222,163,0.25)",
              background: "rgba(78,222,163,0.08)",
              color: "rgba(78,222,163,0.55)",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "not-allowed",
              letterSpacing: "0.04em",
            }}
          >
            Claimed ✓
          </button>
        ) : (
          <button
            onClick={handleClaim}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: loading
                ? "rgba(78,222,163,0.3)"
                : "linear-gradient(135deg, #4edea3 0%, #2cb87e 100%)",
              color: "#0b1222",
              fontSize: "13px",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              transition: "opacity 0.15s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Claiming..."
              : `Claim Today's Reward (+${todayReward?.vusdt ?? 0} VUSDT)`}
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(78,222,163,0.5), 0 0 12px rgba(78,222,163,0.3); }
          70% { box-shadow: 0 0 0 8px rgba(78,222,163,0), 0 0 12px rgba(78,222,163,0.3); }
          100% { box-shadow: 0 0 0 0 rgba(78,222,163,0), 0 0 12px rgba(78,222,163,0.3); }
        }
        .streak-today-pulse {
          animation: pulse-ring 1.8s ease-out infinite;
        }
      `}</style>
    </div>
  );
}

interface DayCardProps {
  reward: { day: number; vusdt: number; xp: number };
  state: "past" | "today" | "future";
  claimedToday: boolean;
  isSpecial?: boolean;
}

function DayCard({ reward, state, claimedToday, isSpecial }: DayCardProps) {
  const isPast = state === "past";
  const isToday = state === "today";
  const isFuture = state === "future";

  // A past day is fully claimed; today is claimed only if claimedToday is true
  const isClaimed = isPast || (isToday && claimedToday);

  let borderColor = "#2e3447";
  let bgColor = "#0c1324";
  let extraClass = "";

  if (isSpecial && !isFuture) {
    borderColor = "#f5c842";
    bgColor = isToday ? "#1a1608" : "#100e04";
  } else if (isToday && !claimedToday) {
    borderColor = "#4edea3";
    bgColor = "#071a12";
    extraClass = "streak-today-pulse";
  } else if (isToday && claimedToday) {
    borderColor = "rgba(78,222,163,0.4)";
    bgColor = "#071a12";
  }

  return (
    <div
      className={extraClass}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "10px",
        padding: isSpecial ? "12px 8px" : "10px 6px",
        textAlign: "center",
        position: "relative",
        transition: "border-color 0.2s",
      }}
    >
      {/* Day label */}
      <div
        style={{
          fontSize: "9px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: isFuture ? "#909097" : isToday ? "#4edea3" : "#909097",
          marginBottom: "4px",
        }}
      >
        Day {reward.day}
      </div>

      {/* Icon */}
      <div style={{ fontSize: isSpecial ? "20px" : "16px", lineHeight: 1, marginBottom: "4px" }}>
        {isFuture ? "🔒" : isClaimed ? "✅" : "🔥"}
      </div>

      {/* VUSDT reward */}
      <div
        style={{
          fontSize: isSpecial ? "12px" : "10px",
          fontWeight: 800,
          fontFamily: "monospace",
          color: isFuture
            ? "#909097"
            : isSpecial
            ? "#f5c842"
            : isClaimed
            ? "rgba(78,222,163,0.55)"
            : "#4edea3",
        }}
      >
        +{reward.vusdt}
        <span style={{ fontSize: "8px", fontWeight: 600 }}> V</span>
      </div>

      {/* XP reward */}
      <div
        style={{
          fontSize: "9px",
          fontWeight: 600,
          color: isFuture ? "#909097" : "rgba(140,205,255,0.7)",
          marginTop: "2px",
        }}
      >
        +{reward.xp} XP
      </div>

      {/* Special badge for day 7 */}
      {isSpecial && (
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#f5c842",
            color: "#0b1222",
            fontSize: "8px",
            fontWeight: 900,
            padding: "2px 6px",
            borderRadius: "4px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          BONUS
        </div>
      )}
    </div>
  );
}
