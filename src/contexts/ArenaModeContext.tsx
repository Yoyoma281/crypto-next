'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WeekInfo {
  _id: string;
  weekNumber: number;
  startAt: string;
  endAt: string;
  status: string;
  prizePool: Record<string, number>;
}

interface ArenaModeContextValue {
  activeMode: 'portfolio' | 'arena';
  setActiveMode: (mode: 'portfolio' | 'arena') => void;
  weekInfo: WeekInfo | null;
  countdown: string;
  refreshWeek: () => void;
}

const LS_KEY = 'crySer_activeMode';

export const ArenaModeContext = createContext<ArenaModeContextValue>({
  activeMode: 'portfolio',
  setActiveMode: () => {},
  weekInfo: null,
  countdown: '',
  refreshWeek: () => {},
});

function buildCountdown(endAt: string): string {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const totalMinutes = Math.floor(diff / 60000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  parts.push(`${String(m).padStart(2, '0')}m`);
  return parts.join(' ');
}

export function ArenaModeProvider({ children }: { children: ReactNode }) {
  const [activeMode, setActiveModeState] = useState<'portfolio' | 'arena'>(() => {
    if (typeof window === 'undefined') return 'portfolio';
    const stored = localStorage.getItem(LS_KEY);
    return stored === 'arena' ? 'arena' : 'portfolio';
  });
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [countdown, setCountdown] = useState('');

  const refreshWeek = useCallback(() => {
    fetch('/api/arena/week', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { week: WeekInfo } | null) => {
        const week = data?.week ?? null;
        if (week) {
          setWeekInfo(week);
          setCountdown(buildCountdown(week.endAt));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshWeek();
  }, [refreshWeek]);

  useEffect(() => {
    if (!weekInfo?.endAt) return;
    const id = setInterval(() => {
      setCountdown(buildCountdown(weekInfo.endAt));
    }, 60000);
    return () => clearInterval(id);
  }, [weekInfo?.endAt]);

  const setActiveMode = useCallback((mode: 'portfolio' | 'arena') => {
    setActiveModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEY, mode);
    }
    fetch('/api/arena/mode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mode }),
    }).catch(() => {});
  }, []);

  return (
    <ArenaModeContext.Provider value={{ activeMode, setActiveMode, weekInfo, countdown, refreshWeek }}>
      {children}
    </ArenaModeContext.Provider>
  );
}

export function useArenaMode() {
  return useContext(ArenaModeContext);
}
