'use client';

import { useEffect, useState } from 'react';
import { useArenaMode } from '@/contexts/ArenaModeContext';

const LS_KEY = 'crySer_arena_settled_seen';

interface Equity {
  pnlPct?: string | number;
}

interface MyStatsResponse {
  week?: { _id?: string };
  stats?: Record<string, unknown>;
  equity?: Equity;
  weekTradeCount?: number;
  weekSymbols?: string[];
  disqualified?: boolean;
}

interface Notification {
  type: string;
  title?: string;
  body?: string;
  createdAt?: string;
}

function parseRank(body: string): number | null {
  const m = body.match(/rank\s*#(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function parseEarned(body: string): string | null {
  const m = body.match(/earned\s+([\d,]+(?:\.\d+)?)\s*VUSDT/i);
  return m ? m[1].replace(/,/g, '') : null;
}

const CONFETTI_COLORS = [
  '#f5c842', '#4edea3', '#8ccdff', '#ea3943', '#a855f7',
  '#f97316', '#ffffff', '#ffb3ad', '#cd7f32', '#c0c0c0',
  '#4edea3', '#f5c842', '#8ccdff', '#ea3943', '#a855f7',
  '#f97316', '#4edea3', '#f5c842', '#8ccdff', '#ffb3ad',
];

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: '64px', lineHeight: 1 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: '64px', lineHeight: 1 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: '64px', lineHeight: 1 }}>🥉</span>;
  return (
    <div
      style={{
        fontSize: '48px',
        fontWeight: 900,
        color: '#f5c842',
        fontFamily: 'monospace',
        lineHeight: 1,
      }}
    >
      #{rank}
    </div>
  );
}

export default function ArenaSettlementModal() {
  const { weekInfo } = useArenaMode();
  const [visible, setVisible] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [pnlPct, setPnlPct] = useState<number>(0);
  const [earned, setEarned] = useState<string | null>(null);
  const [tradeCount, setTradeCount] = useState(0);
  const [symbolCount, setSymbolCount] = useState(0);
  const [weekId, setWeekId] = useState<string | null>(null);

  useEffect(() => {
    if (!weekInfo || weekInfo.status !== 'settled') return;

    const currentWeekId = weekInfo._id;
    const seen = localStorage.getItem(LS_KEY);
    if (seen === currentWeekId) return;

    let myStats: MyStatsResponse | null = null;
    let payoutNotif: Notification | null = null;

    const fetchStats = fetch('/api/arena/my-stats', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MyStatsResponse | null) => { myStats = d; })
      .catch(() => {});

    const fetchNotifs = fetch('/api/notifications?limit=5', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Notification[] | { notifications?: Notification[] }) => {
        const arr: Notification[] = Array.isArray(list)
          ? list
          : (list as { notifications?: Notification[] }).notifications ?? [];
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        payoutNotif = arr.find(
          (n) =>
            n.type === 'ARENA_PAYOUT' &&
            n.createdAt != null &&
            new Date(n.createdAt).getTime() > sevenDaysAgo
        ) ?? null;
      })
      .catch(() => {});

    Promise.all([fetchStats, fetchNotifs]).then(() => {
      if (!payoutNotif || !myStats) return;

      const body = payoutNotif.body ?? '';
      const parsedRank = parseRank(body);
      const parsedEarned = parseEarned(body);
      const equity = myStats.equity ?? {};
      const pct = parseFloat(String(equity.pnlPct ?? '0'));

      setRank(parsedRank);
      setPnlPct(pct);
      setEarned(parsedEarned);
      setTradeCount(myStats.weekTradeCount ?? 0);
      setSymbolCount((myStats.weekSymbols ?? []).length);
      setWeekId(currentWeekId);
      setVisible(true);
    });
  }, [weekInfo]);

  function handleClaim() {
    if (weekId) {
      localStorage.setItem(LS_KEY, weekId);
    }
    setVisible(false);
  }

  if (!visible || !weekInfo) return null;

  const pnlColor = pnlPct >= 0 ? '#4edea3' : '#ea3943';

  return (
    <>
      <style>{`
        @keyframes confettiFloat {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-340px) translateX(var(--tx)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes settlementFadeIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8, 10, 20, 0.88)',
          backdropFilter: 'blur(6px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClaim(); }}
      >
        {/* Confetti dots */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {CONFETTI_COLORS.map((color, i) => {
            const tx = (Math.random() * 400 - 200).toFixed(0) + 'px';
            const rot = (Math.random() * 720 - 360).toFixed(0) + 'deg';
            const left = (10 + Math.random() * 80).toFixed(0) + '%';
            const delay = (i * 0.12).toFixed(2) + 's';
            const size = 6 + Math.round(Math.random() * 8);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  bottom: '20%',
                  left,
                  width: size,
                  height: size,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  background: color,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--tx' as any]: tx,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--rot' as any]: rot,
                  animation: `confettiFloat 2.4s ease-out ${delay} both`,
                  opacity: 0,
                }}
              />
            );
          })}
        </div>

        {/* Modal card */}
        <div
          style={{
            position: 'relative',
            zIndex: 9999,
            background: 'linear-gradient(145deg, #14161f, #0e1020)',
            border: '1px solid rgba(245,200,66,0.35)',
            borderRadius: '20px',
            padding: '40px 36px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 0 60px rgba(245,200,66,0.15), 0 24px 80px rgba(0,0,0,0.6)',
            animation: 'settlementFadeIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Heading */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#f5c842',
                marginBottom: '6px',
              }}
            >
              Week #{weekInfo.weekNumber} Complete!
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#dce1fb',
                lineHeight: 1.2,
              }}
            >
              Your Final Results
            </div>
          </div>

          {/* Rank badge */}
          {rank !== null ? (
            <RankDisplay rank={rank} />
          ) : (
            <div style={{ fontSize: '48px', lineHeight: 1 }}>🏁</div>
          )}

          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              width: '100%',
            }}
          >
            <StatCell
              label="PnL"
              value={`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`}
              color={pnlColor}
            />
            {earned && (
              <StatCell
                label="Payout"
                value={`${parseFloat(earned).toLocaleString()} VUSDT`}
                color="#f5c842"
              />
            )}
            <StatCell label="Trades" value={String(tradeCount)} />
            <StatCell label="Symbols" value={String(symbolCount)} />
          </div>

          {/* CTA */}
          <button
            onClick={handleClaim}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #f5c842, #d4a017)',
              color: '#0b1222',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            Claim Rewards
            <span style={{ fontSize: '16px' }}>→</span>
          </button>

          <p style={{ fontSize: '11px', color: '#909097', margin: 0 }}>
            Rewards have been added to your Portfolio wallet
          </p>
        </div>
      </div>
    </>
  );
}

function StatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#909097' }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 800, color: color ?? '#dce1fb', fontFamily: 'monospace' }}>
        {value}
      </div>
    </div>
  );
}
