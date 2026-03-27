"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";

const WELCOMED_KEY = "crySer_welcomed";
const NEW_USER_KEY = "crySer_newUser";

/* ─── Mini UI mock components ─────────────────────────────────────── */

function MockTab({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <div
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={
        active
          ? { background: color + "22", color, borderBottom: `2px solid ${color}` }
          : { color: "#666", borderBottom: "2px solid transparent" }
      }
    >
      {label}
    </div>
  );
}

function MockCoinRow({ symbol, price, change, up }: { symbol: string; price: string; change: string; up: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "hsl(var(--muted)/0.5)" }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: up ? "#4edea344" : "#ffb3ad44" }}>
          {symbol[0]}
        </div>
        <span className="text-xs font-semibold">{symbol}</span>
      </div>
      <div className="text-right">
        <div className="text-xs font-mono font-semibold">{price}</div>
        <div className="text-[10px] font-semibold" style={{ color: up ? "#4edea3" : "#ffb3ad" }}>{change}</div>
      </div>
    </div>
  );
}

function MockTradeForm({ color }: { color: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-3" style={{ background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))" }}>
      <div className="flex gap-1">
        <div className="flex-1 py-1.5 rounded-lg text-xs font-bold text-center text-black" style={{ background: "#4edea3" }}>Buy</div>
        <div className="flex-1 py-1.5 rounded-lg text-xs font-bold text-center" style={{ background: "hsl(var(--muted))", color: "#888" }}>Sell</div>
      </div>
      <div className="flex gap-1">
        {["Market", "Limit", "Stop"].map((m) => (
          <div key={m} className="flex-1 py-1 rounded text-[10px] text-center font-medium" style={{ background: m === "Market" ? color + "22" : "hsl(var(--muted))", color: m === "Market" ? color : "#666" }}>{m}</div>
        ))}
      </div>
      <div className="rounded-lg px-2.5 py-1.5 text-xs font-mono" style={{ background: "hsl(var(--muted))", color: "#888" }}>Amount: 100 USDT</div>
      <div className="py-1.5 rounded-lg text-xs font-bold text-center text-black" style={{ background: color }}>Buy BTC</div>
    </div>
  );
}

function MockPortfolioRow({ symbol, value, pnl, up }: { symbol: string; value: string; pnl: string; up: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "hsl(var(--muted)/0.5)" }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-black" style={{ background: up ? "#4edea3" : "#ffb3ad" }}>{symbol[0]}</div>
        <span className="text-xs font-semibold">{symbol}</span>
      </div>
      <div className="text-right">
        <div className="text-xs font-mono font-semibold">{value}</div>
        <div className="flex items-center gap-0.5 justify-end text-[10px] font-semibold" style={{ color: up ? "#4edea3" : "#ffb3ad" }}>
          {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {pnl}
        </div>
      </div>
    </div>
  );
}

function MockLeaderRow({ rank, name, value, medal, showCopy }: { rank: string; name: string; value: string; medal?: string; showCopy?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "hsl(var(--muted)/0.5)" }}>
      <span className="text-sm w-5 text-center">{medal ?? rank}</span>
      <span className="text-xs font-semibold flex-1">{name}</span>
      <span className="text-xs font-mono" style={{ color: "#4edea3" }}>{value}</span>
      {showCopy && (
        <div className="px-2 py-0.5 rounded text-[10px] font-bold text-black" style={{ background: "#4edea3" }}>Copy</div>
      )}
    </div>
  );
}

/* ─── Steps ────────────────────────────────────────────────────────── */

