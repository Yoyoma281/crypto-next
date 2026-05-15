"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import type { TradeIdea } from "@/app/(main)/ideas/page";

interface CreateIdeaModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (idea: TradeIdea) => void;
}

const INITIAL = {
  symbol: "",
  direction: "LONG" as "LONG" | "SHORT",
  thesis: "",
  entryPrice: "",
  targetPrice: "",
  stopLoss: "",
};

export default function CreateIdeaModal({ open, onClose, onCreated }: CreateIdeaModalProps) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const set = (key: keyof typeof INITIAL, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const sym = form.symbol.trim().toUpperCase().replace("/", "_");
    if (!sym) return setError("Symbol is required");
    if (!form.thesis.trim()) return setError("Thesis is required");
    const entry = parseFloat(form.entryPrice);
    const target = parseFloat(form.targetPrice);
    const stop = parseFloat(form.stopLoss);
    if (isNaN(entry) || entry <= 0) return setError("Valid entry price required");
    if (isNaN(target) || target <= 0) return setError("Valid target price required");
    if (isNaN(stop) || stop <= 0) return setError("Valid stop loss required");

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/ideas`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: sym,
          direction: form.direction,
          thesis: form.thesis.trim(),
          entryPrice: entry,
          targetPrice: target,
          stopLoss: stop,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Failed to post idea");
        setLoading(false);
        return;
      }
      onCreated(data.idea ?? data);
      setForm(INITIAL);
      onClose();
    } catch {
      setError("Network error — please try again");
    }
    setLoading(false);
  };

  const isLong = form.direction === "LONG";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl flex flex-col gap-5 p-6"
        style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "#dce1fb" }}>Post Trade Idea</h2>
          <button onClick={onClose} className="opacity-50 hover:opacity-80 transition-opacity">
            <X className="h-5 w-5" style={{ color: "#dce1fb" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Symbol */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
              Symbol
            </label>
            <input
              value={form.symbol}
              onChange={(e) => set("symbol", e.target.value)}
              placeholder="e.g. BTC_USDT or ETH/USDT"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#dce1fb",
              }}
            />
          </div>

          {/* Direction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
              Direction
            </label>
            <div className="flex gap-2">
              {(["LONG", "SHORT"] as const).map((d) => {
                const active = form.direction === d;
                const color = d === "LONG" ? "#00d4aa" : "#ef4444";
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("direction", d)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black uppercase transition-all"
                    style={{
                      background: active ? (d === "LONG" ? "rgba(0,212,170,0.12)" : "rgba(239,68,68,0.12)") : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.06)"}`,
                      color: active ? color : "#909097",
                    }}
                  >
                    {d === "LONG" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "entryPrice" as const, label: "Entry Price", color: "#dce1fb" },
              { key: "targetPrice" as const, label: "Target", color: "#00d4aa" },
              { key: "stopLoss" as const, label: "Stop Loss", color: "#ef4444" },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#45464d" }}>$</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg pl-6 pr-2 py-2 text-sm outline-none font-mono"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Thesis */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#45464d" }}>
                Thesis
              </label>
              <span
                className="text-[10px]"
                style={{ color: form.thesis.length > 480 ? "#ef4444" : "#45464d" }}
              >
                {form.thesis.length}/500
              </span>
            </div>
            <textarea
              value={form.thesis}
              onChange={(e) => set("thesis", e.target.value.slice(0, 500))}
              placeholder={`Why are you ${isLong ? "bullish" : "bearish"} on this? What's the catalyst?`}
              rows={4}
              className="rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#dce1fb",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: isLong ? "#00d4aa" : "#ef4444",
              color: "#0a0a0f",
            }}
          >
            {loading ? "Posting..." : `Post ${form.direction} Idea`}
          </button>
        </form>
      </div>
    </div>
  );
}
