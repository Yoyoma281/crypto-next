"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Copy, Check, Trophy, Users } from "lucide-react";

interface ReferralData {
  code: string;
  referralCount: number;
  hasBeenReferred: boolean;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  referralCount: number;
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claimStatus, setClaimStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("https://cryser.app");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [refRes, lbRes] = await Promise.all([
          fetch("/api/referral", { credentials: "include" }),
          fetch("/api/referral/leaderboard", { credentials: "include" }),
        ]);
        if (refRes.ok) setData(await refRes.json());
        if (lbRes.ok) {
          const lb = await lbRes.json();
          setLeaderboard(Array.isArray(lb) ? lb : lb.leaderboard ?? []);
        }
      } catch {
        // silently fail — backend may not have this feature yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const referralLink = data?.code
    ? `${origin}/signup?ref=${data.code}`
    : `${origin}/signup?ref=YOUR_CODE`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — just show copied anyway
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!claimCode.trim()) return;
    setClaiming(true);
    setClaimStatus(null);
    try {
      const res = await fetch("/api/referral/claim", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: claimCode.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setClaimStatus({
          type: "success",
          message: json.message ?? "Code applied! You both received $25 VUSDT.",
        });
        setData((prev) => (prev ? { ...prev, hasBeenReferred: true } : prev));
        setClaimCode("");
      } else {
        setClaimStatus({
          type: "error",
          message: json.error ?? json.message ?? "Invalid or already used code.",
        });
      }
    } catch {
      setClaimStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setClaiming(false);
    }
  }

  function getInitials(username: string) {
    return username.slice(0, 2).toUpperCase();
  }

  const BG = "#0b1222";
  const PANEL = "#191f31";
  const BORDER = "#2e3447";
  const TEXT = "#dce1fb";
  const MUTED = "#909097";
  const GREEN = "#4edea3";
  const GOLD = "#f5c842";
  const BLUE = "#8ccdff";
  const RED = "#ffb3ad";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "2.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Hero */}
        <div
          style={{
            background: `linear-gradient(135deg, rgba(78,222,163,0.08) 0%, rgba(140,205,255,0.08) 100%)`,
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: "2.5rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `rgba(78,222,163,0.12)`,
              border: `1px solid rgba(78,222,163,0.3)`,
              marginBottom: "1.25rem",
            }}
          >
            <Gift style={{ width: 28, height: 28, color: GREEN }} />
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: TEXT,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Invite Friends, Earn Together
          </h1>
          <p
            style={{
              color: MUTED,
              marginTop: "0.75rem",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            Share your referral link and both you and your friend receive{" "}
            <strong style={{ color: GREEN }}>$25 VUSDT</strong> the moment they
            sign up.
          </p>

          {/* Reward chips */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginTop: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {["You get $25 VUSDT", "Friend gets $25 VUSDT"].map((label) => (
              <span
                key={label}
                style={{
                  background: "rgba(78,222,163,0.1)",
                  border: `1px solid rgba(78,222,163,0.35)`,
                  color: GREEN,
                  borderRadius: 999,
                  padding: "0.4rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Referral link box */}
        <div
          style={{
            background: PANEL,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <Gift style={{ width: 16, height: 16, color: GREEN }} />
            <span
              style={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}
            >
              Your Referral Link
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "0.7rem 1rem",
                fontSize: "0.8rem",
                color: BLUE,
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                userSelect: "all",
              }}
            >
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.7rem 1.25rem",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.8rem",
                background: copied
                  ? "rgba(78,222,163,0.15)"
                  : `rgba(140,205,255,0.12)`,
                color: copied ? GREEN : BLUE,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? (
                <Check style={{ width: 14, height: 14 }} />
              ) : (
                <Copy style={{ width: 14, height: 14 }} />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Stats chip */}
          {data && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(140,205,255,0.08)",
                border: `1px solid rgba(140,205,255,0.2)`,
                borderRadius: 999,
                padding: "0.35rem 0.9rem",
                fontSize: "0.78rem",
                color: BLUE,
                alignSelf: "flex-start",
              }}
            >
              <Users style={{ width: 13, height: 13 }} />
              You&apos;ve referred{" "}
              <strong style={{ color: TEXT }}>
                {data.referralCount}
              </strong>{" "}
              trader{data.referralCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Claim code section */}
        {(!data?.hasBeenReferred) && (
          <div
            style={{
              background: PANEL,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div>
              <span
                style={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}
              >
                Have a Referral Code?
              </span>
              <p style={{ color: MUTED, fontSize: "0.82rem", marginTop: "0.3rem" }}>
                Enter a friend&apos;s code to claim your $25 VUSDT welcome bonus.
              </p>
            </div>
            <form
              onSubmit={handleClaim}
              style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <input
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="Enter referral code"
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "0.7rem 1rem",
                  fontSize: "0.85rem",
                  color: TEXT,
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = BLUE)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = BORDER)
                }
              />
              <button
                type="submit"
                disabled={claiming || !claimCode.trim()}
                style={{
                  padding: "0.7rem 1.5rem",
                  borderRadius: 10,
                  border: "none",
                  cursor: claiming ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  background:
                    claiming || !claimCode.trim()
                      ? "rgba(255,255,255,0.06)"
                      : `linear-gradient(135deg, ${GREEN}, #2eb87e)`,
                  color: claiming || !claimCode.trim() ? MUTED : "#0b1222",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {claiming ? "Applying..." : "Apply Code"}
              </button>
            </form>
            {claimStatus && (
              <div
                style={{
                  padding: "0.65rem 1rem",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  background:
                    claimStatus.type === "success"
                      ? "rgba(78,222,163,0.1)"
                      : "rgba(255,179,173,0.1)",
                  border: `1px solid ${claimStatus.type === "success" ? "rgba(78,222,163,0.3)" : "rgba(255,179,173,0.3)"}`,
                  color: claimStatus.type === "success" ? GREEN : RED,
                }}
              >
                {claimStatus.message}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <div
          style={{
            background: PANEL,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Trophy style={{ width: 16, height: 16, color: GOLD }} />
            <span
              style={{ fontWeight: 700, fontSize: "0.95rem", color: TEXT }}
            >
              Top Referrers
            </span>
          </div>

          {loading ? (
            <div style={{ color: MUTED, fontSize: "0.85rem", padding: "1rem 0" }}>
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ color: MUTED, fontSize: "0.85rem", padding: "1rem 0" }}>
              No referrals yet — be the first!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {leaderboard.slice(0, 10).map((entry, idx) => {
                const rank = entry.rank ?? idx + 1;
                const isFirst = rank === 1;
                return (
                  <div
                    key={entry.username}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.75rem 1rem",
                      borderRadius: 12,
                      background: isFirst
                        ? "rgba(245,200,66,0.07)"
                        : "rgba(255,255,255,0.025)",
                      border: `1px solid ${isFirst ? "rgba(245,200,66,0.25)" : "transparent"}`,
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Rank */}
                    <div
                      style={{
                        width: 28,
                        textAlign: "center",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: isFirst ? GOLD : rank <= 3 ? BLUE : MUTED,
                        flexShrink: 0,
                      }}
                    >
                      {isFirst ? (
                        <Trophy
                          style={{ width: 16, height: 16, color: GOLD, display: "inline" }}
                        />
                      ) : (
                        `#${rank}`
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: isFirst
                          ? `linear-gradient(135deg, ${GOLD}, #c4960a)`
                          : `linear-gradient(135deg, #2e3a55, #1a2236)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: isFirst ? "#0b1222" : TEXT,
                        flexShrink: 0,
                        border: `1px solid ${isFirst ? "rgba(245,200,66,0.4)" : BORDER}`,
                      }}
                    >
                      {getInitials(entry.username)}
                    </div>

                    {/* Username */}
                    <Link
                      href={`/u/${entry.username}`}
                      style={{
                        flex: 1,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: TEXT,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = BLUE)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = TEXT)
                      }
                    >
                      {entry.username}
                    </Link>

                    {/* Count */}
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: isFirst ? GOLD : BLUE,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Users style={{ width: 13, height: 13 }} />
                      {entry.referralCount}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
