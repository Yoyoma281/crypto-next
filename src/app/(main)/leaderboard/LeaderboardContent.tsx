"use client";

import { useI18n } from "@/lib/i18n";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
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

export default function LeaderboardContent({
  leaderboard,
}: {
  leaderboard: LeaderboardEntry[];
}) {
  const { t } = useI18n();
  const top = leaderboard[0]?.totalValue ?? 0;

  return (
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
                  {t.leaderboard.share}
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
                      <span className="text-xs text-muted-foreground">
                        {top > 0
                          ? ((entry.totalValue / top) * 100).toFixed(0)
                          : 0}
                        %
                      </span>
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
  );
}
