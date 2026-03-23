'use client';

import Link from "next/link";
import {
  Zap, BarChart2, ShieldCheck,
  ArrowRight, TrendingUp, Layers, BrainCircuit,
  Bitcoin, Coins, Link2,
} from "lucide-react";
import CoinListClient from "./(main)/coin/CoinListClient";
import { useI18n } from "@/lib/i18n";

const PRIMARY   = "#10a1e7";
const GREEN     = "#16c784";
const RED       = "#ea3943";

const FEATURES = [
  {
    icon: Layers,
    title: "Multi-Chain Bridge",
    desc: "Swap assets across 12+ networks seamlessly without leaving the interface.",
    color: PRIMARY,
  },
  {
    icon: BrainCircuit,
    title: "AI Yield Optimizer",
    desc: "Automated strategies that rebalance your portfolio for maximum capital efficiency.",
    color: GREEN,
    badge: "NEW",
  },
  {
    icon: Zap,
    title: "Ultra-Low Latency",
    desc: "Sub-millisecond price updates via our shared WebSocket engine.",
    color: "#f59e0b",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    desc: "HTTP-only cookies, JWT auth, and rate-limited endpoints protect every session.",
    color: "#a855f7",
  },
];

const MARKET_CARDS = [
  { symbol: "BTC",  name: "Bitcoin",   icon: Bitcoin,  color: "#f97316", change: "+1.2%",  pos: true },
  { symbol: "ETH",  name: "Ethereum",  icon: Coins,    color: PRIMARY,   change: "+4.2%",  pos: true },
  { symbol: "SOL",  name: "Solana",    icon: BarChart2, color: "#3b82f6", change: "-2.4%",  pos: false },
  { symbol: "LINK", name: "Chainlink", icon: Link2,    color: "#a855f7", change: "+0.4%",  pos: true },
];

const CHART_BARS = [40, 35, 55, 45, 75, 85, 70, 95];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-24">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-col lg:flex-row items-center gap-16 pt-10 pb-4 overflow-hidden">

        {/* Glow blobs */}
        <div
          className="pointer-events-none absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
          style={{ background: PRIMARY }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-40 w-[350px] h-[350px] rounded-full blur-[100px] opacity-5"
          style={{ background: GREEN }}
        />

        {/* Left copy */}
        <div className="relative z-10 flex flex-col gap-7 flex-1">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border w-fit"
            style={{ color: GREEN, borderColor: `${GREEN}40`, background: `${GREEN}10` }}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {t.home.badge}
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            {t.home.heroTitle1}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${PRIMARY}, #60c4ff)` }}
            >
              {t.home.heroTitle2}
            </span>
            <br />
            {t.home.heroTitle3}
          </h1>

          <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
            {t.home.heroDesc.split(/(\$1,000[^.]*USDT[^.]*)/)[0]}
            <strong className="text-foreground">
              {t.home.heroDesc.match(/\$1,000[^.]*USDT[^.]*/)?.[0]}
            </strong>
            {t.home.heroDesc.split(/\$1,000[^.]*USDT[^.]*/)[1]}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, #0077b6)` }}
            >
              {t.home.startTrading} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/Exchange/BTCUSDT"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold border border-border hover:bg-muted transition-colors active:scale-95"
            >
              {t.home.viewLiveChart}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10 flex-wrap pt-2">
            {[
              { label: t.home.tradingPairs,   value: "400+" },
              { label: t.home.virtualBalance, value: "$1,000" },
              { label: t.home.dataDelay,      value: "0ms" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-2xl font-black text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — mock chart widget */}
        <div className="relative z-10 hidden lg:block w-[380px] shrink-0">
          <div className="rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-base font-bold">ETH/USD</h3>
                <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">Live Chart</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold" style={{ color: GREEN }}>$2,482.12</span>
                <span className="block text-xs font-semibold mt-0.5" style={{ color: GREEN }}>+4.21%</span>
              </div>
            </div>
            <div className="h-44 flex items-end gap-1">
              {CHART_BARS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background: i >= 4
                      ? `${PRIMARY}30`
                      : "hsl(var(--muted))",
                    borderTop: i >= 4 ? `2px solid ${PRIMARY}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Market Pulse ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Market Pulse</h2>
            <p className="text-sm text-muted-foreground mt-1">Synchronized liquidity across global providers.</p>
          </div>
          <Link
            href="/coin"
            className="flex items-center gap-1 text-sm font-bold hover:underline"
            style={{ color: PRIMARY }}
          >
            View All Assets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKET_CARDS.map((coin) => {
            const Icon = coin.icon;
            return (
              <Link
                key={coin.symbol}
                href={`/Exchange/${coin.symbol}USDT`}
                className="group flex flex-col gap-5 p-5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: `${coin.color}15`, border: `1px solid ${coin.color}30` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: coin.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{coin.symbol}</p>
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest">{coin.name}</p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-[0.65rem] font-bold"
                    style={{
                      background: coin.pos ? `${GREEN}18` : `${RED}18`,
                      color: coin.pos ? GREEN : RED,
                    }}
                  >
                    {coin.change}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Live price</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left text */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <span
              className="text-[0.65rem] uppercase tracking-widest font-semibold"
              style={{ color: PRIMARY }}
            >
              The Platform Advantage
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              {t.home.featuresTitle}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.home.featuresSubtitle}
            </p>
          </div>

          {/* Right grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  {f.badge && (
                    <span
                      className="absolute top-4 right-4 text-[0.6rem] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: GREEN, borderColor: `${GREEN}40`, background: `${GREEN}12` }}
                    >
                      {f.badge}
                    </span>
                  )}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${f.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-10 rounded-2xl border overflow-hidden text-center sm:text-left"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}10 0%, ${GREEN}08 100%)`,
          borderColor: `${PRIMARY}30`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 blur-[120px] opacity-20"
          style={{ background: PRIMARY }}
        />
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">{t.home.ctaTitle}</h2>
          <p className="text-sm text-muted-foreground max-w-md">{t.home.ctaDesc}</p>
        </div>
        <Link
          href="/signup"
          className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-opacity active:scale-95"
          style={{ background: `linear-gradient(135deg, ${PRIMARY}, #0077b6)` }}
        >
          {t.home.getStarted} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── Live Markets Table ────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">{t.home.liveMarketsTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.liveMarketsDesc}</p>
        </div>
        <CoinListClient />
      </section>

    </div>
  );
}
