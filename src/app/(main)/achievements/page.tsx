"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  vusdtReward: number;
  category: "trading" | "streak" | "portfolio";
  icon: string;
  unlocked: boolean;
  claimed: boolean;
  unlockedAt: string | null;
}

type FilterTab = "all" | "trading" | "streak" | "portfolio";

interface ToastMsg {
  id: number;
  text: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const fetchAchievements = useCallback(() => {
    fetch("/api/user/achievements", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.achievements)) setAchievements(d.achievements);
        else if (Array.isArray(d)) setAchievements(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  function addToast(text: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  async function handleClaim(achievement: Achievement) {
    setClaimingId(achievement.id);
    try {
      const res = await fetch(`/api/user/achievements/${achievement.id}/claim`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        addToast(`+${achievement.xpReward} XP · +${achievement.vusdtReward} VUSDT`);
        fetchAchievements();
      }
    } catch {
      // silently ignore
    } finally {
      setClaimingId(null);
    }
  }

  const filtered =
    filter === "all"
      ? achievements
      : achievements.filter((a) => a.category === filter);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "trading", label: "Trading" },
    { key: "streak", label: "Streak" },
    { key: "portfolio", label: "Portfolio" },
  ];

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
            background: "rgba(245,200,66,0.15)",
            borderRadius: "10px",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Trophy size={22} style={{ color: "#f5c842" }} />
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
            Achievements
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#909097",
              margin: 0,
              marginTop: "2px",
            }}
          >
            Complete challenges to earn XP and bonus VUSDT
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "10px",
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              color: "#909097",
            }}
          >
            Progress
          </span>
          <div style={{ marginTop: "4px", display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 900,
                fontFamily: "monospace",
                color: "#f5c842",
              }}
            >
              {unlockedCount}
            </span>
            <span style={{ fontSize: "14px", color: "#909097", fontWeight: 600 }}>
              / {totalCount} Unlocked
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: "240px" }}>
          <div
            style={{
              height: "6px",
              background: "#2e3447",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%`,
                background: "linear-gradient(90deg, #4edea3, #2cb87e)",
                borderRadius: "3px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              color: "#909097",
              textAlign: "right",
              fontFamily: "monospace",
            }}
          >
            {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: isActive ? "1px solid #4edea3" : "1px solid #2e3447",
                background: isActive ? "rgba(78,222,163,0.12)" : "transparent",
                color: isActive ? "#4edea3" : "#909097",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
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
          No achievements in this category yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {filtered.map((a) => (
            <AchievementCard
              key={a.id}
              achievement={a}
              onClaim={handleClaim}
              isClaiming={claimingId === a.id}
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
              border: "1px solid #4edea3",
              borderRadius: "8px",
              padding: "10px 16px",
              color: "#4edea3",
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
      `}</style>
    </div>
  );
}

function AchievementCard({
  achievement,
  onClaim,
  isClaiming,
}: {
  achievement: Achievement;
  onClaim: (a: Achievement) => void;
  isClaiming: boolean;
}) {
  const { unlocked, claimed, icon, name, description, xpReward, vusdtReward } = achievement;

  const isLocked = !unlocked;
  const isClaimable = unlocked && !claimed;
  const isClaimed = unlocked && claimed;

  let bg = "#0c1324";
  let borderColor = "#2e3447";

  if (isClaimed) {
    bg = "#191f31";
    borderColor = "#2e3447";
  } else if (isClaimable) {
    bg = "#191f31";
    borderColor = "#4edea3";
  }

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "relative",
        transition: "border-color 0.2s",
        boxShadow: isClaimable ? "0 0 12px rgba(78,222,163,0.1)" : "none",
      }}
    >
      {/* Claimed checkmark badge */}
      {isClaimed && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "rgba(78,222,163,0.15)",
            border: "1px solid rgba(78,222,163,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
          }}
        >
          ✓
        </div>
      )}

      {/* Icon */}
      <div
        style={{
          fontSize: "28px",
          lineHeight: 1,
          opacity: isLocked ? 0.3 : 1,
          filter: isLocked ? "grayscale(1)" : "none",
        }}
      >
        {icon}
      </div>

      {/* Name + description */}
      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
            color: isLocked ? "#909097" : "#dce1fb",
            marginBottom: "4px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#909097",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>

      {/* Reward badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            fontFamily: "monospace",
            padding: "3px 7px",
            borderRadius: "5px",
            background: isLocked
              ? "rgba(144,144,151,0.08)"
              : "rgba(140,205,255,0.12)",
            color: isLocked ? "#909097" : "#8ccdff",
            border: `1px solid ${isLocked ? "rgba(144,144,151,0.15)" : "rgba(140,205,255,0.2)"}`,
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
            background: isLocked
              ? "rgba(144,144,151,0.08)"
              : "rgba(78,222,163,0.12)",
            color: isLocked ? "#909097" : "#4edea3",
            border: `1px solid ${isLocked ? "rgba(144,144,151,0.15)" : "rgba(78,222,163,0.2)"}`,
          }}
        >
          +{vusdtReward} VUSDT
        </span>
      </div>

      {/* Footer: status label or claim button */}
      {isLocked && (
        <div
          style={{
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#909097",
            padding: "6px 0 0",
            borderTop: "1px solid #2e3447",
          }}
        >
          🔒 LOCKED
        </div>
      )}

      {isClaimed && (
        <div
          style={{
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "rgba(78,222,163,0.55)",
            padding: "6px 0 0",
            borderTop: "1px solid #2e3447",
          }}
        >
          CLAIMED
        </div>
      )}

      {isClaimable && (
        <button
          onClick={() => onClaim(achievement)}
          disabled={isClaiming}
          style={{
            marginTop: "auto",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: isClaiming
              ? "rgba(78,222,163,0.3)"
              : "linear-gradient(135deg, #4edea3 0%, #2cb87e 100%)",
            color: "#0b1222",
            fontSize: "11px",
            fontWeight: 800,
            cursor: isClaiming ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            boxShadow: isClaiming ? "none" : "0 2px 8px rgba(78,222,163,0.3)",
            transition: "opacity 0.15s",
            opacity: isClaiming ? 0.7 : 1,
          }}
        >
          {isClaiming ? "Claiming..." : "CLAIM"}
        </button>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#0c1324",
        border: "1px solid #2e3447",
        borderRadius: "12px",
        padding: "16px",
        height: "180px",
        opacity: 0.5,
      }}
    />
  );
}
