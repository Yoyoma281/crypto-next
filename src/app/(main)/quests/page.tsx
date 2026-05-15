"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap, Trophy } from "lucide-react";

interface Quest {
  id: string;
  type: "daily" | "weekly";
  name: string;
  description: string;
  target: number;
  xpReward: number;
  vusdtReward: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

interface ToastMsg {
  id: number;
  text: string;
  ok: boolean;
}

type TabType = "daily" | "weekly";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("daily");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const fetchQuests = useCallback(() => {
    fetch("/api/user/quests", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.quests)) setQuests(d.quests);
        else if (Array.isArray(d)) setQuests(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  function addToast(text: string, ok: boolean) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, ok }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  async function handleClaim(quest: Quest) {
    setClaimingId(quest.id);
    try {
      const res = await fetch(`/api/user/quests/${quest.id}/claim`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        addToast(`+${quest.xpReward} XP · +${quest.vusdtReward} VUSDT`, true);
        fetchQuests();
      } else {
        addToast("Failed to claim reward", false);
      }
    } catch {
      addToast("Failed to claim reward", false);
    } finally {
      setClaimingId(null);
    }
  }

  const filtered = quests.filter((q) => q.type === tab);
  const dailyCount = quests.filter((q) => q.type === "daily" && q.completed && !q.claimed).length;
  const weeklyCount = quests.filter((q) => q.type === "weekly" && q.completed && !q.claimed).length;

  return (
    <div style={{ color: "#dce1fb", minHeight: "100vh" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "rgba(140,205,255,0.12)",
            borderRadius: "10px",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={22} style={{ color: "#8ccdff" }} />
        </div>
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#dce1fb",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Quests
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#909097",
              margin: 0,
              marginTop: "2px",
            }}
          >
            Complete quests to earn XP and bonus VUSDT
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
        }}
      >
        {(
          [
            { key: "daily" as TabType, label: "Daily", count: dailyCount },
            { key: "weekly" as TabType, label: "Weekly", count: weeklyCount },
          ] as { key: TabType; label: string; count: number }[]
        ).map(({ key, label, count }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: isActive ? "1px solid #4edea3" : "1px solid #2e3447",
                background: isActive ? "rgba(78,222,163,0.10)" : "transparent",
                color: isActive ? "#4edea3" : "#909097",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              {label}
              {count > 0 && (
                <span
                  style={{
                    background: "#4edea3",
                    color: "#0b1222",
                    borderRadius: "10px",
                    padding: "1px 6px",
                    fontSize: "10px",
                    fontWeight: 900,
                    lineHeight: "16px",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quest list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#909097",
            fontSize: "14px",
          }}
        >
          No {tab} quests available right now.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClaim={handleClaim}
              isClaiming={claimingId === quest.id}
            />
          ))}
        </div>
      )}

      {/* Toast notifications */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: "#191f31",
              border: `1px solid ${toast.ok ? "#4edea3" : "#ffb3ad"}`,
              borderRadius: "8px",
              padding: "10px 16px",
              color: toast.ok ? "#4edea3" : "#ffb3ad",
              fontSize: "13px",
              fontWeight: 700,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              animation: "fadeInUp 0.2s ease",
            }}
          >
            {toast.text}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(78,222,163,0.4); }
          50% { box-shadow: 0 0 18px rgba(78,222,163,0.8); }
        }
      `}</style>
    </div>
  );
}

function QuestCard({
  quest,
  onClaim,
  isClaiming,
}: {
  quest: Quest;
  onClaim: (q: Quest) => void;
  isClaiming: boolean;
}) {
  const { completed, claimed, progress, target, name, description, xpReward, vusdtReward, type } =
    quest;
  const pct = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
  const isClaimable = completed && !claimed;

  return (
    <div
      style={{
        background: "#191f31",
        border: `1px solid ${isClaimable ? "#4edea3" : "#2e3447"}`,
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        transition: "border-color 0.2s",
        boxShadow: isClaimable ? "0 0 12px rgba(78,222,163,0.08)" : "none",
        animation: isClaimable ? "pulseGlow 2s ease-in-out infinite" : "none",
      }}
    >
      {/* Quest icon */}
      <div
        style={{
          fontSize: "28px",
          lineHeight: 1,
          flexShrink: 0,
          width: "40px",
          textAlign: "center",
        }}
      >
        {type === "daily" ? "⚡" : "🏆"}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#dce1fb",
            marginBottom: "3px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#909097",
            marginBottom: "10px",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "4px",
            background: "#2e3447",
            borderRadius: "2px",
            overflow: "hidden",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: completed ? "#4edea3" : "linear-gradient(90deg, #4edea3, #2cb87e)",
              borderRadius: "2px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ fontSize: "10px", color: "#909097", fontFamily: "monospace" }}>
          {progress} / {target}
        </div>

        {/* Reward badges */}
        <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "monospace",
              padding: "3px 7px",
              borderRadius: "5px",
              background: "rgba(140,205,255,0.12)",
              color: "#8ccdff",
              border: "1px solid rgba(140,205,255,0.2)",
            }}
          >
            +{xpReward} XP
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "monospace",
              padding: "3px 7px",
              borderRadius: "5px",
              background: "rgba(78,222,163,0.12)",
              color: "#4edea3",
              border: "1px solid rgba(78,222,163,0.2)",
            }}
          >
            +{vusdtReward} VUSDT
          </span>
        </div>
      </div>

      {/* State action */}
      <div style={{ flexShrink: 0, minWidth: "90px", textAlign: "right" }}>
        {isClaimable ? (
          <button
            onClick={() => onClaim(quest)}
            disabled={isClaiming}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              border: "1px solid #4edea3",
              background: isClaiming
                ? "rgba(78,222,163,0.2)"
                : "linear-gradient(135deg, #4edea3 0%, #2cb87e 100%)",
              color: "#0b1222",
              fontSize: "12px",
              fontWeight: 900,
              cursor: isClaiming ? "not-allowed" : "pointer",
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
              boxShadow: isClaiming ? "none" : "0 2px 10px rgba(78,222,163,0.35)",
              transition: "opacity 0.15s",
              opacity: isClaiming ? 0.7 : 1,
              whiteSpace: "nowrap" as const,
            }}
          >
            {isClaiming ? "..." : "Claim"}
          </button>
        ) : claimed ? (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "rgba(78,222,163,0.5)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              justifyContent: "flex-end",
            }}
          >
            Claimed ✓
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        background: "#191f31",
        border: "1px solid #2e3447",
        borderRadius: "12px",
        padding: "16px 20px",
        height: "110px",
        opacity: 0.5,
      }}
    />
  );
}
