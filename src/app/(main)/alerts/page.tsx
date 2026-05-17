"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  BellOff,
  Trash2,
  CheckCircle2,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import AuthRequired from "@/components/auth-required";

const PRIMARY = "#8ccdff";
const GREEN = "#42e09a";
const RED = "#ffb4ab";
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

interface Alert {
  _id: string;
  symbol: string;
  targetPrice: number;
  direction: "above" | "below";
  note?: string;
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

interface FormState {
  symbol: string;
  targetPrice: string;
  direction: "above" | "below";
  note: string;
}

function timeAgo(date: string | Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    symbol: "",
    targetPrice: "",
    direction: "above",
    note: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/alerts`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const sym = form.symbol.trim().toUpperCase();
    const price = parseFloat(form.targetPrice);

    if (!sym) {
      setFormError("Symbol is required (e.g. BTCUSDT).");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setFormError("Enter a valid target price.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/alerts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: sym,
          targetPrice: price,
          direction: form.direction,
          note: form.note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.message ?? "Failed to create alert.");
        return;
      }
      const created = await res.json();
      setAlerts((prev) => [created, ...prev]);
      setForm({ symbol: "", targetPrice: "", direction: "above", note: "" });
      setShowForm(false);
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`${BASE}/alerts/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (unauthorized) {
    return (
      <AuthRequired
        title="Sign in to use Price Alerts"
        description="Track price targets for any coin."
      />
    );
  }

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className="text-[0.65rem] uppercase tracking-widest font-semibold mb-1 inline-block"
            style={{ color: PRIMARY }}
          >
            Price Alerts
          </span>
          <h1 className="text-2xl font-bold leading-tight">Price Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get notified when any coin hits your target price.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((s) => !s);
            setFormError(null);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all shrink-0"
          style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
        >
          {showForm ? (
            <>
              <X className="h-3.5 w-3.5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              New Alert
            </>
          )}
        </button>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: PRIMARY }}>
            Create a new price alert
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Symbol + Price row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Symbol */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground">
                  Symbol
                </label>
                <input
                  type="text"
                  placeholder="BTCUSDT"
                  value={form.symbol}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      symbol: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:ring-1 placeholder:text-muted-foreground/50"
                  style={
                    form.symbol
                      ? { borderColor: PRIMARY + "60", color: PRIMARY }
                      : {}
                  }
                />
              </div>

              {/* Target Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground">
                  Target Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="65000"
                    min="0"
                    step="any"
                    value={form.targetPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetPrice: e.target.value }))
                    }
                    className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2 text-sm font-mono font-bold focus:outline-none focus:ring-1 placeholder:text-muted-foreground/50"
                    style={
                      form.targetPrice
                        ? { borderColor: PRIMARY + "60", color: PRIMARY }
                        : {}
                    }
                  />
                </div>
              </div>
            </div>

            {/* Direction toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["above", "below"] as const).map((dir) => {
                  const isActive = form.direction === dir;
                  const color = dir === "above" ? PRIMARY : RED;
                  return (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, direction: dir }))}
                      className="py-2 rounded-lg text-sm font-bold border transition-all"
                      style={
                        isActive
                          ? {
                              background: color + "20",
                              color: color,
                              borderColor: color + "60",
                            }
                          : {
                              background: "transparent",
                              color: "hsl(var(--muted-foreground))",
                              borderColor: "hsl(var(--border))",
                            }
                      }
                    >
                      {dir === "above" ? "Above ▲" : "Below ▼"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground">
                Note{" "}
                <span className="normal-case tracking-normal font-normal text-muted-foreground/60">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Breakout level"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Error */}
            {formError && (
              <p
                className="text-xs font-medium px-3 py-2 rounded-lg"
                style={{ background: RED + "18", color: RED }}
              >
                {formError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #8ccdff, #004e7c)",
                }}
              >
                {submitting ? "Creating..." : "Create Alert"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                  setForm({
                    symbol: "",
                    targetPrice: "",
                    direction: "above",
                    note: "",
                  });
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && <SkeletonRows />}

      {/* ── Empty state ── */}
      {!loading && alerts.length === 0 && (
        <div className="rounded-xl border border-border bg-card min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(140,205,255,0.1)" }}
            >
              <Bell className="w-6 h-6" style={{ color: PRIMARY }} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-foreground">
                No price alerts set
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Get notified when prices move
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
            >
              Set an Alert →
            </button>
          </div>
        </div>
      )}

      {/* ── Active Alerts ── */}
      {!loading && activeAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span
            className="text-[0.65rem] uppercase tracking-widest font-semibold"
            style={{ color: PRIMARY }}
          >
            Active — {activeAlerts.length}
          </span>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {activeAlerts.map((alert, idx) => (
              <AlertRow
                key={alert._id}
                alert={alert}
                isLast={idx === activeAlerts.length - 1}
                onDelete={handleDelete}
                deletingId={deletingId}
                isTriggered={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Triggered Alerts ── */}
      {!loading && triggeredAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span
            className="text-[0.65rem] uppercase tracking-widest font-semibold"
            style={{ color: GREEN }}
          >
            Triggered — {triggeredAlerts.length}
          </span>
          <div className="rounded-xl border border-border bg-card overflow-hidden opacity-60">
            {triggeredAlerts.map((alert, idx) => (
              <AlertRow
                key={alert._id}
                alert={alert}
                isLast={idx === triggeredAlerts.length - 1}
                onDelete={handleDelete}
                deletingId={deletingId}
                isTriggered={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── No active alerts hint (when only triggered exist) ── */}
      {!loading &&
        activeAlerts.length === 0 &&
        triggeredAlerts.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
            <BellOff
              className="h-4 w-4 shrink-0"
              style={{ color: PRIMARY }}
            />
            <p className="text-sm text-muted-foreground">
              No active alerts.{" "}
              <button
                onClick={() => setShowForm(true)}
                className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: PRIMARY }}
              >
                Add one?
              </button>
            </p>
          </div>
        )}
    </div>
  );
}

function AlertRow({
  alert,
  isLast,
  onDelete,
  deletingId,
  isTriggered,
}: {
  alert: Alert;
  isLast: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
  isTriggered: boolean;
}) {
  const dirColor = alert.direction === "above" ? PRIMARY : RED;
  const dirLabel = alert.direction === "above" ? "▲ Above" : "▼ Below";
  const isDeleting = deletingId === alert._id;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 group transition-colors hover:bg-muted/30 ${
        !isLast ? "border-b border-border/40" : ""
      }`}
    >
      {/* Icon */}
      <div className="shrink-0">
        {isTriggered ? (
          <CheckCircle2 className="h-4 w-4" style={{ color: GREEN }} />
        ) : (
          <Bell className="h-4 w-4" style={{ color: PRIMARY }} />
        )}
      </div>

      {/* Symbol — links to the Exchange page */}
      <Link
        href={`/Exchange/${alert.symbol}`}
        className="flex items-center gap-1 font-mono font-bold text-sm shrink-0 w-24 truncate hover:underline underline-offset-2 transition-opacity hover:opacity-80"
        style={{ color: isTriggered ? "hsl(var(--muted-foreground))" : "#dce1fb" }}
      >
        {alert.symbol}
        <ExternalLink className="h-2.5 w-2.5 opacity-50 shrink-0" />
      </Link>

      {/* Target price */}
      <span className="font-mono font-bold text-sm shrink-0">
        $
        {Number(alert.targetPrice).toLocaleString(undefined, {
          maximumFractionDigits: 8,
        })}
      </span>

      {/* Direction badge */}
      <span
        className="px-2 py-0.5 rounded text-[0.65rem] font-bold shrink-0"
        style={{ background: dirColor + "18", color: dirColor }}
      >
        {dirLabel}
      </span>

      {/* Note */}
      {alert.note && (
        <span className="text-xs text-muted-foreground truncate min-w-0 flex-1">
          {alert.note}
        </span>
      )}
      {!alert.note && <span className="flex-1" />}

      {/* Time */}
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        {isTriggered && alert.triggeredAt
          ? `Triggered ${timeAgo(alert.triggeredAt)}`
          : timeAgo(alert.createdAt)}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(alert._id)}
        disabled={isDeleting}
        className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 disabled:opacity-40"
        style={{ color: isDeleting ? RED : "hsl(var(--muted-foreground))" }}
        title="Delete alert"
      >
        <Trash2 className="h-3.5 w-3.5 group-hover:text-[#ffb4ab] transition-colors" />
      </button>
    </div>
  );
}
