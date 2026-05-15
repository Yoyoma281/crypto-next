"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Download, Save, Tag, X } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

const LIMIT = 50;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Trade {
  _id: string;
  createdAt: string;
  symbol: string;
  type: "BUY" | "SELL";
  price: string | number;
  usdAmount: string | number;
  coinAmount: string;
}

interface JournalEntry {
  note: string;
  tags: string[];
  updatedAt: string;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "crySer_journal";

function loadJournal(): Record<string, JournalEntry> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, JournalEntry>) : {};
  } catch {
    return {};
  }
}

function saveJournal(data: Record<string, JournalEntry>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or SSR
  }
}

// ── Tag pill colors ───────────────────────────────────────────────────────────

const TAG_PALETTE = [
  { bg: "rgba(78,222,163,0.12)", color: "#4edea3" },
  { bg: "rgba(140,205,255,0.12)", color: "#8ccdff" },
  { bg: "rgba(245,200,66,0.12)", color: "#f5c842" },
  { bg: "rgba(255,179,173,0.12)", color: "#ffb3ad" },
  { bg: "rgba(200,140,255,0.12)", color: "#c88cff" },
  { bg: "rgba(255,180,100,0.12)", color: "#ffb464" },
];

function tagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) & 0xff;
  return TAG_PALETTE[hash % TAG_PALETTE.length];
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtUSD(n: string | number) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtCoin(n: string) {
  const num = parseFloat(n);
  if (num === 0) return "0";
  if (num < 0.0001) return num.toExponential(4);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

// ── TradeCard ─────────────────────────────────────────────────────────────────

function TradeCard({
  trade,
  entry,
  onSave,
}: {
  trade: Trade;
  entry: JournalEntry | undefined;
  onSave: (id: string, note: string, tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(entry?.note ?? "");
  const [tagInput, setTagInput] = useState(entry?.tags.join(", ") ?? "");
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync if entry changes from parent (e.g. after export/reload)
  useEffect(() => {
    if (!dirty) {
      setNote(entry?.note ?? "");
      setTagInput(entry?.tags.join(", ") ?? "");
    }
  }, [entry, dirty]);

  const isBuy = trade.type === "BUY";
  const savedTags = entry?.tags ?? [];

  function handleOpen() {
    setOpen((v) => !v);
    if (!open) {
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }

  function handleSave() {
    const parsedTags = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    onSave(trade._id, note, parsedTags);
    setDirty(false);
    setOpen(false);
  }

  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid #2e3447",
        borderRadius: "12px",
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      {/* Card header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          flexWrap: "wrap",
        }}
      >
        {/* Side badge */}
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 800,
            flexShrink: 0,
            background: isBuy ? "rgba(78,222,163,0.12)" : "rgba(255,179,173,0.12)",
            color: isBuy ? "#4edea3" : "#ffb3ad",
          }}
        >
          {trade.type}
        </span>

        {/* Symbol */}
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#dce1fb", fontSize: "14px" }}>
          {trade.symbol.replace("USDT", "/USDT")}
        </span>

        {/* Amount */}
        <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#909097" }}>
          {fmtCoin(trade.coinAmount)} @ {fmtUSD(trade.price)}
        </span>

        {/* USD value */}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 700,
            color: "#dce1fb",
            marginLeft: "auto",
          }}
        >
          {fmtUSD(trade.usdAmount)}
        </span>

        {/* Date */}
        <span style={{ fontSize: "11px", color: "#909097", whiteSpace: "nowrap" }}>
          {fmtDate(trade.createdAt)}
        </span>

        {/* Toggle note */}
        <button
          onClick={handleOpen}
          style={{
            padding: "4px 10px",
            borderRadius: "7px",
            border: "1px solid #2e3447",
            background: open ? "rgba(78,222,163,0.08)" : "transparent",
            color: open ? "#4edea3" : "#909097",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {entry?.note ? (
            <>
              Edit Note
              {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </>
          ) : (
            <>
              Add Note
              {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </>
          )}
        </button>
      </div>

      {/* Saved note preview */}
      {entry?.note && !open && (
        <div
          style={{
            padding: "0 16px 12px",
            fontSize: "12px",
            color: "#909097",
            lineHeight: 1.5,
            fontStyle: "italic",
            borderTop: "1px solid #1e2435",
            paddingTop: "10px",
          }}
        >
          {entry.note.length > 200 ? entry.note.slice(0, 200) + "…" : entry.note}
        </div>
      )}

      {/* Tags row (when note closed) */}
      {savedTags.length > 0 && !open && (
        <div style={{ padding: "0 16px 12px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {savedTags.map((t) => {
            const c = tagColor(t);
            return (
              <span
                key={t}
                style={{
                  padding: "2px 8px",
                  borderRadius: "5px",
                  fontSize: "10px",
                  fontWeight: 700,
                  background: c.bg,
                  color: c.color,
                  textTransform: "lowercase",
                }}
              >
                #{t}
              </span>
            );
          })}
        </div>
      )}

      {/* Expanded editor */}
      {open && (
        <div
          style={{
            padding: "12px 16px 16px",
            borderTop: "1px solid #1e2435",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setDirty(true);
            }}
            placeholder="Write your trade notes here — your reasoning, emotions, lessons learned..."
            rows={4}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #2e3447",
              background: "#0c1324",
              color: "#dce1fb",
              fontSize: "13px",
              lineHeight: 1.6,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          {/* Tag input */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag size={13} style={{ color: "#909097", flexShrink: 0 }} />
            <input
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setDirty(true);
              }}
              placeholder="Tags: scalp, FOMO, breakout (comma-separated)"
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "7px",
                border: "1px solid #2e3447",
                background: "#0c1324",
                color: "#dce1fb",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          {/* Tag preview */}
          {tagInput.trim() && (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {tagInput
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean)
                .map((t) => {
                  const c = tagColor(t);
                  return (
                    <span
                      key={t}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "5px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: c.bg,
                        color: c.color,
                      }}
                    >
                      #{t}
                    </span>
                  );
                })}
            </div>
          )}

          {/* Save / Cancel */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "7px 16px",
                borderRadius: "7px",
                border: "none",
                background: "#4edea3",
                color: "#0b1222",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Save size={13} />
              Save
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setDirty(false);
                setNote(entry?.note ?? "");
                setTagInput(entry?.tags.join(", ") ?? "");
              }}
              style={{
                padding: "7px 12px",
                borderRadius: "7px",
                border: "1px solid #2e3447",
                background: "transparent",
                color: "#909097",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <X size={13} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [journal, setJournal] = useState<Record<string, JournalEntry>>({});
  const [symbolSearch, setSymbolSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load journal from localStorage once on mount
  useEffect(() => {
    setJournal(loadJournal());
  }, []);

  // Load trades
  const loadTrades = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (symbolSearch.trim()) params.set("symbol", symbolSearch.trim().toUpperCase());

    fetch(`/api/trades?${params}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.trades) {
          setTrades(d.trades);
          setPages(d.pages ?? 1);
          setTotal(d.total ?? d.trades.length);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, symbolSearch]);

  useEffect(() => {
    setPage(1);
  }, [symbolSearch]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  function handleSave(id: string, note: string, tags: string[]) {
    const updated: Record<string, JournalEntry> = {
      ...journal,
      [id]: { note, tags, updatedAt: new Date().toISOString() },
    };
    // Remove if empty
    if (!note && tags.length === 0) {
      delete updated[id];
    }
    setJournal(updated);
    saveJournal(updated);
  }

  function handleExport() {
    const tradesWithNotes = trades
      .filter((t) => journal[t._id])
      .map((t) => ({
        tradeId: t._id,
        symbol: t.symbol,
        type: t.type,
        price: t.price,
        usdAmount: t.usdAmount,
        coinAmount: t.coinAmount,
        date: t.createdAt,
        note: journal[t._id]?.note ?? "",
        tags: journal[t._id]?.tags ?? [],
        savedAt: journal[t._id]?.updatedAt,
      }));

    // Also include any journal entries for trades not on this page
    const allEntries = Object.entries(journal).map(([id, entry]) => ({
      tradeId: id,
      ...entry,
    }));

    const blob = new Blob(
      [JSON.stringify({ exported: new Date().toISOString(), entries: allEntries, tradesWithNotes }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crySer-journal-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // All unique tags from journal
  const allTags = useMemo(() => {
    const set = new Set<string>();
    Object.values(journal).forEach((e) => e.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [journal]);

  // Filter trades by tag
  const filteredTrades = useMemo(() => {
    if (!tagFilter) return trades;
    return trades.filter((t) => {
      const entry = journal[t._id];
      return entry?.tags.includes(tagFilter.toLowerCase());
    });
  }, [trades, journal, tagFilter]);

  const noteCount = Object.keys(journal).length;

  return (
    <div style={{ color: "#dce1fb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "rgba(140,205,255,0.12)",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={22} style={{ color: "#8ccdff" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#dce1fb", margin: 0 }}>
              Trade Journal
            </h1>
            <p style={{ fontSize: "12px", color: "#909097", margin: 0, marginTop: "2px" }}>
              Annotate trades with notes and tags — stored locally in your browser
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {noteCount > 0 && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                background: "rgba(140,205,255,0.10)",
                color: "#8ccdff",
              }}
            >
              {noteCount} note{noteCount !== 1 ? "s" : ""} saved
            </span>
          )}
          <button
            onClick={handleExport}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border: "1px solid #2e3447",
              background: "transparent",
              color: "#909097",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#dce1fb";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#909097";
            }}
          >
            <Download size={13} />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
        {/* Symbol search */}
        <input
          type="text"
          placeholder="Search by symbol (e.g. BTC)"
          value={symbolSearch}
          onChange={(e) => setSymbolSearch(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: "8px",
            border: "1px solid #2e3447",
            background: "#12121a",
            color: "#dce1fb",
            fontSize: "12px",
            outline: "none",
            width: "220px",
          }}
        />

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
            <Tag size={13} style={{ color: "#909097" }} />
            {tagFilter && (
              <button
                onClick={() => setTagFilter("")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "5px",
                  border: "1px solid #2e3447",
                  background: "transparent",
                  color: "#ffb3ad",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <X size={10} />
                Clear
              </button>
            )}
            {allTags.map((t) => {
              const c = tagColor(t);
              const active = tagFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTagFilter(active ? "" : t)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "5px",
                    border: `1px solid ${active ? c.color : "#2e3447"}`,
                    background: active ? c.bg : "transparent",
                    color: active ? c.color : "#909097",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        )}

        {total > 0 && (
          <span style={{ fontSize: "11px", color: "#909097", marginLeft: "auto" }}>
            {total} trade{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Trade list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "#12121a",
                border: "1px solid #2e3447",
                borderRadius: "12px",
                height: "58px",
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      ) : filteredTrades.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#12121a",
            border: "1px solid #2e3447",
            borderRadius: "12px",
            color: "#909097",
            fontSize: "14px",
          }}
        >
          {trades.length === 0
            ? "No trades yet. Start trading to see your history here."
            : "No trades match the active tag filter."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredTrades.map((trade) => (
            <TradeCard
              key={trade._id}
              trade={trade}
              entry={journal[trade._id]}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px", alignItems: "center" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid #2e3447",
              background: "transparent",
              color: page === 1 ? "#2e3447" : "#909097",
              fontSize: "12px",
              fontWeight: 600,
              cursor: page === 1 ? "default" : "pointer",
            }}
          >
            Prev
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`el-${i}`} style={{ color: "#909097", fontSize: "12px" }}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: page === p ? "none" : "1px solid #2e3447",
                    background: page === p ? "#4edea3" : "transparent",
                    color: page === p ? "#0b1222" : "#909097",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid #2e3447",
              background: "transparent",
              color: page === pages ? "#2e3447" : "#909097",
              fontSize: "12px",
              fontWeight: 600,
              cursor: page === pages ? "default" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
