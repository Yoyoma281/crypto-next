'use client';

import { useI18n } from '@/lib/i18n';
import { Trophy } from 'lucide-react';
import AuthGate from '@/components/auth-gate';

const PRIMARY = '#8ccdff';
const GREEN = '#42e09a';

const MEDALS = ['🥇', '🥈', '🥉'];

const ROWS = [
  { rank: 1, username: 'crypto_wolf', pnl: '+$4,821', pct: '+482.1%' },
  { rank: 2, username: 'moon_trader', pnl: '+$3,110', pct: '+311.0%' },
  { rank: 3, username: 'satoshi_99',  pnl: '+$2,890', pct: '+289.0%' },
  { rank: 4, username: 'eth_maxi',    pnl: '+$2,100', pct: '+210.0%' },
  { rank: 5, username: 'sol_rider',   pnl: '+$1,750', pct: '+175.0%' },
];

export default function LeaderboardAuthRequired() {
  const { t } = useI18n();
  return (
    <AuthGate title={t.leaderboard.signIn} description={t.leaderboard.signInSubtitle}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: PRIMARY }} />
          <span className="font-bold text-sm">All-Time Leaderboard</span>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {ROWS.map((row, i) => (
            <div key={row.rank} className={`flex items-center gap-4 px-5 py-3.5 ${i < ROWS.length - 1 ? 'border-b border-border/40' : ''}`}>
              <span className="w-7 text-center text-base shrink-0">
                {MEDALS[i] ?? <span className="text-xs font-bold text-muted-foreground">#{row.rank}</span>}
              </span>
              <span className="flex-1 font-bold text-sm">{row.username}</span>
              <div className="text-right">
                <div className="font-bold text-sm font-mono" style={{ color: GREEN }}>{row.pnl}</div>
                <div className="text-xs font-bold" style={{ color: GREEN }}>{row.pct}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGate>
  );
}
