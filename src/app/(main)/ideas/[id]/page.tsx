"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft, MessageCircle } from "lucide-react";
import CommentSection from "@/components/CommentSection";
import type { TradeIdea } from "../page";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtPrice(n: number) {
  if (!n && n !== 0) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

function LevelPill({ level }: { level: number }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded font-black text-[10px] leading-none shrink-0"
      style={{
        background: "rgba(78,222,163,0.15)",
        border: "1px solid rgba(78,222,163,0.30)",
        color: "#4edea3",
      }}
    >
      Lv.{level}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function IdeaDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="w-20 h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div
        className="rounded-xl px-5 py-5 flex flex-col gap-4 animate-pulse"
        style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex gap-3">
          <div className="w-16 h-7 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="w-28 h-4 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="w-40 h-3 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full h-3 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Price stat block ──────────────────────────────────────────────────────────
function PriceStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="flex-1 flex flex-col gap-1 px-4 py-3 rounded-lg"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
        {label}
      </span>
      <span className="text-base font-mono font-bold" style={{ color: color ?? "#dce1fb" }}>
        ${value}
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<TradeIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/ideas/${id}`, {
      credentials: "include",
    })
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        if (data) setIdea(data.idea ?? data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    if (!idea) return;
    // Optimistic
    setIdea((prev) => {
      if (!prev) return prev;
      const wasLiked = prev.isLiked;
      return {
        ...prev,
        isLiked: !wasLiked,
        likes: wasLiked ? prev.likes.slice(0, -1) : [...prev.likes, "opt"],
      };
    });
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/ideas/${idea._id}/like`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // silent — state may be slightly off
    }
  };

  if (loading) return <IdeaDetailSkeleton />;

  if (notFound || !idea) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <span className="text-4xl">404</span>
        <p className="text-sm" style={{ color: "#909097" }}>
          This trade idea was not found or was deleted.
        </p>
        <Link href="/ideas" className="text-sm font-semibold" style={{ color: "#4edea3" }}>
          ← Back to Ideas
        </Link>
      </div>
    );
  }

  const isLong = idea.direction === "LONG";
  const dirColor = isLong ? "#00d4aa" : "#ef4444";

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/ideas"
        className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70 w-fit"
        style={{ color: "#909097" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ideas
      </Link>

      {/* Idea card — full */}
      <div
        className="rounded-xl px-5 py-5 flex flex-col gap-4"
        style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header row */}
        <div className="flex items-start gap-3">
          <span
            className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-md text-sm font-black uppercase tracking-wider"
            style={{
              background: isLong ? "rgba(0,212,170,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${dirColor}40`,
              color: dirColor,
            }}
          >
            {idea.direction}
          </span>

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg" style={{ color: "#dce1fb" }}>
                {idea.symbol.replace("_", "/")}
              </span>
              {idea.resolved && idea.outcome && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black uppercase"
                  style={{
                    background:
                      idea.outcome === "WIN"
                        ? "rgba(0,212,170,0.15)"
                        : "rgba(239,68,68,0.15)",
                    color: idea.outcome === "WIN" ? "#00d4aa" : "#ef4444",
                    border: `1px solid ${idea.outcome === "WIN" ? "#00d4aa" : "#ef4444"}40`,
                  }}
                >
                  {idea.outcome}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: "#b0b3c6" }}>
                @{idea.author.username}
              </span>
              <LevelPill level={idea.author.level} />
              <span className="text-xs" style={{ color: "#45464d" }}>
                · {timeAgo(idea.createdAt)}
              </span>
              {idea.resolved && idea.resolvedAt && (
                <span className="text-xs" style={{ color: "#45464d" }}>
                  · Resolved {timeAgo(idea.resolvedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thesis — full, no truncation */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#b0b3c6" }}>
          {idea.thesis}
        </p>

        {/* Price targets */}
        <div className="flex gap-3 flex-wrap">
          <PriceStat label="Entry" value={fmtPrice(idea.entryPrice)} />
          <PriceStat label="Target" value={fmtPrice(idea.targetPrice)} color="#00d4aa" />
          <PriceStat label="Stop Loss" value={fmtPrice(idea.stopLoss)} color="#ef4444" />
        </div>

        {/* Like + comments row */}
        <div
          className="flex items-center gap-4 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: idea.isLiked ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${idea.isLiked ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: idea.isLiked ? "#ef4444" : "#909097",
            }}
          >
            <Heart
              className="h-4 w-4"
              fill={idea.isLiked ? "#ef4444" : "none"}
            />
            <span>{idea.likes.length} {idea.likes.length === 1 ? "like" : "likes"}</span>
          </button>

          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#909097" }}>
            <MessageCircle className="h-4 w-4" />
            <span>{idea.commentCount} comments</span>
          </div>
        </div>
      </div>

      {/* Comment section */}
      <CommentSection
        targetType="TradeIdea"
        targetId={id}
        initialCount={idea.commentCount}
      />
    </div>
  );
}
