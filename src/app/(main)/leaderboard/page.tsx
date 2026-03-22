import { fetchLeaderboard, fetchUserSafe } from "@/app/data/services";
import { Trophy } from "lucide-react";
import AuthRequired from "@/components/auth-required";

function fmtUSD(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function LeaderboardPage() {
  const user = await fetchUserSafe();
  if (!user) {
    return (
      <AuthRequired
        title="Sign in to view the leaderboard"
        description="See how your portfolio stacks up against other traders."
      />
    );
  }

  const { leaderboard } = await fetchLeaderboard();
  const top = leaderboard[0]?.totalValue ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold mb-0.5">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            Top 50 traders ranked by total portfolio value
          </p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div
          className="rounded-xl px-6 py-16 text-center text-muted-foreground text-sm"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          No users yet.
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          {/* Top 3 podium */}
          {leaderboard.slice(0, 3).length > 0 && (
            <div
              className="flex justify-center gap-6 px-6 py-8"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              {leaderboard.slice(0, 3).map((entry, i) => (
                <div key={entry.username} className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{MEDAL[i + 1]}</span>
                  <span className="font-bold text-sm">{entry.username}</span>
                  <span className="text-xs text-muted-foreground">{fmtUSD(entry.totalValue)}</span>
                  <div
                    className="w-2 rounded-full mt-1"
                    style={{
                      height: i === 0 ? 40 : i === 1 ? 28 : 18,
                      background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : "#b45309",
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
                <th className="text-left px-5 py-3 w-12">Rank</th>
                <th className="text-left px-5 py-3">Trader</th>
                <th className="text-right px-5 py-3">Portfolio Value</th>
                <th className="text-right px-5 py-3">vs. Start</th>
                <th className="text-right px-5 py-3 hidden md:table-cell">Share</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => {
                const rank = i + 1;
                const pnl = entry.totalValue - 1000;
                const pnlPct = (pnl / 1000) * 100;
                const isUp = pnl >= 0;
                const barWidth = top > 0 ? Math.max(4, (entry.totalValue / top) * 100) : 0;

                return (
                  <tr
                    key={entry.username}
                    className="transition-colors hover:bg-muted/40"
                    style={i < leaderboard.length - 1 ? { borderBottom: "1px solid hsl(var(--border))" } : {}}
                  >
                    <td className="px-5 py-3.5 text-center font-bold text-muted-foreground">
                      {MEDAL[rank] ?? <span className="text-xs">#{rank}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{entry.username}</span>
                        {/* mini bar */}
                        <div className="h-1 rounded-full bg-muted w-full max-w-[120px]">
                          <div
                            className="h-1 rounded-full"
                            style={{
                              width: `${barWidth}%`,
                              background: isUp ? "#16c784" : "#ea3943",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold">
                      {fmtUSD(entry.totalValue)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-xs">
                      <span style={{ color: isUp ? "#16c784" : "#ea3943" }}>
                        {isUp ? "+" : ""}
                        {pnlPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {top > 0 ? ((entry.totalValue / top) * 100).toFixed(0) : 0}%
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
        All traders start with $1,000 USDT · Updates on page refresh
      </p>
    </div>
  );
}
