import Link from "next/link";
import { BarChart2, Wallet, ShieldCheck, Zap, ArrowRight, TrendingUp } from "lucide-react";
import CoinListClient from "./(main)/coin/CoinListClient";

const FEATURES = [
  {
    icon: Zap,
    title: "Live Market Data",
    desc: "Real-time prices, order books, and trade history streamed directly from Binance.",
    color: "#f59e0b",
  },
  {
    icon: BarChart2,
    title: "Professional Charts",
    desc: "TradingView-powered candlestick charts with multiple timeframes — 1m to 1d.",
    color: "#10a1e7",
  },
  {
    icon: Wallet,
    title: "$1,000 Virtual Funds",
    desc: "Every new account starts with $1,000 USDT in paper money. No real risk, real experience.",
    color: "#16c784",
  },
  {
    icon: ShieldCheck,
    title: "Portfolio Tracking",
    desc: "Watch your holdings update in real-time as the market moves.",
    color: "#a855f7",
  },
];

const STEPS = [
  { n: "01", title: "Create an account", desc: "Sign up free in under 30 seconds." },
  { n: "02", title: "Get $1,000 USDT", desc: "Your virtual balance is ready immediately." },
  { n: "03", title: "Browse markets", desc: "Explore hundreds of USDT trading pairs." },
  { n: "04", title: "Place your first trade", desc: "Buy or sell at live market prices." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center gap-6 pt-12 pb-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
          style={{ color: "#16c784", borderColor: "rgba(22,199,132,0.3)", background: "rgba(22,199,132,0.08)" }}
        >
          <TrendingUp className="h-3 w-3" />
          Paper trading — zero risk, 100% real data
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight max-w-2xl leading-tight">
          Trade Crypto{" "}
          <span style={{ color: "#10a1e7" }}>Like a Pro.</span>
          <br />For Free.
        </h1>

        <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
          CrySer is a demo crypto trading platform powered by live Binance data.
          Practice your strategy with <strong className="text-foreground">$1,000 in virtual USDT</strong> — no deposit, no risk.
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#10a1e7" }}
          >
            Start Trading <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/Exchange/BTCUSDT"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-muted transition-colors"
          >
            View Live Chart
          </Link>
        </div>

        {/* Social proof numbers */}
        <div className="flex items-center gap-8 mt-2 flex-wrap justify-center">
          {[
            { label: "Trading Pairs", value: "400+" },
            { label: "Virtual Starting Balance", value: "$1,000" },
            { label: "Data Delay", value: "0ms" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Everything you need to practice</h2>
          <p className="text-sm text-muted-foreground">Built with real trading tools, zero real money.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${f.color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">How it works</h2>
          <p className="text-sm text-muted-foreground">Up and trading in under a minute.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step) => (
            <div key={step.n} className="flex flex-col gap-2 p-5 rounded-xl border border-border bg-card">
              <span className="text-3xl font-black text-primary/20">{step.n}</span>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section
        className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8 rounded-2xl border"
        style={{ background: "linear-gradient(135deg, rgba(16,161,231,0.08) 0%, rgba(22,199,132,0.08) 100%)", borderColor: "rgba(16,161,231,0.2)" }}
      >
        <div>
          <h2 className="text-xl font-bold mb-1">Ready to start trading?</h2>
          <p className="text-sm text-muted-foreground">Create a free account and get $1,000 in virtual funds instantly.</p>
        </div>
        <Link
          href="/signup"
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#10a1e7" }}
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── Live Markets Table ───────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Live Markets</h2>
          <p className="text-sm text-muted-foreground">
            Real-time prices from Binance, updated every 3 seconds.
          </p>
        </div>
        <CoinListClient />
      </section>

    </div>
  );
}
