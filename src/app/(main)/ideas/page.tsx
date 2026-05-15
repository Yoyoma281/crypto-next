"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { TrendingUp, Heart, MessageCircle, Plus, Search, X } from "lucide-react";
import CreateIdeaModal from "@/components/CreateIdeaModal";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface TradeIdea {
  _id: string;
  author: { _id: string; username: string; avatar?: string; level: number };
  symbol: string;
  direction: "LONG" | "SHORT";
  thesis: string;
  targetPrice: number;
  stopLoss: number;
  entryPrice: number;
  resolved: boolean;
  outcome: "WIN" | "LOSS" | null;
  likes: string[];
  commentCount: number;
  createdAt: string;
  resolvedAt?: string;
  isLiked: boolean;
}

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

// ── Idea Card ─────────────────────────────────────────────────────────────────
function IdeaCard({
  idea,
  onLike,
}: {
  idea: TradeIdea;
  onLike: (id: string) => void;
}) {
  const isLong = idea.direction === "LONG";
  const dirColor = isLong ? "#00d4aa" : "#ef4444";
  const truncatedThesis =
    idea.thesis.length > 120 ? idea.thesis.slice(0, 120) + "..." : idea.thesis;

  return (
    <div
      className="rounded-xl px-4 py-4 flex flex-col gap-3 transition-colors hover:bg-white/[0.02] group"
      style={{
        background: "#12121a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Top row: direction + symbol + meta */}
      <div className="flex items-start gap-3">
        {/* Direction badge */}
        <span
          className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider"
          style={{
            background: isLong ? "rgba(0,212,170,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${dirColor}40`,
            color: dirColor,
          }}
        >
          {idea.direction}
        </span>

        {/* Symbol + author */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: "#dce1fb" }}>
              {idea.symbol.replace("_", "/")}
            </span>
            {idea.resolved && idea.outcome && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase"
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
            <span className="text-xs" style={{ color: "#909097" }}>
              @{idea.author.username}
            </span>
            <LevelPill level={idea.author.level} />
            <span className="text-[10px]" style={{ color: "#45464d" }}>
              · {timeAgo(idea.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Thesis */}
      <Link href={`/ideas/${idea._id}`}>
        <p className="text-sm leading-relaxed" style={{ color: "#b0b3c6" }}>
          {truncatedThesis}
        </p>
      </Link>

      {/* Price targets */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
            Entry
          </span>
          <span className="text-xs font-mono font-semibold" style={{ color: "#dce1fb" }}>
            ${fmtPrice(idea.entryPrice)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
            Target
          </span>
          <span className="text-xs font-mono font-semibold" style={{ color: "#00d4aa" }}>
            ${fmtPrice(idea.targetPrice)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
            Stop
          </span>
          <span className="text-xs font-mono font-semibold" style={{ color: "#ef4444" }}>
            ${fmtPrice(idea.stopLoss)}
          </span>
        </div>
      </div>

      {/* Bottom: like + comments */}
      <div className="flex items-center gap-4 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            onLike(idea._id);
          }}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: idea.isLiked ? "#ef4444" : "#909097" }}
        >
          <Heart
            className="h-3.5 w-3.5"
            fill={idea.isLiked ? "#ef4444" : "none"}
          />
          <span>{idea.likes.length}</span>
        </button>

        <Link
          href={`/ideas/${idea._id}`}
          className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
          style={{ color: "#909097" }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{idea.commentCount}</span>
        </Link>

        <Link
          href={`/ideas/${idea._id}`}
          className="ml-auto text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#4edea3" }}
        >
          View full idea →
        </Link>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function IdeaSkeleton() {
  return (
    <div
      className="rounded-xl px-4 py-4 flex flex-col gap-3 animate-pulse"
      style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-6 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="flex flex-col gap-1 flex-1">
          <div className="w-24 h-4 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="w-36 h-3 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-3 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="w-3/4 h-3 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
      <div className="flex gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="w-10 h-2 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="w-16 h-3 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function IdeasPage() {
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [symbolFilter, setSymbolFilter] = useState("");
  const [symbolInput, setSymbolInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const LIMIT = 20;

  const loadIdeas = useCallback(async (p: number, sym: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (sym) params.set("symbol", sym.toUpperCase().replace("/", "_"));
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ideas?${params}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setIdeas(data.ideas ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      setIdeas([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadIdeas(page, symbolFilter);
  }, [page, symbolFilter, loadIdeas]);

  const handleLike = async (ideaId: string) => {
    // Optimistic update
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea._id !== ideaId) return idea;
        const wasLiked = idea.isLiked;
        return {
          ...idea,
          isLiked: !wasLiked,
          likes: wasLiked
            ? idea.likes.slice(0, -1)
            : [...idea.likes, "optimistic"],
        };
      })
    );
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/ideas/${ideaId}/like`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // revert on error
      loadIdeas(page, symbolFilter);
    }
  };

  const handleCreated = (newIdea: TradeIdea) => {
    setIdeas((prev) => [newIdea, ...prev]);
    setTotal((t) => t + 1);
  };

  const applyFilter = () => {
    setPage(1);
    setSymbolFilter(symbolInput.trim());
  };

  const clearFilter = () => {
    setSymbolFilter("");
    setSymbolInput("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6" style={{ color: "#4edea3" }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#dce1fb" }}>
              Trade Ideas
            </h1>
            <p className="text-sm" style={{ color: "#909097" }}>
              {total > 0 ? `${total} community trade calls` : "Community trade calls"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: "#4edea3", color: "#0a0a0f" }}
        >
          <Plus className="h-4 w-4" />
          Post Idea
        </button>
      </div>

      {/* Symbol filter */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilter();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: "#45464d" }}
          />
          <input
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            placeholder="Filter by symbol, e.g. BTC_USDT"
            className="pl-8 pr-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "#12121a",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#dce1fb",
              width: "220px",
            }}
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: "rgba(78,222,163,0.12)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.25)" }}
        >
          Filter
        </button>
        {symbolFilter && (
          <button
            type="button"
            onClick={clearFilter}
            className="flex items-center gap-1 px-2 py-2 rounded-lg text-xs transition-opacity hover:opacity-70"
            style={{ color: "#909097" }}
          >
            <X className="h-3 w-3" />
            {symbolFilter}
          </button>
        )}
      </form>

      {/* Feed */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <IdeaSkeleton key={i} />)
        ) : ideas.length === 0 ? (
          <div
            className="rounded-xl px-6 py-16 flex flex-col items-center gap-4 text-center"
            style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <TrendingUp className="h-10 w-10" style={{ color: "#45464d" }} />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold" style={{ color: "#dce1fb" }}>
                No trade ideas yet
              </span>
              <span className="text-xs" style={{ color: "#909097" }}>
                {symbolFilter
                  ? `No ideas for ${symbolFilter}. Try a different symbol.`
                  : "Be the first to post a trade idea."}
              </span>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: "#4edea3", color: "#0a0a0f" }}
            >
              Post First Idea
            </button>
          </div>
        ) : (
          ideas.map((idea) => (
            <IdeaCard key={idea._id} idea={idea} onLike={handleLike} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)", color: "#909097" }}
          >
            ← Prev
          </button>
          <span className="text-sm font-mono" style={{ color: "#45464d" }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)", color: "#909097" }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Create modal */}
      <CreateIdeaModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
