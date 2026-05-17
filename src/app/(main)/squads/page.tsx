"use client";

import { useEffect, useState } from "react";
import { Users, Plus, X, Trophy, Crown, ChevronRight } from "lucide-react";

interface SquadMember {
  userId: string;
  username?: string;
  role: "leader" | "member";
  joinedAt: string;
  portfolioValue?: number;
}

interface Squad {
  _id: string;
  name: string;
  tag: string;
  emoji: string;
  description: string;
  memberCount: number;
  totalValue?: number;
  members?: SquadMember[];
}

function fmtValue(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CreateSquadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (squad: Squad) => void;
}) {
  const [form, setForm] = useState({ name: "", tag: "", emoji: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof typeof form, value: string) {
    if (field === "tag") value = value.toUpperCase().slice(0, 6);
    if (field === "name") value = value.slice(0, 40);
    if (field === "description") value = value.slice(0, 200);
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Squad name is required."); return; }
    if (!form.tag.trim()) { setError("Tag is required."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/squads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.squad ?? data);
      } else {
        setError(data.error ?? "Failed to create squad.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 flex flex-col gap-5"
        style={{ background: "#12121a", border: "1px solid #2e3447" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-[#dce1fb]">Create Squad</h2>
          <button onClick={onClose} className="text-[#909097] hover:text-[#dce1fb] text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-[#909097]">Squad Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="My Awesome Squad"
                maxLength={40}
                className="bg-[#1a2235] border border-[#2e3447] text-[#dce1fb] px-3 py-2 text-sm outline-none focus:border-[#4edea3] rounded-md w-full"
              />
              <span className="text-[10px] text-[#45464d] text-right">{form.name.length}/40</span>
            </div>
            <div className="flex flex-col gap-1 w-24">
              <label className="text-xs font-medium text-[#909097]">Tag</label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder="MOON"
                maxLength={6}
                className="bg-[#1a2235] border border-[#2e3447] text-[#dce1fb] px-3 py-2 text-sm outline-none focus:border-[#4edea3] rounded-md w-full font-mono font-bold tracking-widest"
              />
              <span className="text-[10px] text-[#45464d] text-right">{form.tag.length}/6</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#909097]">Emoji</label>
            <input
              type="text"
              value={form.emoji}
              onChange={(e) => setField("emoji", e.target.value)}
              placeholder="🚀"
              className="bg-[#1a2235] border border-[#2e3447] text-[#dce1fb] px-3 py-2 text-sm outline-none focus:border-[#4edea3] rounded-md w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#909097]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="What is your squad about?"
              maxLength={200}
              rows={3}
              className="bg-[#1a2235] border border-[#2e3447] text-[#dce1fb] px-3 py-2 text-sm outline-none focus:border-[#4edea3] rounded-md w-full resize-none"
            />
            <span className="text-[10px] text-[#45464d] text-right">{form.description.length}/200</span>
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-md" style={{ color: "#ffb3ad", background: "rgba(255,179,173,0.1)" }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-md text-sm font-bold transition disabled:opacity-50"
              style={{ background: "#4edea3", color: "#003824" }}
            >
              {loading ? "Creating..." : "Create Squad"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-md text-sm font-semibold transition"
              style={{ background: "rgba(255,255,255,0.06)", color: "#909097", border: "1px solid #2e3447" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DetailPanelProps {
  squad: Squad;
  onClose: () => void;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  joining: string | null;
}

function DetailPanel({ squad, onClose, onJoin, onLeave, joining }: DetailPanelProps) {
  const [detail, setDetail] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/squads/${squad._id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setDetail(d?.squad ?? d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [squad._id]);

  const members = detail?.members ?? [];
  const sorted = [...members].sort((a, b) => (b.portfolioValue ?? 0) - (a.portfolioValue ?? 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-2xl sm:rounded-xl flex flex-col overflow-hidden"
        style={{ background: "#12121a", border: "1px solid #2e3447" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e3447] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{squad.emoji || "🏆"}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#dce1fb]">{squad.name}</h2>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-widest"
                  style={{ background: "rgba(78,222,163,0.1)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.25)" }}
                >
                  [{squad.tag}]
                </span>
              </div>
              <p className="text-xs text-[#909097]">{squad.memberCount} members</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#909097] hover:text-[#dce1fb] text-xl leading-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        {squad.description && (
          <div className="px-6 py-3 border-b border-[#2e3447] shrink-0">
            <p className="text-xs text-[#909097]">{squad.description}</p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#909097] mb-3">Member Leaderboard</h3>
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg skeleton" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-[#45464d] text-center py-8">No members yet</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {sorted.map((member, rank) => (
                <li
                  key={member.userId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: "#0b1222", border: "1px solid #2e3447" }}
                >
                  <span
                    className="text-xs font-bold tabular-nums w-5 text-center shrink-0"
                    style={{ color: rank === 0 ? "#ffd700" : rank === 1 ? "#b9c7e0" : rank === 2 ? "#cd7f32" : "#45464d" }}
                  >
                    {rank === 0 ? <Crown className="h-3.5 w-3.5 inline" /> : `#${rank + 1}`}
                  </span>
                  <span className="flex-1 text-sm text-[#dce1fb] font-medium truncate">
                    {member.username ?? member.userId.slice(0, 8)}
                  </span>
                  {member.role === "leader" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(255,215,0,0.1)", color: "#ffd700" }}>
                      Leader
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#4edea3] tabular-nums">
                    {member.portfolioValue !== undefined ? fmtValue(member.portfolioValue) : "—"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Join / Leave */}
        <div className="px-6 py-4 border-t border-[#2e3447] shrink-0">
          <button
            onClick={() => onJoin(squad._id)}
            disabled={joining === squad._id}
            className="w-full px-4 py-2.5 rounded-md text-sm font-bold transition disabled:opacity-50"
            style={{ background: "#4edea3", color: "#003824" }}
          >
            {joining === squad._id ? "Joining..." : "Join Squad"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [joining, setJoining] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/squads")
      .then((r) => r.ok ? r.json() : { squads: [] })
      .then((d) => setSquads(Array.isArray(d) ? d : (d.squads ?? [])))
      .catch(() => setSquads([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin(id: string) {
    setJoining(id);
    setActionStatus(null);
    try {
      const res = await fetch(`/api/squads/${id}/join`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setActionStatus({ id, ok: true, msg: "Joined squad!" });
        setSquads((prev) =>
          prev.map((s) => s._id === id ? { ...s, memberCount: s.memberCount + 1 } : s)
        );
        setSelectedSquad(null);
      } else {
        setActionStatus({ id, ok: false, msg: data.error ?? "Failed to join." });
      }
    } catch {
      setActionStatus({ id, ok: false, msg: "Network error." });
    } finally {
      setJoining(null);
    }
  }

  async function handleLeave(id: string) {
    setJoining(id);
    setActionStatus(null);
    try {
      const res = await fetch(`/api/squads/${id}/leave`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionStatus({ id, ok: true, msg: "Left squad." });
        setSquads((prev) =>
          prev.map((s) => s._id === id ? { ...s, memberCount: Math.max(0, s.memberCount - 1) } : s)
        );
      } else {
        setActionStatus({ id, ok: false, msg: data.error ?? "Failed to leave." });
      }
    } catch {
      setActionStatus({ id, ok: false, msg: "Network error." });
    } finally {
      setJoining(null);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
            Community
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Squads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join a squad to compete, collaborate, and climb the leaderboard together.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold shrink-0 transition hover:opacity-90 active:scale-95"
          style={{ background: "#4edea3", color: "#003824" }}
        >
          <Plus className="h-4 w-4" />
          Create Squad
        </button>
      </div>

      {/* Squads grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl skeleton" />
          ))}
        </div>
      ) : squads.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center gap-4 py-16 px-6 text-center"
          style={{ border: "1px solid #2e3447", background: "hsl(var(--card))" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,222,163,0.1)" }}>
            <Users className="w-6 h-6" style={{ color: "#4edea3" }} />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">No squads yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to create one!</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-5 py-2.5 rounded-lg text-sm font-bold transition hover:opacity-90"
            style={{ background: "#4edea3", color: "#003824" }}
          >
            Create the first squad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map((squad) => {
            const status = actionStatus?.id === squad._id ? actionStatus : null;
            return (
              <div
                key={squad._id}
                className="rounded-xl p-5 flex flex-col gap-4 group hover:border-[#4edea3]/30 transition-colors"
                style={{ border: "1px solid #2e3447", background: "hsl(var(--card))" }}
              >
                {/* Top: emoji + name + tag */}
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none shrink-0">{squad.emoji || "🏆"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-sm text-foreground truncate">{squad.name}</h2>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-widest shrink-0"
                        style={{ background: "rgba(78,222,163,0.1)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.2)" }}
                      >
                        [{squad.tag}]
                      </span>
                    </div>
                    {squad.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{squad.description}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {squad.memberCount} member{squad.memberCount !== 1 ? "s" : ""}
                  </span>
                  {squad.totalValue !== undefined && (
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" style={{ color: "#ffd700" }} />
                      {fmtValue(squad.totalValue)}
                    </span>
                  )}
                </div>

                {status && (
                  <p
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      color: status.ok ? "#4edea3" : "#ffb3ad",
                      background: status.ok ? "rgba(78,222,163,0.1)" : "rgba(255,179,173,0.1)",
                    }}
                  >
                    {status.msg}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setSelectedSquad(squad)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition flex-1 justify-center"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#909097", border: "1px solid #2e3447" }}
                  >
                    View
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleJoin(squad._id)}
                    disabled={joining === squad._id}
                    className="flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition disabled:opacity-50"
                    style={{ background: "rgba(78,222,163,0.12)", color: "#4edea3", border: "1px solid rgba(78,222,163,0.25)" }}
                  >
                    {joining === squad._id ? "Joining..." : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {createOpen && (
        <CreateSquadModal
          onClose={() => setCreateOpen(false)}
          onCreated={(squad) => {
            setSquads((prev) => [squad, ...prev]);
            setCreateOpen(false);
          }}
        />
      )}

      {selectedSquad && (
        <DetailPanel
          squad={selectedSquad}
          onClose={() => setSelectedSquad(null)}
          onJoin={handleJoin}
          onLeave={handleLeave}
          joining={joining}
        />
      )}
    </div>
  );
}