const STEPS = [
  {
    color: "#4edea3",
    emoji: "🚀",
    title: "Welcome to CrySer!",
    subtitle: "Paper trading with real market prices",
    visual: (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center">
          <div className="px-5 py-3 rounded-2xl text-center" style={{ background: "rgba(78,222,163,0.1)", border: "1px solid rgba(78,222,163,0.3)" }}>
            <div className="text-2xl font-extrabold font-mono" style={{ color: "#4edea3" }}>$1,000.00</div>
            <div className="text-xs text-muted-foreground mt-0.5">Virtual USDT Balance</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Real Binance prices. Zero real money. Trade freely, learn, compete — no risk.
        </p>
      </div>
    ),
  },
  {
    color: "#8ccdff",
    emoji: "📊",
    title: "Markets",
    subtitle: "Live prices for every USDT pair",
    visual: (
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1 mb-1">
          <MockTab label="All" active color="#8ccdff" />
          <MockTab label="Favorites ⭐" active={false} color="#8ccdff" />
          <MockTab label="Top Gainers" active={false} color="#8ccdff" />
        </div>
        <MockCoinRow symbol="BTCUSDT" price="$97,412" change="+2.4%" up />
        <MockCoinRow symbol="ETHUSDT" price="$3,201"  change="+1.8%" up />
        <MockCoinRow symbol="SOLUSDT" price="$183"    change="-0.9%" up={false} />
        <p className="text-[11px] text-muted-foreground text-center mt-1">
          Tap any row → full chart, order book & trade form
        </p>
      </div>
    ),
  },
  {
    color: "#c084fc",
    emoji: "🕯️",
    title: "Coin Detail",
    subtitle: "Chart · Order Book · Recent Trades",
    visual: (
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <MockTab label="Chart" active color="#c084fc" />
          <MockTab label="Order Book" active={false} color="#c084fc" />
          <MockTab label="Trades" active={false} color="#c084fc" />
          <MockTab label="Trade" active={false} color="#c084fc" />
        </div>
        {/* Mini fake candlestick chart */}
        <div className="rounded-xl overflow-hidden flex items-end gap-0.5 px-2 py-3 h-16" style={{ background: "hsl(var(--muted)/0.5)" }}>
          {[30,45,38,55,48,62,50,70,58,75,65,80].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i % 3 === 0 ? "#ffb3ad" : "#4edea3", opacity: 0.7 }} />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          Powered by TradingView · live Bybit order book
        </p>
      </div>
    ),
  },
  {
    color: "#4edea3",
    emoji: "💸",
    title: "How to Trade",
    subtitle: "Step-by-step",
    visual: (
      <div className="flex flex-col gap-2">
        {[
          { n: "1", text: 'Open any coin → tap the "Trade" tab' },
          { n: "2", text: "Choose Buy or Sell" },
          { n: "3", text: "Pick Market, Limit, Stop-Loss, or Take-Profit" },
          { n: "4", text: "Enter USDT amount (or use 25 / 50 / 100%)" },
          { n: "5", text: 'Hit the green button — done!' },
        ].map(({ n, text }) => (
          <div key={n} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0" style={{ background: "#4edea3" }}>{n}</div>
            <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    color: "#4edea3",
    emoji: "🖥️",
    title: "Trade Form",
    subtitle: "Market · Limit · Stop-Loss · Take-Profit",
    visual: (
      <div className="flex flex-col gap-2">
        <MockTradeForm color="#4edea3" />
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <div className="flex-1 text-center">
            <span className="font-semibold" style={{ color: "#4edea3" }}>Market</span><br/>executes now at live price
          </div>
          <div className="flex-1 text-center">
            <span className="font-semibold" style={{ color: "#8ccdff" }}>Limit</span><br/>triggers at your price
          </div>
          <div className="flex-1 text-center">
            <span className="font-semibold" style={{ color: "#ffd700" }}>Stop</span><br/>auto-sell on drop
          </div>
        </div>
      </div>
    ),
  },
  {
    color: "#b9c7e0",
    emoji: "📈",
    title: "Portfolio",
    subtitle: "Live P&L · Allocation · Trade History",
    visual: (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-1" style={{ background: "rgba(78,222,163,0.1)", border: "1px solid rgba(78,222,163,0.2)" }}>
          <span className="text-xs text-muted-foreground">Total Value</span>
          <span className="text-sm font-extrabold font-mono" style={{ color: "#4edea3" }}>$1,284.50</span>
        </div>
        <MockPortfolioRow symbol="BTCUSDT" value="$842.10" pnl="+$84.20" up />
        <MockPortfolioRow symbol="ETHUSDT" value="$312.40" pnl="-$12.60" up={false} />
        <MockPortfolioRow symbol="USDT"    value="$130.00" pnl="Cash"    up />
      </div>
    ),
  },
  {
    color: "#ffd700",
    emoji: "🏆",
    title: "Leaderboard",
    subtitle: "Compete with traders globally",
    visual: (
      <div className="flex flex-col gap-1.5">
        <MockLeaderRow rank="1" name="satoshi"  value="$3,241" medal="🥇" showCopy />
        <MockLeaderRow rank="2" name="nakamoto" value="$2,180" medal="🥈" showCopy />
        <MockLeaderRow rank="3" name="vitalik"  value="$1,940" medal="🥉" showCopy />
        <p className="text-[11px] text-muted-foreground text-center mt-1">
          Hit <strong style={{ color: "#ffd700" }}>Copy</strong> on any row to mirror their trades automatically
        </p>
      </div>
    ),
  },
  {
    color: "#f97316",
    emoji: "🔁",
    title: "Copy Trading",
    subtitle: "Auto-mirror top performers",
    visual: (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Leader buys 10% of portfolio in BTC", arrow: true },
            { label: "You auto-buy 10% of your balance in BTC", arrow: true },
            { label: "Leader sells → you auto-sell too", arrow: false },
          ].map(({ label, arrow }, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-full px-3 py-2 rounded-lg text-xs text-center font-medium" style={{ background: "hsl(var(--muted)/0.6)", color: i % 2 === 0 ? "#f97316" : "#4edea3" }}>{label}</div>
              {arrow && <div className="text-muted-foreground text-sm">↓</div>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}>
          <span className="text-muted-foreground">Allocation</span>
          <span className="font-bold" style={{ color: "#f97316" }}>10% of your USDT</span>
        </div>
      </div>
    ),
  },
];

/* ─── Modal ─────────────────────────────────────────────────────────── */

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(WELCOMED_KEY)) return;

    if (localStorage.getItem(NEW_USER_KEY)) {
      setOpen(true);
      return;
    }
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => { if (user) setOpen(true); })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    localStorage.setItem(WELCOMED_KEY, "1");
    localStorage.removeItem(NEW_USER_KEY);
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl flex flex-col gap-0 animate-modalEnter overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow: `0 0 80px ${current.color}30, 0 24px 48px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Colored top bar */}
        <div className="h-1 w-full transition-colors duration-300" style={{ background: current.color }} />

        <div className="p-6 flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{current.emoji}</span>
                <h2 className="text-lg font-extrabold tracking-tight">{current.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground ml-9">{current.subtitle}</p>
            </div>
            <button
              onClick={dismiss}
              className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Visual area */}
          <div className="rounded-xl p-3 min-h-[140px] flex flex-col justify-center" style={{ background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border))" }}>
            {current.visual}
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 18 : 5,
                  height: 5,
                  background: i === step ? current.color : i < step ? current.color + "55" : "hsl(var(--muted))",
                }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center justify-center h-10 w-10 rounded-xl border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                style={{ borderColor: "hsl(var(--border))" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {isLast ? (
              <Link
                href="/coin"
                onClick={dismiss}
                className="flex-1 h-10 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-1 transition-opacity hover:opacity-90 active:scale-95"
                style={{ background: current.color }}
              >
                Start Trading →
              </Link>
            ) : (
              <button
                onClick={next}
                className="flex-1 h-10 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-1 transition-opacity hover:opacity-90 active:scale-95"
                style={{ background: current.color }}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground text-center transition-colors -mt-1"
          >
            Skip tutorial ({STEPS.length - step} left)
          </button>
        </div>
      </div>
    </div>
  );
}
