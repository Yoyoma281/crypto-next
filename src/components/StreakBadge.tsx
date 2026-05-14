"use client";

import { Flame } from "lucide-react";

interface Props {
  streak: number;
}

export default function StreakBadge({ streak }: Props) {
  if (streak < 2) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold text-[10px] leading-none"
      style={{
        background: "rgba(255,179,173,0.12)",
        border: "1px solid rgba(255,179,173,0.25)",
        color: "#ffb3ad",
      }}
    >
      <Flame className="h-2.5 w-2.5 shrink-0" />
      {streak}d
    </span>
  );
}
