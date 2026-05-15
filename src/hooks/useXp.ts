"use client";
import { useCallback, useEffect, useState } from "react";

interface XpData {
  xp: number;
  level: number;
  xpToNext: number;
  loginStreak: number;
  streak: number;
  streakClaimedToday: boolean;
  streakDayInCycle: number;
}

export function useXp() {
  const [data, setData] = useState<XpData | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/user/xp")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return data ? { ...data, refresh } : null;
}
