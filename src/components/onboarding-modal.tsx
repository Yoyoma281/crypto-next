"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, BarChart2, Zap, TrendingUp } from "lucide-react";

const STORAGE_KEY = "crySer_welcomed";

const STEPS = [
  { icon: BarChart2, text: "Browse live markets & coin prices",    color: "#8ccdff" },
  { icon: Zap,       text: "Place a buy or sell order instantly",  color: "#4edea3" },
  { icon: TrendingUp,text: "Track your P&L on the Portfolio page", color: "#b9c7e0" },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => { if (user) setOpen(true); })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(5px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 flex flex-col gap-6 animate-modalEnter"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 0 60px rgba(78,222,163,0.18), 0 24px 48px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-5xl leading-none mb-1">🚀</span>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome to CrySer!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have{" "}
            <strong style={{ color: "#4edea3" }}>$1,000 virtual USDT</strong>
            {" "}to trade with. No real money — just real market prices.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2.5">
          {STEPS.map(({ icon: Icon, text, color }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "hsl(var(--muted))" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/coin"
          onClick={dismiss}
          className="w-full py-3 rounded-xl text-sm font-bold text-white text-center transition-opacity hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #4edea3, #006493)" }}
        >
          Start Trading →
        </Link>
        <button
          onClick={dismiss}
          className="text-xs text-muted-foreground hover:text-foreground text-center transition-colors -mt-3"
        >
          I&apos;ll explore on my own
        </button>
      </div>
    </div>
  );
}
