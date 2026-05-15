"use client";

import { useState } from "react";
import ConvertModal from "@/components/ConvertModal";
import { ArrowLeftRight, Zap } from "lucide-react";

export default function ConvertPage() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minHeight: "70vh", color: "#dce1fb" }}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center mb-10">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(78,222,163,0.12)",
            border: "1px solid rgba(78,222,163,0.25)",
          }}
        >
          <ArrowLeftRight className="h-8 w-8" style={{ color: "#4edea3" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#dce1fb" }}>
            Instant Convert
          </h1>
          <p className="mt-2 max-w-sm" style={{ fontSize: 14, color: "#909097", lineHeight: 1.6 }}>
            Swap any two USDT pairs instantly at mid-price with zero fees. Your virtual balance is
            updated in real time.
          </p>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-2xl">
        {[
          {
            icon: "⚡",
            title: "Instant",
            desc: "Executed as two back-to-back market orders",
          },
          {
            icon: "0%",
            title: "No Fees",
            desc: "Unlike the exchange (0.1% taker fee)",
          },
          {
            icon: "📊",
            title: "Live Rate",
            desc: "Prices fetched from Gate.io in real time",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl px-5 py-4 flex flex-col gap-2 text-center"
            style={{ background: "#0b1222", border: "1px solid #1e2a3a" }}
          >
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span className="text-sm font-bold" style={{ color: "#dce1fb" }}>
              {f.title}
            </span>
            <span className="text-xs" style={{ color: "#909097" }}>
              {f.desc}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #42e09a, #00c07e)",
          color: "#003822",
          boxShadow: "0 8px 32px rgba(0,192,126,0.25)",
        }}
      >
        <Zap className="h-5 w-5" />
        Open Convert
      </button>

      <ConvertModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
