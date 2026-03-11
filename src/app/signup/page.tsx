import { SignupForm } from "@/components/signup-form";
import Link from "next/link";
import { Bitcoin, TrendingUp, ShieldCheck, Zap, Wallet } from "lucide-react";

const COINS = [
  { symbol: "BTC", color: "#f7931a", bg: "rgba(247,147,26,0.15)", delay: "0s" },
  { symbol: "ETH", color: "#627eea", bg: "rgba(98,126,234,0.15)", delay: "0.5s" },
  { symbol: "SOL", color: "#9945ff", bg: "rgba(153,69,255,0.15)", delay: "1.0s" },
  { symbol: "BNB", color: "#f3ba2f", bg: "rgba(243,186,47,0.15)", delay: "0.3s" },
  { symbol: "XRP", color: "#00aae4", bg: "rgba(0,170,228,0.15)",  delay: "0.7s" },
  { symbol: "DOGE", color: "#c2a633", bg: "rgba(194,166,51,0.15)", delay: "0.2s" },
];

const PERKS = [
  { icon: Wallet,     color: "#16c784", text: "$1,000 virtual USDT instantly on signup" },
  { icon: TrendingUp, color: "#10a1e7", text: "Live Binance prices across 400+ pairs" },
  { icon: Zap,        color: "#f59e0b", text: "TradingView charts & real order book" },
  { icon: ShieldCheck,color: "#a855f7", text: "No real money — practice risk-free" },
];

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full gap-0">

      {/* ── Left: form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm anim-fade-left">
          <SignupForm />
          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing up you agree to our{" "}
            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* ── Right: branded panel ─────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 p-10 rounded-2xl relative overflow-hidden my-6 mr-4"
        style={{ background: "linear-gradient(160deg, #070d1a 0%, #0d1a2e 60%, #091420 100%)" }}
      >
        {/* Glow */}
        <div className="absolute top-[-60px] right-[-60px] h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #16c784, transparent)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] h-48 w-48 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #10a1e7, transparent)" }} />

        {/* Brand */}
        <div className="anim-fade-right flex items-center gap-2.5 relative z-10">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CrySer</span>
        </div>

        {/* Coin row + headline */}
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {COINS.map((c) => (
              <div
                key={c.symbol}
                className="float-coin h-12 w-12 rounded-xl flex items-center justify-center text-[11px] font-bold border"
                style={{
                  background: c.bg,
                  borderColor: c.color + "40",
                  color: c.color,
                  boxShadow: `0 4px 16px ${c.color}20`,
                  animationDelay: c.delay,
                }}
              >
                {c.symbol}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold leading-snug">
              Start trading in seconds
            </p>
            <p className="text-white/50 text-sm mt-1">No deposit. No credit card. No risk.</p>
          </div>
        </div>

        {/* Perks */}
        <div className="relative z-10 flex flex-col gap-3">
          {PERKS.map(({ icon: Icon, color, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: color + "18" }}>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              <p className="text-white/70 text-xs">{text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
