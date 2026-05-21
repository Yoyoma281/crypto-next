"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords, Clock, TrendingUp, TrendingDown, X } from "lucide-react";
import { useArenaMode } from "@/contexts/ArenaModeContext";

interface ArenaStats {
  totalUsdt: number;
  pnlPct: number;
}

export default function ArenaModeBanner() {
  const { activeMode, setActiveMode, weekInfo, countdown } = useArenaMode();
  const [stats, setStats] = useState<ArenaStats | null>(null);

  // Fetch arena balance + PnL when in arena mode; refresh every 20s
  useEffect(() => {
    if (activeMode !== "arena") return;
    let cancelled = false;

    const load = () => {
      fetch("/api/arena/portfolio", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (cancelled || !d) return;
          setStats({
            totalUsdt: parseFloat(d.totalUsdt ?? "0"),
            pnlPct: parseFloat(d.pnlPct ?? "0"),
          });
        })
        .catch(() => {});
    };

    load();
    const id = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activeMode]);

  if (activeMode !== "arena") return null;

  const pnlUp = (stats?.pnlPct ?? 0) >= 0;
  const pnlColor = pnlUp ? "#4edea3" : "#ea3943";

  return (
    <div
      className="sticky top-[42px] md:top-[48px] z-40 w-full"
      style={{
        background:
          "linear-gradient(90deg, rgba(245,200,66,0.18) 0%, rgba(245,200,66,0.08) 50%, rgba(245,200,66,0.18) 100%)",
        borderBottom: "1px solid rgba(245,200,66,0.45)",
        boxShadow: "0 2px 12px rgba(245,200,66,0.12)",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-3 md:px-5 py-1.5 md:py-2 flex items-center gap-2 md:gap-4 flex-wrap">
        {/* Left: mode badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: "#f5c842",
              boxShadow: "0 0 8px #f5c842",
              animation: "arenaBannerDot 1.6s ease-in-out infinite",
            }}
          />
          <Swords className="h-3.5 w-3.5" style={{ color: "#f5c842" }} />
          <span
            className="text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest"
            style={{ color: "#f5c842" }}
          >
            Arena Mode
          </span>
        </div>

        {/* Middle: countdown + balance + pnl */}
        <div className="flex items-center gap-3 md:gap-5 flex-wrap text-[11px] md:text-xs">
          {weekInfo && (
            <span className="flex items-center gap-1.5 font-mono" style={{ color: "#f5c842" }}>
              <Clock className="h-3 w-3" />
              <span className="opacity-80">W#{weekInfo.weekNumber}</span>
              <span className="font-semibold">{countdown}</span>
            </span>
          )}

          {stats && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1.5 font-mono">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-bold text-foreground">
                  {stats.totalUsdt.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="opacity-70 text-[10px]">AUSDT</span>
                </span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 font-mono font-bold" style={{ color: pnlColor }}>
                {pnlUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {pnlUp ? "+" : ""}
                {stats.pnlPct.toFixed(2)}%
              </span>
            </>
          )}
        </div>

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link
            href="/arena"
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
            style={{
              color: "#f5c842",
              border: "1px solid rgba(245,200,66,0.4)",
            }}
          >
            View Arena
          </Link>
          <button
            onClick={() => setActiveMode("portfolio")}
            title="Switch to Portfolio"
            className="flex items-center gap-1 text-[10px] md:text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded-md"
          >
            <X className="h-3 w-3" />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes arenaBannerDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
