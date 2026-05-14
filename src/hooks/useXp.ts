"use client";
import { useEffect, useState } from "react";

interface XpData {
  xp: number;
  level: number;
  xpToNext: number;
  loginStreak: number;
}

export function useXp() {
  const [data, setData] = useState<XpData | null>(null);

  useEffect(() => {
    fetch("/api/user/xp")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, []);

  return data;
}
