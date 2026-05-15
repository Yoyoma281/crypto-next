"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Trash2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Reaction {
  "👍": string[];
  "🔥": string[];
  "😮": string[];
}

interface Comment {
  _id: string;
  author: { _id: string; username: string; avatar?: string; level: number };
  text: string;
  reactions: Reaction;
  createdAt: string;
}

interface CommentSectionProps {
  targetType: string;
  targetId: string;
  initialCount?: number;
}

const EMOJIS: (keyof Reaction)[] = ["👍", "🔥", "😮"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
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

// ── Comment Card ──────────────────────────────────────────────────────────────
function CommentCard({
  comment,
  currentUserId,
  onReact,
  onDelete,
}: {
  comment: Comment;
  currentUserId: string | null;
  onReact: (commentId: string, emoji: keyof Reaction) => void;
  onDelete: (commentId: string) => void;
}) {
  const isAuthor = currentUserId && comment.author._id === currentUserId;

  return (
    <div
      className="rounded-xl px-4 py-3 flex flex-col gap-2"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Author row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "#dce1fb" }}>
            @{comment.author.username}
          </span>
          <LevelPill level={comment.author.level} />
          <span className="text-[10px]" style={{ color: "#45464d" }}>
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        {isAuthor && (
          <button
            onClick={() => onDelete(comment._id)}
            className="opacity-40 hover:opacity-80 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5" style={{ color: "#ef4444" }} />
          </button>
        )}
      </div>

      {/* Text */}
      <p className="text-sm leading-relaxed" style={{ color: "#b0b3c6" }}>
        {comment.text}
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-2">
        {EMOJIS.map((emoji) => {
          const users: string[] = comment.reactions?.[emoji] ?? [];
          const reacted = currentUserId ? users.includes(currentUserId) : false;
          return (
            <button
              key={emoji}
              onClick={() => onReact(comment._id, emoji)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: reacted ? "rgba(78,222,163,0.12)" : "rgba(255,255,255,0.04)",
                border: reacted ? "1px solid rgba(78,222,163,0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: reacted ? "#4edea3" : "#909097",
              }}
            >
              <span>{emoji}</span>
              {users.length > 0 && <span>{users.length}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CommentSection({ targetType, targetId, initialCount }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(initialCount ?? 0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const BASE = process.env.NEXT_PUBLIC_BASE_URL;

  // Get current user id from session
  useEffect(() => {
    fetch(`${BASE}/GetUserInfo`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user?._id) setCurrentUserId(data.user._id);
      })
      .catch(() => {});
  }, [BASE]);

  const loadComments = (p: number) => {
    setLoading(true);
    fetch(
      `${BASE}/comments?targetType=${targetType}&targetId=${targetId}&page=${p}&limit=20`,
      { credentials: "include" }
    )
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments ?? []);
        setTotal(data.total ?? 0);
        setPages(data.pages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, targetId]);

  const handlePost = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`${BASE}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, text: text.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [data.comment ?? data, ...prev]);
        setTotal((t) => t + 1);
        setText("");
      }
    } catch {}
    setPosting(false);
  };

  const handleReact = async (commentId: string, emoji: keyof Reaction) => {
    if (!currentUserId) return;
    // Optimistic toggle
    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const current = c.reactions?.[emoji] ?? [];
        const already = current.includes(currentUserId);
        return {
          ...c,
          reactions: {
            ...c.reactions,
            [emoji]: already
              ? current.filter((id) => id !== currentUserId)
              : [...current, currentUserId],
          } as Reaction,
        };
      })
    );
    try {
      await fetch(`${BASE}/comments/${commentId}/react`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {}
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`${BASE}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setTotal((t) => Math.max(0, t - 1));
      }
    } catch {}
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <h3 className="text-base font-bold" style={{ color: "#dce1fb" }}>
        Comments ({total})
      </h3>

      {/* Input */}
      {currentUserId && (
        <div className="flex flex-col gap-2">
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 300))}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
            style={{
              background: "#12121a",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#dce1fb",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePost();
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: text.length > 280 ? "#ef4444" : "#45464d" }}>
              {text.length}/300
            </span>
            <button
              onClick={handlePost}
              disabled={!text.trim() || posting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80 disabled:opacity-30"
              style={{ background: "#4edea3", color: "#0a0a0f" }}
            >
              <Send className="h-3 w-3" />
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-3 animate-pulse"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", height: 80 }}
            />
          ))
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: "#45464d" }}>
            No comments yet. Be the first to comment.
          </div>
        ) : (
          comments.map((c) => (
            <CommentCard
              key={c._id}
              comment={c}
              currentUserId={currentUserId}
              onReact={handleReact}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)", color: "#909097" }}
          >
            ← Prev
          </button>
          <span className="text-xs font-mono" style={{ color: "#45464d" }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)", color: "#909097" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
