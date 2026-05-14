"use client";

interface Props {
  level: number;
  xp: number;
  xpToNext: number;
  size?: "sm" | "md";
}

export default function LevelBadge({ level, xp, xpToNext, size = "sm" }: Props) {
  const fillPct = xpToNext > 0 ? Math.min(100, (xp / (xp + xpToNext)) * 100) : 100;

  if (size === "sm") {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded font-black text-[10px] leading-none"
          style={{
            background: "rgba(78,222,163,0.15)",
            border: "1px solid rgba(78,222,163,0.30)",
            color: "#4edea3",
          }}
        >
          Lv.{level}
        </span>
        <div
          className="w-12 h-0.5 rounded-full"
          style={{ background: "#2e3447" }}
        >
          <div
            className="h-0.5 rounded-full"
            style={{ width: `${fillPct}%`, background: "#4edea3" }}
          />
        </div>
      </div>
    );
  }

  // md size
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md font-black text-xs leading-none"
          style={{
            background: "rgba(78,222,163,0.15)",
            border: "1px solid rgba(78,222,163,0.30)",
            color: "#4edea3",
          }}
        >
          Lv.{level}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {xp} / {xp + xpToNext} XP
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full"
        style={{ background: "#2e3447" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${fillPct}%`, background: "#4edea3" }}
        />
      </div>
    </div>
  );
}
