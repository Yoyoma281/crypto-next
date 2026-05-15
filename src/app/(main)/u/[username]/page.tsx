"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Flame, TrendingUp, Trophy, Zap, Coins } from "lucide-react";
import LevelBadge from "@/components/LevelBadge";
import StreakBadge from "@/components/StreakBadge";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

interface Profile {
  username: string;
  avatar: string | null;
  level: number;
  xp: number;
  xpToNext: number;
  loginStreak: number;
  tradeCount: number;
  achievementsUnlocked: number;
  topCoins: Array<{ symbol: string; worth: string }>;
}

function getAvatarSrc(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("/uploads/")) return `${BASE_URL}${avatar}`;
  return avatar;
}

function getInitialsColor(username: string): string {
  const colors = ["#4edea3", "#8ccdff", "#f5c842", "#ffb3ad", "#a78bfa"];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/users/${encodeURIComponent(username)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (notFound || !profile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "12px",
          color: "#909097",
        }}
      >
        <span style={{ fontSize: "48px" }}>🔍</span>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#dce1fb" }}>
          User not found
        </div>
        <div style={{ fontSize: "13px" }}>
          No user with the username &quot;{username}&quot; exists.
        </div>
      </div>
    );
  }

  const avatarSrc = getAvatarSrc(profile.avatar);
  const initials = profile.username.slice(0, 2).toUpperCase();
  const initialsColor = getInitialsColor(profile.username);
  const xpTotal = profile.xp + (profile.xpToNext ?? 0);
  const xpPct = xpTotal > 0 ? Math.min(100, (profile.xp / xpTotal) * 100) : 0;

  const statBoxes = [
    { label: "Trades", value: profile.tradeCount, icon: TrendingUp, color: "#4edea3" },
    { label: "Level", value: profile.level, icon: Zap, color: "#8ccdff" },
    { label: "Achievements", value: profile.achievementsUnlocked, icon: Trophy, color: "#f5c842" },
    { label: "Streak", value: `${profile.loginStreak}d`, icon: Flame, color: "#ffb3ad" },
  ];

  return (
    <div style={{ color: "#dce1fb", minHeight: "100vh", maxWidth: "720px", margin: "0 auto" }}>
      {/* Profile hero card */}
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Avatar */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={profile.username}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #2e3447",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: `${initialsColor}22`,
              border: `2px solid ${initialsColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 900,
              color: initialsColor,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}

        {/* Username + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 900,
              color: "#dce1fb",
              marginBottom: "8px",
              letterSpacing: "0.01em",
            }}
          >
            {profile.username}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <LevelBadge
              level={profile.level}
              xp={profile.xp}
              xpToNext={profile.xpToNext ?? 0}
              size="sm"
            />
            {profile.loginStreak >= 2 && <StreakBadge streak={profile.loginStreak} />}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {statBoxes.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              background: "#191f31",
              border: "1px solid #2e3447",
              borderRadius: "12px",
              padding: "16px 12px",
              textAlign: "center",
            }}
          >
            <Icon
              size={18}
              style={{ color, margin: "0 auto 8px", display: "block" }}
            />
            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#dce1fb",
                fontFamily: "monospace",
                marginBottom: "4px",
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: "11px", color: "#909097", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* XP progress bar */}
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#909097", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            XP Progress
          </span>
          <span style={{ fontSize: "11px", color: "#909097", fontFamily: "monospace" }}>
            {profile.xp} / {xpTotal} XP
          </span>
        </div>
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
              width: `${xpPct}%`,
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
          {Math.round(xpPct)}% to Lv.{profile.level + 1}
        </div>
      </div>

      {/* Top holdings */}
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "12px",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <Coins size={16} style={{ color: "#f5c842" }} />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#909097",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Top Holdings
          </span>
        </div>

        {!profile.topCoins || profile.topCoins.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 0",
              color: "#909097",
              fontSize: "13px",
            }}
          >
            No holdings yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {profile.topCoins.map((coin, i) => (
              <div
                key={coin.symbol}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < profile.topCoins.length - 1 ? "1px solid #2e3447" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "20px",
                      fontSize: "11px",
                      color: "#909097",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    #{i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#dce1fb",
                      fontFamily: "monospace",
                    }}
                  >
                    {coin.symbol}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#4edea3",
                    fontFamily: "monospace",
                  }}
                >
                  ${coin.worth}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "20px",
          height: "120px",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#191f31",
              border: "1px solid #2e3447",
              borderRadius: "12px",
              height: "90px",
              opacity: 0.5,
            }}
          />
        ))}
      </div>
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "12px",
          height: "80px",
          marginBottom: "20px",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          background: "#191f31",
          border: "1px solid #2e3447",
          borderRadius: "12px",
          height: "160px",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
