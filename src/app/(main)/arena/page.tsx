'use client';

import { useEffect, useState } from 'react';
import { Trophy, Target, Swords, Clock, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { useArenaMode } from '@/contexts/ArenaModeContext';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  pnlPct: number;
  tradeCount: number;
  winRate: number;
  rankDelta?: number;
  isCurrentUser?: boolean;
  qualified?: boolean;
}

interface MyStats {
  tradeCount: number;
  winRate: number;
  biggestWinPct: number;
  biggestLossPct: number;
  symbolsTraded: string[];
  qualified: boolean;
  tradesNeeded: number;
  symbolsNeeded: number;
  currentRank?: number;
  pnlPct: number;
}

interface PastWeek {
  weekNumber: number;
  endAt: string;
  first?: { username: string; pnlPct: number };
  second?: { username: string; pnlPct: number };
  third?: { username: string; pnlPct: number };
}

const PRIZE_TIERS = [
  { label: '1st Place', amount: 5000, color: '#f5c842', bg: 'rgba(245,200,66,0.12)', border: 'rgba(245,200,66,0.4)', icon: '🥇' },
  { label: '2nd Place', amount: 2500, color: '#c0c0c0', bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.3)', icon: '🥈' },
  { label: '3rd Place', amount: 1000, color: '#cd7f32', bg: 'rgba(205,127,50,0.1)', border: 'rgba(205,127,50,0.3)', icon: '🥉' },
  { label: 'Top 10', amount: 500, color: '#8b8fa8', bg: 'rgba(139,143,168,0.08)', border: 'rgba(139,143,168,0.25)', icon: '🏅' },
  { label: 'Top 50', amount: 200, color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', icon: '🎖️' },
  { label: 'Top 100', amount: 50, color: '#6b7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.18)', icon: '🎗️' },
];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted/40 ${className ?? ''}`} />;
}

function fmtPnl(pct: number) {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
}

function RankDelta({ delta }: { delta?: number }) {
  if (delta === undefined || delta === 0) return <span className="text-[10px] text-muted-foreground">—</span>;
  if (delta > 0) return <span className="text-[10px] font-semibold" style={{ color: '#4edea3' }}>+{delta}</span>;
  return <span className="text-[10px] font-semibold" style={{ color: '#ea3943' }}>{delta}</span>;
}

export default function ArenaPage() {
  const { weekInfo, countdown, activeMode, setActiveMode } = useArenaMode();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [pastWeeks, setPastWeeks] = useState<PastWeek[]>([]);
  const [loadingLb, setLoadingLb] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPast, setLoadingPast] = useState(true);

  useEffect(() => {
    fetch('/api/arena/leaderboard?limit=100', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const currentUserId: string = d.currentUserId ?? '';
        const entries: LeaderboardEntry[] = (d.entries ?? []).map((e: Record<string, unknown>) => ({
          rank: e.rank as number,
          userId: String(e.userId),
          username: e.username as string,
          avatar: e.avatar as string | undefined,
          pnlPct: parseFloat(e.pnlPct as string ?? '0'),
          tradeCount: e.trades as number,
          winRate: 0,
          rankDelta: undefined,
          isCurrentUser: currentUserId ? String(e.userId) === currentUserId : false,
          qualified: (e.trades as number) >= 10 && (e.symbols as number) >= 3 && !(e.disqualified as boolean),
        }));
        setLeaderboard(entries);
      })
      .catch(() => setLeaderboard([]))
      .finally(() => setLoadingLb(false));
  }, []);

  useEffect(() => {
    fetch('/api/arena/my-stats', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const tradeCount: number = d.weekTradeCount ?? 0;
        const symbols: string[] = d.weekSymbols ?? [];
        const stats = d.stats ?? {};
        const equity = d.equity ?? {};
        setMyStats({
          tradeCount,
          winRate: parseFloat(stats.winRate ?? '0') / 100,
          biggestWinPct: parseFloat(stats.biggestWinPct ?? '0'),
          biggestLossPct: parseFloat(stats.biggestLossPct ?? '0'),
          symbolsTraded: symbols,
          qualified: tradeCount >= 10 && symbols.length >= 3 && !d.disqualified,
          tradesNeeded: Math.max(0, 10 - tradeCount),
          symbolsNeeded: Math.max(0, 3 - symbols.length),
          pnlPct: parseFloat(equity.pnlPct ?? '0'),
        });
      })
      .catch(() => setMyStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    fetch('/api/arena/past-weeks?limit=4', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const mapped: PastWeek[] = (d.weeks ?? []).map((w: Record<string, unknown>) => {
          const winners = (w.winners as Array<Record<string, unknown>>) ?? [];
          const find = (rank: number) => {
            const winner = winners.find((x) => x.rank === rank);
            if (!winner) return undefined;
            return { username: winner.username as string, pnlPct: parseFloat(winner.pnlPct as string ?? '0') };
          };
          return { weekNumber: w.weekNumber as number, endAt: w.endAt as string, first: find(1), second: find(2), third: find(3) };
        });
        setPastWeeks(mapped);
      })
      .catch(() => setPastWeeks([]))
      .finally(() => setLoadingPast(false));
  }, []);

  const currentUserRow = leaderboard.find((e) => e.isCurrentUser);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.2)' }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Swords className="h-6 w-6" style={{ color: '#f5c842' }} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Arena
              {weekInfo ? ` — Week #${weekInfo.weekNumber}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Compete weekly. Start fresh. Win real VUSDT.
            </p>
          </div>
        </div>

        {/* Countdown banner */}
        {weekInfo && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)' }}>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: '#f5c842', boxShadow: '0 0 8px #f5c842', animation: 'arenaPulse 2s ease-in-out infinite' }}
              />
              <Clock className="h-3.5 w-3.5" style={{ color: '#f5c842' }} />
              <span className="text-sm font-semibold" style={{ color: '#f5c842' }}>
                Ends in {countdown}
              </span>
            </div>

            {currentUserRow && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border bg-card text-sm">
                <span className="text-muted-foreground">Your rank:</span>
                <span className="font-bold">#{currentUserRow.rank}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-bold font-mono" style={{ color: currentUserRow.pnlPct >= 0 ? '#4edea3' : '#ea3943' }}>
                  {fmtPnl(currentUserRow.pnlPct)}
                </span>
              </div>
            )}
          </div>
        )}

        {activeMode !== 'arena' && (
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)' }}>
            <span className="text-sm text-muted-foreground">You are in Portfolio mode.</span>
            <button
              onClick={() => setActiveMode('arena')}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
              style={{ background: 'rgba(245,200,66,0.2)', color: '#f5c842', border: '1px solid rgba(245,200,66,0.4)' }}
            >
              Switch to Arena
            </button>
          </div>
        )}
      </div>

      {/* ── Two-column layout on larger screens ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Leaderboard (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Live Leaderboard */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <Trophy className="h-4 w-4" style={{ color: '#f5c842' }} />
              <h2 className="font-bold text-sm">Live Leaderboard</h2>
              <span className="ml-auto text-[10px] text-muted-foreground">Updated every 30s</span>
            </div>

            {loadingLb ? (
              <div className="p-5 flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-muted-foreground">
                No participants yet this week. Be the first to trade in Arena.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <th className="text-center px-4 py-3 w-10">Rank</th>
                      <th className="text-left px-4 py-3">Trader</th>
                      <th className="text-right px-4 py-3">PnL %</th>
                      <th className="text-right px-4 py-3 hidden sm:table-cell">Trades</th>
                      <th className="text-right px-4 py-3 hidden md:table-cell">Win Rate</th>
                      <th className="text-right px-4 py-3 hidden sm:table-cell">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.userId}
                        className="transition-colors hover:bg-muted/30"
                        style={{
                          borderBottom: '1px solid hsl(var(--border))',
                          background: entry.isCurrentUser ? 'rgba(245,200,66,0.06)' : undefined,
                        }}
                      >
                        <td className="px-4 py-3 text-center">
                          <RankBadge rank={entry.rank} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                              style={{ background: entry.isCurrentUser ? 'rgba(245,200,66,0.2)' : 'hsl(var(--muted))', color: entry.isCurrentUser ? '#f5c842' : 'hsl(var(--foreground))' }}
                            >
                              {entry.username.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-xs truncate max-w-[100px]" style={{ color: entry.isCurrentUser ? '#f5c842' : undefined }}>
                              {entry.username}
                              {entry.isCurrentUser && <span className="ml-1 text-[9px] opacity-70">(you)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold" style={{ color: entry.pnlPct >= 0 ? '#4edea3' : '#ea3943' }}>
                          {fmtPnl(entry.pnlPct)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                          {entry.tradeCount}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                          {(entry.winRate * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          <RankDelta delta={entry.rankDelta} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Current user qualification status */}
                {currentUserRow && (
                  <div
                    className="px-5 py-3 text-xs"
                    style={{ borderTop: '1px solid hsl(var(--border))' }}
                  >
                    {currentUserRow.qualified ? (
                      <span style={{ color: '#4edea3' }}>Qualified for prizes</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Not qualified yet — need {myStats ? Math.max(0, 10 - myStats.tradeCount) : '...'} more trades and {myStats ? Math.max(0, 3 - myStats.symbolsTraded.length) : '...'} more symbols
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Past Winners */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <Award className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-bold text-sm">Past Winners</h2>
            </div>
            {loadingPast ? (
              <div className="p-5 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : pastWeeks.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No completed weeks yet.</div>
            ) : (
              <div className="p-5 grid grid-cols-2 gap-3">
                {pastWeeks.map((week) => (
                  <div
                    key={week.weekNumber}
                    className="rounded-lg p-4 flex flex-col gap-2"
                    style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Week #{week.weekNumber}</div>
                    {week.first && (
                      <div className="flex items-center gap-1.5">
                        <span>🥇</span>
                        <span className="font-semibold text-xs truncate">{week.first.username}</span>
                        <span className="ml-auto text-[10px] font-mono" style={{ color: '#4edea3' }}>{fmtPnl(week.first.pnlPct)}</span>
                      </div>
                    )}
                    {week.second && (
                      <div className="flex items-center gap-1.5">
                        <span>🥈</span>
                        <span className="font-semibold text-xs truncate">{week.second.username}</span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">{fmtPnl(week.second.pnlPct)}</span>
                      </div>
                    )}
                    {week.third && (
                      <div className="flex items-center gap-1.5">
                        <span>🥉</span>
                        <span className="font-semibold text-xs truncate">{week.third.username}</span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">{fmtPnl(week.third.pnlPct)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="flex flex-col gap-6">

          {/* Prize Pool */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <span className="text-base">🏆</span>
              <h2 className="font-bold text-sm">Prize Pool</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {PRIZE_TIERS.map((tier) => (
                <div
                  key={tier.label}
                  className="rounded-lg p-3 flex flex-col gap-1"
                  style={{ background: tier.bg, border: `1px solid ${tier.border}` }}
                >
                  <div className="text-base leading-none">{tier.icon}</div>
                  <div className="text-[10px] font-semibold text-muted-foreground mt-1">{tier.label}</div>
                  <div className="font-bold text-sm font-mono" style={{ color: tier.color }}>
                    {tier.amount.toLocaleString()} VUSDT
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Stats This Week */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <Target className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-bold text-sm">My Stats This Week</h2>
            </div>
            {loadingStats ? (
              <div className="p-5 flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : !myStats ? (
              <div className="p-5 text-sm text-muted-foreground text-center">
                <p>No arena trades yet.</p>
                <Link
                  href="/coin/BTCUSDT?tab=trade"
                  className="inline-block mt-3 px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(245,200,66,0.15)', color: '#f5c842', border: '1px solid rgba(245,200,66,0.35)' }}
                >
                  Start Trading
                </Link>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                <StatRow label="Trades" value={String(myStats.tradeCount)} />
                <StatRow label="Win Rate" value={`${(myStats.winRate * 100).toFixed(1)}%`} />
                <StatRow
                  label="Biggest Win"
                  value={fmtPnl(myStats.biggestWinPct)}
                  valueStyle={{ color: '#4edea3' }}
                />
                <StatRow
                  label="Biggest Loss"
                  value={fmtPnl(myStats.biggestLossPct)}
                  valueStyle={{ color: myStats.biggestLossPct < 0 ? '#ea3943' : undefined }}
                />
                <StatRow label="Symbols" value={myStats.symbolsTraded.slice(0, 3).join(', ') || '—'} />
                <StatRow label="PnL" value={fmtPnl(myStats.pnlPct)} valueStyle={{ color: myStats.pnlPct >= 0 ? '#4edea3' : '#ea3943', fontWeight: 700 }} />
                <div
                  className="mt-1 rounded-md px-3 py-2 text-xs text-center font-semibold"
                  style={
                    myStats.qualified
                      ? { background: 'rgba(78,222,163,0.1)', color: '#4edea3', border: '1px solid rgba(78,222,163,0.3)' }
                      : { background: 'rgba(139,143,168,0.1)', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }
                  }
                >
                  {myStats.qualified
                    ? 'Qualified for prizes'
                    : `${myStats.tradesNeeded} more trades · ${myStats.symbolsNeeded} more symbols to qualify`}
                </div>
              </div>
            )}
          </div>

          {/* Rules Card */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-bold text-sm">Rules</h2>
            </div>
            <ul className="p-5 flex flex-col gap-2.5 text-xs text-muted-foreground list-none">
              {[
                'Start every week with 10,000 AUSDT — fully reset each Monday.',
                'Min 10 trades and 3 distinct symbols to qualify for prizes.',
                'Payouts go to your main Portfolio as VUSDT.',
                'Copy trading is disabled inside Arena.',
                'One reward per user per week (highest rank achieved).',
                'Fees apply — same 0.1% rate as Portfolio mode.',
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(245,200,66,0.6)' }} />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes arenaPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #f5c842; }
          50% { opacity: 0.5; box-shadow: 0 0 4px #f5c842; }
        }
      `}</style>
    </div>
  );
}

function StatRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="flex items-center justify-between text-xs" style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: 8 }}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold font-mono" style={valueStyle}>{value}</span>
    </div>
  );
}
