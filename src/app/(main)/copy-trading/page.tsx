"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Copy,
  TrendingUp,
  TrendingDown,
  UserMinus,
  RefreshCw,
} from "lucide-react";

interface CopyLeader {
  leaderId: string;
  leaderUsername: string;
  leaderAvatar?: string;
  allocationPct: number;
  openPositions: number;
  since: string;
}

interface CopyPosition {
  _id: string;
  symbol: string;
  coinAmount: string;
  entryUsdAmount: string;
  currentWorth: string | null;
  pnl: string | null;
  leaderUsername: string;
  openedAt: string;
}

function fmtUSD(n: string | number | null) {
  if (n === null || n === undefined) return "—";
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CopyTradingPage() {
  const [following, setFollowing] = useState<CopyLeader[]>([]);
  const [positions, setPositions] = useState<CopyPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        fetch("/api/copy-trading/following"),
        fetch("/api/copy-trading/positions"),
      ]);
      const fData = fRes.ok ? await fRes.json() : { following: [] };
      const pData = pRes.ok ? await pRes.json() : { positions: [] };
      setFollowing(fData.following ?? []);
      setPositions(pData.positions ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUnfollow(leaderId: string) {
    setUnfollowingId(leaderId);
    try {
      const res = await fetch("/api/copy-trading/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderId }),
      });
      if (res.ok) {
        setFollowing((prev) => prev.filter((f) => f.leaderId !== leaderId));
      }
    } finally {
      setUnfollowingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Copy className="h-6 w-6" style={{ color: "#4edea3" }} />
          <div>
            <h1 className="text-2xl font-bold">Copy Trading</h1>
            <p className="text-sm text-muted-foreground">
              Automatically mirror top traders moves
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Who I'm copying */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Traders I'm Copying
        </h2>
        {following.length === 0 ? (
          <div
            className="rounded-xl px-6 py-12 text-center text-muted-foreground text-sm"
            style={{
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            You're not copying anyone yet.{" "}
            <Link
              href="/leaderboard"
              className="underline"
              style={{ color: "#4edea3" }}
            >
              Browse the leaderboard
            </Link>{" "}
            to get started.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {following.map((f) => (
              <div
                key={f.leaderId}
                className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                style={{
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              >
                <div className="flex items-center gap-3">
                  {f.leaderAvatar ? (
                    <img
                      src={f.leaderAvatar}
                      alt={f.leaderUsername}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: "hsl(var(--primary))" }}
                    >
                      {f.leaderUsername.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{f.leaderUsername}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.allocationPct}% allocation · {f.openPositions} open
                      position{f.openPositions !== 1 ? "s" : ""} · since{" "}
                      {fmtDate(f.since)}
                    </p>
                  </div>
                </div>
                <button
                  disabled={unfollowingId === f.leaderId}
                  onClick={() => handleUnfollow(f.leaderId)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
                  style={{
                    color: "#ffb3ad",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  <UserMinus className="h-3 w-3" />
                  Stop Copying
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open copy positions */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Open Copy Positions
        </h2>
        {positions.length === 0 ? (
          <div
            className="rounded-xl px-6 py-10 text-center text-muted-foreground text-sm"
            style={{
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            No open copy positions.
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                  style={{ borderBottom: "1px solid hsl(var(--border))" }}
                >
                  <th className="text-left px-5 py-3">Asset</th>
                  <th className="text-right px-5 py-3">Entry</th>
                  <th className="text-right px-5 py-3">Current</th>
                  <th className="text-right px-5 py-3">PnL</th>
                  <th className="text-left px-5 py-3 text-muted-foreground">
                    Copied from
                  </th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => {
                  const pnl = pos.pnl !== null ? Number(pos.pnl) : null;
                  const isUp = pnl !== null && pnl >= 0;
                  return (
                    <tr
                      key={pos._id}
                      className="transition-colors hover:bg-muted/40"
                      style={
                        i < positions.length - 1
                          ? { borderBottom: "1px solid hsl(var(--border))" }
                          : {}
                      }
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {pos.symbol.replace("USDT", "")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / USDT
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {pos.coinAmount.slice(0, 10)} coins
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm">
                        {fmtUSD(pos.entryUsdAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm">
                        {fmtUSD(pos.currentWorth)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm">
                        {pnl !== null ? (
                          <span
                            className="flex items-center justify-end gap-1"
                            style={{ color: isUp ? "#4edea3" : "#ffb3ad" }}
                          >
                            {isUp ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {isUp ? "+" : ""}
                            {fmtUSD(pnl)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {pos.leaderUsername}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
