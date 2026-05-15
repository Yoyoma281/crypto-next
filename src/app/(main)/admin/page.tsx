"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Trophy,
  Swords,
  Plus,
  StopCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

// ── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalValue: number;
  level?: number;
  avatar?: string;
  joinDate?: string;
}

interface Season {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "ended" | "upcoming";
  prizes?: { rank: string; xp: number; vusdt: number }[];
}

interface Tournament {
  _id: string;
  name: string;
  description?: string;
  symbol: string;
  startDate: string;
  endDate: string;
  participantCount?: number;
  status: "upcoming" | "active" | "ended";
  startingBalance?: number;
  prizePool?: { rank: number; reward: number }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtUSD(n: number) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    active: { bg: "rgba(78,222,163,0.12)", color: "#4edea3" },
    ended: { bg: "rgba(255,179,173,0.12)", color: "#ffb3ad" },
    upcoming: { bg: "rgba(140,205,255,0.12)", color: "#8ccdff" },
  };
  const c = colors[status] ?? { bg: "rgba(144,144,151,0.12)", color: "#909097" };
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        background: c.bg,
        color: c.color,
      }}
    >
      {status}
    </span>
  );
}

// ── Tab: Users ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/leaderboard`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list: LeaderboardEntry[] = d?.leaderboard ?? [];
        setUsers(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 size={24} style={{ color: "#4edea3", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid #2e3447",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr
            style={{
              background: "#191f31",
              borderBottom: "1px solid #2e3447",
            }}
          >
            {["#", "User", "Level", "Portfolio Value", "Actions"].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "10px 16px",
                  textAlign: i >= 3 ? "right" : "left",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#909097",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "48px 16px",
                  color: "#909097",
                  fontSize: "14px",
                }}
              >
                No users found
              </td>
            </tr>
          ) : (
            users.map((u, i) => {
              const initials = u.username.slice(0, 2).toUpperCase();
              const pnl = u.totalValue - 1000;
              const isUp = pnl >= 0;
              return (
                <tr
                  key={u.userId}
                  style={{
                    borderBottom: i < users.length - 1 ? "1px solid #1e2435" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "#191f31";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  }}
                >
                  <td style={{ padding: "12px 16px", color: "#909097", fontWeight: 700 }}>
                    #{i + 1}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.username}
                          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "hsl(var(--primary))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      <span style={{ fontWeight: 600, color: "#dce1fb" }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "rgba(140,205,255,0.12)",
                        color: "#8ccdff",
                      }}
                    >
                      Lv {u.level ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#dce1fb" }}>
                      {fmtUSD(u.totalValue)}
                    </span>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: isUp ? "#4edea3" : "#ffb3ad",
                      }}
                    >
                      {isUp ? "+" : ""}
                      {((pnl / 1000) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href={`/u/${u.username}`}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "7px",
                        border: "1px solid #2e3447",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#8ccdff",
                        textDecoration: "none",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#8ccdff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#2e3447";
                      }}
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Season Form ───────────────────────────────────────────────────────────────

interface SeasonFormData {
  name: string;
  startDate: string;
  endDate: string;
  goldXp: string;
  goldVusdt: string;
  silverXp: string;
  silverVusdt: string;
  bronzeXp: string;
  bronzeVusdt: string;
}

const EMPTY_SEASON: SeasonFormData = {
  name: "",
  startDate: "",
  endDate: "",
  goldXp: "500",
  goldVusdt: "200",
  silverXp: "300",
  silverVusdt: "100",
  bronzeXp: "100",
  bronzeVusdt: "50",
};

function SeasonForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState<SeasonFormData>(EMPTY_SEASON);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(k: keyof SeasonFormData, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/seasons`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
          prizes: [
            { rank: "Gold", xp: Number(form.goldXp), vusdt: Number(form.goldVusdt) },
            { rank: "Silver", xp: Number(form.silverXp), vusdt: Number(form.silverVusdt) },
            { rank: "Bronze", xp: Number(form.bronzeXp), vusdt: Number(form.bronzeVusdt) },
          ],
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.message ?? "Failed to create season");
      } else {
        setForm(EMPTY_SEASON);
        onCreated();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #2e3447",
    background: "#0c1324",
    color: "#dce1fb",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#909097",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Season Name</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Spring 2026"
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            style={inputStyle}
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            style={inputStyle}
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Prize distribution */}
      <div>
        <label style={{ ...labelStyle, marginBottom: "8px" }}>Prize Distribution</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(
            [
              { rank: "Gold", xpKey: "goldXp", vusdtKey: "goldVusdt", color: "#f5c842" },
              { rank: "Silver", xpKey: "silverXp", vusdtKey: "silverVusdt", color: "#b9c7e0" },
              { rank: "Bronze", xpKey: "bronzeXp", vusdtKey: "bronzeVusdt", color: "#cd7f32" },
            ] as const
          ).map(({ rank, xpKey, vusdtKey, color }) => (
            <div
              key={rank}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 1fr",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 700, color }}>{rank}</span>
              <div>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  placeholder="XP"
                  value={form[xpKey]}
                  onChange={(e) => update(xpKey, e.target.value)}
                />
              </div>
              <div>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  placeholder="VUSDT"
                  value={form[vusdtKey]}
                  onChange={(e) => update(vusdtKey, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(255,179,173,0.1)",
            border: "1px solid rgba(255,179,173,0.3)",
            color: "#ffb3ad",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: loading ? "rgba(78,222,163,0.3)" : "#4edea3",
          color: "#0b1222",
          fontSize: "13px",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          alignSelf: "flex-start",
        }}
      >
        {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
        {loading ? "Creating..." : "Create Season"}
      </button>
    </form>
  );
}

// ── Tab: Seasons ──────────────────────────────────────────────────────────────

function SeasonsTab() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [endingId, setEndingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch(`${BASE_URL}/seasons`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSeasons(Array.isArray(d) ? d : d?.seasons ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleEnd(id: string) {
    if (!confirm("End this season? This action is permanent.")) return;
    setEndingId(id);
    try {
      await fetch(`${BASE_URL}/seasons/${id}/end`, {
        method: "POST",
        credentials: "include",
      });
      load();
    } catch {
      // ignore
    } finally {
      setEndingId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Create form toggle */}
      <div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #4edea3",
            background: showForm ? "rgba(78,222,163,0.12)" : "transparent",
            color: "#4edea3",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Plus size={14} />
          Create Season
          {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showForm && (
          <div
            style={{
              marginTop: "12px",
              padding: "20px",
              background: "#12121a",
              border: "1px solid #2e3447",
              borderRadius: "12px",
            }}
          >
            <SeasonForm
              onCreated={() => {
                setShowForm(false);
                load();
              }}
            />
          </div>
        )}
      </div>

      {/* Seasons list */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <Loader2 size={24} style={{ color: "#4edea3", animation: "spin 1s linear infinite" }} />
        </div>
      ) : seasons.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            color: "#909097",
            fontSize: "14px",
            background: "#12121a",
            border: "1px solid #2e3447",
            borderRadius: "12px",
          }}
        >
          No seasons yet. Create your first one above.
        </div>
      ) : (
        <div
          style={{
            background: "#12121a",
            border: "1px solid #2e3447",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#191f31", borderBottom: "1px solid #2e3447" }}>
                {["Name", "Start", "End", "Status", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: i === 4 ? "right" : "left",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#909097",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seasons.map((s, i) => (
                <tr
                  key={s._id}
                  style={{
                    borderBottom: i < seasons.length - 1 ? "1px solid #1e2435" : "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "#191f31";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#dce1fb" }}>
                    {s.name}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#909097" }}>{fmtDate(s.startDate)}</td>
                  <td style={{ padding: "12px 16px", color: "#909097" }}>{fmtDate(s.endDate)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusPill status={s.status} />
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {s.status === "active" && (
                      <button
                        onClick={() => handleEnd(s._id)}
                        disabled={endingId === s._id}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "7px",
                          border: "1px solid rgba(255,179,173,0.4)",
                          background: "rgba(255,179,173,0.08)",
                          color: "#ffb3ad",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: endingId === s._id ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          opacity: endingId === s._id ? 0.6 : 1,
                        }}
                      >
                        <StopCircle size={12} />
                        End Season
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tournament Form ───────────────────────────────────────────────────────────

interface TournamentFormData {
  name: string;
  description: string;
  symbol: string;
  startDate: string;
  endDate: string;
  startingBalance: string;
  prize1: string;
  prize2: string;
  prize3: string;
}

const EMPTY_TOURNAMENT: TournamentFormData = {
  name: "",
  description: "",
  symbol: "BTCUSDT",
  startDate: "",
  endDate: "",
  startingBalance: "1000",
  prize1: "500",
  prize2: "200",
  prize3: "100",
};

function TournamentForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState<TournamentFormData>(EMPTY_TOURNAMENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(k: keyof TournamentFormData, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/tournaments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          symbol: form.symbol.toUpperCase(),
          startDate: form.startDate,
          endDate: form.endDate,
          startingBalance: Number(form.startingBalance),
          prizePool: [
            { rank: 1, reward: Number(form.prize1) },
            { rank: 2, reward: Number(form.prize2) },
            { rank: 3, reward: Number(form.prize3) },
          ],
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.message ?? "Failed to create tournament");
      } else {
        setForm(EMPTY_TOURNAMENT);
        onCreated();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #2e3447",
    background: "#0c1324",
    color: "#dce1fb",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#909097",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Tournament Name</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. BTC Championship"
            required
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Description</label>
          <input
            style={inputStyle}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <div>
          <label style={labelStyle}>Symbol</label>
          <input
            style={inputStyle}
            value={form.symbol}
            onChange={(e) => update("symbol", e.target.value)}
            placeholder="BTCUSDT"
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Starting Balance (VUSDT)</label>
          <input
            type="number"
            min={1}
            style={inputStyle}
            value={form.startingBalance}
            onChange={(e) => update("startingBalance", e.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            style={inputStyle}
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            style={inputStyle}
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Prize pool */}
      <div>
        <label style={{ ...labelStyle, marginBottom: "8px" }}>Prize Pool (VUSDT)</label>
        <div style={{ display: "flex", gap: "8px" }}>
          {(
            [
              { rank: "1st", key: "prize1" as const, color: "#f5c842" },
              { rank: "2nd", key: "prize2" as const, color: "#b9c7e0" },
              { rank: "3rd", key: "prize3" as const, color: "#cd7f32" },
            ]
          ).map(({ rank, key, color }) => (
            <div key={rank} style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color, marginBottom: "4px" }}>
                {rank} Place
              </div>
              <input
                type="number"
                min={0}
                style={inputStyle}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder="VUSDT"
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "rgba(255,179,173,0.1)",
            border: "1px solid rgba(255,179,173,0.3)",
            color: "#ffb3ad",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: loading ? "rgba(78,222,163,0.3)" : "#4edea3",
          color: "#0b1222",
          fontSize: "13px",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          alignSelf: "flex-start",
        }}
      >
        {loading ? (
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Plus size={14} />
        )}
        {loading ? "Creating..." : "Create Tournament"}
      </button>
    </form>
  );
}

// ── Tab: Tournaments ──────────────────────────────────────────────────────────

function TournamentsTab() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    fetch(`${BASE_URL}/tournaments`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setTournaments(Array.isArray(d) ? d : d?.tournaments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Create form toggle */}
      <div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #4edea3",
            background: showForm ? "rgba(78,222,163,0.12)" : "transparent",
            color: "#4edea3",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Plus size={14} />
          Create Tournament
          {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showForm && (
          <div
            style={{
              marginTop: "12px",
              padding: "20px",
              background: "#12121a",
              border: "1px solid #2e3447",
              borderRadius: "12px",
            }}
          >
            <TournamentForm
              onCreated={() => {
                setShowForm(false);
                load();
              }}
            />
          </div>
        )}
      </div>

      {/* Tournaments list */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <Loader2 size={24} style={{ color: "#4edea3", animation: "spin 1s linear infinite" }} />
        </div>
      ) : tournaments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            color: "#909097",
            fontSize: "14px",
            background: "#12121a",
            border: "1px solid #2e3447",
            borderRadius: "12px",
          }}
        >
          No tournaments yet. Create your first one above.
        </div>
      ) : (
        <div
          style={{
            background: "#12121a",
            border: "1px solid #2e3447",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#191f31", borderBottom: "1px solid #2e3447" }}>
                {["Name", "Symbol", "Start", "End", "Participants", "Status", ""].map((h, i) => (
                  <th
                    key={`${h}-${i}`}
                    style={{
                      padding: "10px 16px",
                      textAlign: i === 6 ? "right" : "left",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#909097",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t, i) => (
                <tr
                  key={t._id}
                  style={{
                    borderBottom: i < tournaments.length - 1 ? "1px solid #1e2435" : "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "#191f31";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#dce1fb" }}>
                    {t.name}
                    {t.description && (
                      <div style={{ fontSize: "11px", fontWeight: 400, color: "#909097", marginTop: "2px" }}>
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#8ccdff",
                      }}
                    >
                      {t.symbol}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#909097" }}>{fmtDate(t.startDate)}</td>
                  <td style={{ padding: "12px 16px", color: "#909097" }}>{fmtDate(t.endDate)}</td>
                  <td style={{ padding: "12px 16px", color: "#dce1fb", fontFamily: "monospace" }}>
                    {t.participantCount ?? 0}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusPill status={t.status} />
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {(t.status === "upcoming" || t.status === "active") && (
                      <Link
                        href={`/tournaments/${t._id}`}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "7px",
                          border: "1px solid #2e3447",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#8ccdff",
                          textDecoration: "none",
                        }}
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "users" | "seasons" | "tournaments";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "users", label: "Users", icon: <Users size={15} /> },
  { key: "seasons", label: "Seasons", icon: <Trophy size={15} /> },
  { key: "tournaments", label: "Tournaments", icon: <Swords size={15} /> },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");

  return (
    <div style={{ color: "#dce1fb", minHeight: "100vh" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Warning banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          borderRadius: "10px",
          background: "rgba(255,179,173,0.06)",
          border: "1px solid rgba(255,179,173,0.25)",
          marginBottom: "24px",
          fontSize: "12px",
          color: "#ffb3ad",
          fontWeight: 600,
        }}
      >
        <ShieldAlert size={16} style={{ flexShrink: 0 }} />
        Admin Panel — changes are permanent. Verify all inputs before submitting.
      </div>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div
          style={{
            background: "rgba(255,179,173,0.1)",
            borderRadius: "10px",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldAlert size={22} style={{ color: "#ffb3ad" }} />
        </div>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#dce1fb", margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: "12px", color: "#909097", margin: 0, marginTop: "2px" }}>
            Platform management — users, seasons &amp; tournaments
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
        {TABS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: active ? "1px solid #4edea3" : "1px solid #2e3447",
                background: active ? "rgba(78,222,163,0.10)" : "transparent",
                color: active ? "#4edea3" : "#909097",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "users" && <UsersTab />}
      {tab === "seasons" && <SeasonsTab />}
      {tab === "tournaments" && <TournamentsTab />}
    </div>
  );
}
