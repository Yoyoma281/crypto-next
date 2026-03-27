"use client";

import { useI18n } from "@/lib/i18n";
import { Trophy, Copy, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalValue: number;
}

function fmtUSD(n: number) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function AllocationModal({
  username,
  onConfirm,
  onClose,
}: {
  username: string;
  onConfirm: (pct: number) => void;
  onClose: () => void;
}) {
  const [pct, setPct] = useState(10);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-6 w-80 flex flex-col gap-4"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Copy {username}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Set how much of your USDT to allocate when copying this trader's trades.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Allocation</span>
            <span className="font-mono font-semibold" style={{ color: "#4edea3" }}>{pct}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="w-full accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1%</span>
            <span>100%</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          If the leader spends 20% of their balance, you'll spend {Math.round(pct * 0.2)}% of yours.
        </p>
        <button
          onClick={() => onConfirm(pct)}
          className="rounded-lg py-2 text-sm font-semibold text-black"
          style={{ background: "#4edea3" }}
        >
          Start Copying
        </button>
      </div>
    </div>
  );
}

export default function LeaderboardContent({
  leaderboard,
}: {
  leaderboard: LeaderboardEntry[];
}) {
  const { t } = useI18n();
  const top = leaderboard[0]?.totalValue ?? 0;

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/copy-trading/following")
      .then((r) => r.json())
      .then((data) => {
        if (data.following) {
          setFollowingIds(new Set(data.following.map((f: { leaderId: string }) => String(f.leaderId))));
        }
      })
      .catch(() => {});
  }, []);

  async function handleCopy(entry: LeaderboardEntry, allocationPct: number) {
    setModal(null);
    setLoading(entry.userId);
    try {
      await fetch("/api/copy-trading/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderId: entry.userId, allocationPct }),
      });
      setFollowingIds((prev) => new Set([...prev, entry.userId]));
    } catch (_) {}
    setLoading(null);
  }

  async function handleUnfollow(entry: LeaderboardEntry) {
    setLoading(entry.userId);
    try {
      await fetch("/api/copy-trading/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderId: entry.userId }),
      });
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.userId);
        return next;
      });
    } catch (_) {}
    setLoading(null);
  }

  return (
    <>
      {modal && (
        <AllocationModal
          username={modal.username}
          onConfirm={(pct) => handleCopy(modal, pct)}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold mb-0.5">{t.leaderboard.title}</h1>
            <p className="text-sm text-muted-foreground">
              {t.leaderboard.subtitle}
            </p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div
            className="rounded-xl px-6 py-16 text-center text-muted-foreground text-sm"
            style={{
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            {t.leaderboard.noUsers}
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            {/* Top 3 podium */}
            {leaderboard.slice(0, 3).length > 0 && (
              <div
                className="flex justify-center gap-6 px-6 py-8"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                {leaderboard.slice(0, 3).map((entry, i) => (
                  <div
                    key={entry.username}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">{MEDAL[i + 1]}</span>
                    <span className="font-bold text-sm">{entry.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {fmtUSD(entry.totalValue)}
                    </span>
                    <div
                      className="w-2 rounded-full mt-1"
                      style={{
                        height: i === 0 ? 40 : i === 1 ? 28 : 18,
                        background:
                          i === 0 ? "#4edea3" : i === 1 ? "#b9c7e0" : "#7a9db4",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Full table */}
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                  style={{ borderBottom: "1px solid hsl(var(--border))" }}
                >
                  <th className="text-left px-5 py-3 w-12">
                    {t.leaderboard.rank}
                  </th>
                  <th className="text-left px-5 py-3">{t.leaderboard.trader}</th>
                  <th className="text-right px-5 py-3">
                    {t.leaderboard.portfolioValue}
                  </th>
                  <th className="text-right px-5 py-3">
                    {t.leaderboard.vsStart}
                  </th>
                  <th className="text-right px-5 py-3 hidden md:table-cell">
                    Copy
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => {
                  const rank = i + 1;
                  const pnl = entry.totalValue - 1000;
                  const pnlPct = (pnl / 1000) * 100;
                  const isUp = pnl >= 0;
                  const barWidth =
                    top > 0 ? Math.max(4, (entry.totalValue / top) * 100) : 0;
                  const isCopying = followingIds.has(entry.userId);
                  const isLoadingThis = loading === entry.userId;

                  return (
                    <tr
                      key={entry.username}
                      className="transition-colors hover:bg-muted/40"
                      style={
                        i < leaderboard.length - 1
                          ? { borderBottom: "1px solid hsl(var(--border))" }
                          : {}
                      }
                    >
                      <td className="px-5 py-3.5 text-center font-bold text-muted-foreground">
                        {MEDAL[rank] ?? <span className="text-xs">#{rank}</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{entry.username}</span>
                          <div className="h-1 rounded-full bg-muted w-full max-w-[120px]">
                            <div
                              className="h-1 rounded-full"
                              style={{
                                width: `${barWidth}%`,
                                background: isUp ? "#4edea3" : "#ffb3ad",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold">
                        {fmtUSD(entry.totalValue)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs">
                        <span style={{ color: isUp ? "#4edea3" : "#ffb3ad" }}>
                          {isUp ? "+" : ""}
                          {pnlPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden md:table-cell">
                        {isCopying ? (
                          <button
                            disabled={isLoadingThis}
                            onClick={() => handleUnfollow(entry)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
                            style={{ background: "rgba(78,222,163,0.15)", color: "#4edea3", border: "1px solid #4edea3" }}
                          >
                            <Check className="h-3 w-3" />
                            Copying
                          </button>
                        ) : (
                          <button
                            disabled={isLoadingThis}
                            onClick={() => setModal(entry)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            style={{ border: "1px solid hsl(var(--border))" }}
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {t.leaderboard.footer}
        </p>
      </div>
    </>
  );
}
