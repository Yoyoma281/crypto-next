import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { Bitcoin, TrendingUp, ShieldCheck, Zap } from "lucide-react";

const COINS = [
  { symbol: "BTC", color: "#f7931a", bg: "rgba(247,147,26,0.15)",  delay: "0s" },
  { symbol: "ETH", color: "#627eea", bg: "rgba(98,126,234,0.15)",  delay: "0.4s" },
  { symbol: "SOL", color: "#9945ff", bg: "rgba(153,69,255,0.15)",  delay: "0.8s" },
  { symbol: "BNB", color: "#f3ba2f", bg: "rgba(243,186,47,0.15)",  delay: "0.2s" },
  { symbol: "XRP", color: "#00aae4", bg: "rgba(0,170,228,0.15)",   delay: "0.6s" },
  { symbol: "ADA", color: "#0033ad", bg: "rgba(0,51,173,0.2)",     delay: "1.0s" },
  { symbol: "DOT", color: "#e6007a", bg: "rgba(230,0,122,0.15)",   delay: "0.3s" },
  { symbol: "AVAX", color: "#e84142", bg: "rgba(232,65,66,0.15)", delay: "0.7s" },
  { symbol: "LINK", color: "#2a5ada", bg: "rgba(42,90,218,0.15)", delay: "0.5s" },
];

const FEATURES = [
  { icon: TrendingUp, text: "Live prices from Binance, updated in real time" },
  { icon: ShieldCheck, text: "$1,000 in virtual funds — zero real risk" },
  { icon: Zap,        text: "Professional charts & full order book" },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">

      {/* ── Left branded panel ───────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #070d1a 0%, #0d1a2e 60%, #091420 100%)" }}
      >
        {/* Glow blobs */}
        <div className="absolute top-[-80px] left-[-80px] h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #10a1e7, transparent)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] h-52 w-52 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #16c784, transparent)" }} />

        {/* Brand */}
        <div className="anim-fade-left flex items-center gap-2.5 relative z-10">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CrySer</span>
        </div>

        {/* Coin grid */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="grid grid-cols-3 gap-4">
            {COINS.map((c) => (
              <div
                key={c.symbol}
                className="float-coin flex flex-col items-center gap-1.5"
                style={{ animationDelay: c.delay }}
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-xs font-bold border"
                  style={{
                    background: c.bg,
                    borderColor: c.color + "40",
                    color: c.color,
                    boxShadow: `0 4px 20px ${c.color}20`,
                  }}
                >
                  {c.symbol}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-white text-xl font-bold leading-snug">
              Practice trading with<br />real market data
            </p>
            <p className="text-white/50 text-sm mt-1.5">Paper trading — 100% risk free</p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 flex flex-col gap-3 anim-fade-left" style={{ animationDelay: "0.2s" }}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(16,161,231,0.12)" }}>
                <Icon className="h-3.5 w-3.5" style={{ color: "#10a1e7" }} />
              </div>
              <p className="text-white/70 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: form panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm anim-fade-right">

          {/* Mobile brand */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Bitcoin className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base">CrySer</span>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-muted-foreground mt-8">
            By logging in you agree to our{" "}
            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
