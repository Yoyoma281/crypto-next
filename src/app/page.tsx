'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Zap, ShieldCheck,
  ArrowRight, TrendingUp, TrendingDown, Layers, BrainCircuit,
  ChevronDown,
  UserPlus, Wallet, Trophy, ChevronRight,
} from "lucide-react";
import CoinListClient from "./(main)/coin/CoinListClient";
import { useI18n } from "@/lib/i18n";

const PRIMARY = "#8ccdff";
const GREEN   = "#42e09a";
const RED     = "#ffb4ab";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

const FEATURES = [
  { icon: Layers,       title: "Multi-Chain Bridge",  desc: "Swap assets across 12+ networks seamlessly without leaving the interface.", color: PRIMARY },
  { icon: BrainCircuit, title: "AI Yield Optimizer",  desc: "Automated strategies that rebalance your portfolio for maximum capital efficiency.", color: GREEN, badge: "NEW" },
  { icon: Zap,          title: "Ultra-Low Latency",   desc: "Sub-millisecond price updates via our shared WebSocket engine.", color: PRIMARY },
  { icon: ShieldCheck,  title: "Secure by Default",   desc: "HTTP-only cookies, JWT auth, and rate-limited endpoints protect every session.", color: "#b9c7e0" },
];

const HOW_IT_WORKS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    desc: "Sign up in seconds. No credit card, no deposit, no risk.",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Start with $1,000",
    desc: "Every new trader starts with $1,000 virtual USDT — ready to deploy immediately.",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Trade & Compete",
    desc: "Execute trades at live prices and climb the global leaderboard.",
  },
];

const CHART_BARS = [40, 35, 55, 45, 75, 85, 70, 95];

// ── Types ────────────────────────────────────────────────────────────────────

interface GlobalStats {
  totalMarketCap: string;
  totalVolume24h: string;
  btcDominance: string;
  activeCryptos: number;
}

interface FearGreed {
  value: number;
  classification: string;
}

interface Ticker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fearGreedColor(value: number): string {
  if (value < 25) return RED;
  if (value < 50) return "#f97316";
  if (value < 75) return "#ffd700";
  return GREEN;
}

function formatPrice(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1)    return n.toFixed(4);
  return n.toFixed(6);
}

/** Returns [ref, isVisible]. Element fades+slides up once when it enters the viewport. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible] as const;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useI18n();

  const [isLoggedIn,  setIsLoggedIn]  = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  // Market data state
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [fearGreed,   setFearGreed]   = useState<FearGreed | null>(null);
  const [gainers,     setGainers]     = useState<Ticker[] | null>(null);
  const [losers,      setLosers]      = useState<Ticker[] | null>(null);

  // Reveal refs
  const [statsBarRef,   statsBarVisible]   = useReveal<HTMLElement>();
  const [marketRef,     marketVisible]     = useReveal<HTMLElement>();
  const [glRef,         glVisible]         = useReveal<HTMLElement>();
  const [featuresRef,   featuresVisible]   = useReveal<HTMLElement>();
  const [howItWorksRef, howItWorksVisible] = useReveal<HTMLElement>();
  const [ctaRef,        ctaVisible]        = useReveal<HTMLElement>();
  const [tableRef,      tableVisible]      = useReveal<HTMLElement>();

  // Hero entrance
  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(id);
  }, []);

  // Auth check
  useEffect(() => {
    fetch("/api/me")
      .then((r) => { setIsLoggedIn(r.ok); setAuthChecked(true); })
      .catch(() => { setIsLoggedIn(false); setAuthChecked(true); });
  }, []);

  // Fetch all market data in parallel
  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND}/market/global`).then((r) => r.json()).catch(() => null),
      fetch(`${BACKEND}/market/fear-greed`).then((r) => r.json()).catch(() => null),
      fetch(`${BACKEND}/market/gainers?limit=5`).then((r) => r.json()).catch(() => null),
      fetch(`${BACKEND}/market/losers?limit=5`).then((r) => r.json()).catch(() => null),
    ]).then(([global, fg, g, l]) => {
      if (global) setGlobalStats(global as GlobalStats);
      if (fg)     setFearGreed(fg as FearGreed);
      if (g?.gainers) setGainers(g.gainers as Ticker[]);
      if (l?.losers)  setLosers(l.losers  as Ticker[]);
    });
  }, []);

  const scrollToCoinsTable = () => {
    document.getElementById("coins-table-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const revealClass = (visible: boolean) =>
    `transition-all duration-700 ease-out` +
    (visible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-8 pointer-events-none");

  // Top-4 gainers for Market Pulse (reuses the gainers fetch, sliced to 4)
  const pulseCoins = gainers ? gainers.slice(0, 4) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-24">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-col lg:flex-row items-center gap-16 pt-10 pb-4 overflow-hidden">

        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ background: PRIMARY }} />
        <div className="pointer-events-none absolute -bottom-20 -left-40 w-[350px] h-[350px] rounded-full blur-[100px] opacity-5"  style={{ background: GREEN }} />

        {/* Left copy */}
        <div className="relative z-10 flex flex-col gap-7 flex-1">

          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border w-fit transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ color: GREEN, borderColor: `${GREEN}40`, background: `${GREEN}10`, transitionDelay: "0ms" }}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {t.home.badge}
          </div>

          <h1
            className={`text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "80ms" }}
          >
            {t.home.heroTitle1}{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${PRIMARY}, #006493)` }}>
              {t.home.heroTitle2}
            </span>
            <br />
            {t.home.heroTitle3}
          </h1>

          <p
            className={`text-base text-muted-foreground max-w-lg leading-relaxed transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "160ms" }}
          >
            {t.home.heroDesc.split(/(\$1,000[^.]*USDT[^.]*)/)[0]}
            <strong className="text-foreground">{t.home.heroDesc.match(/\$1,000[^.]*USDT[^.]*/)?.[0]}</strong>
            {t.home.heroDesc.split(/\$1,000[^.]*USDT[^.]*/)[1]}
          </p>

          <div
            className={`flex items-center gap-3 flex-wrap transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "240ms" }}
          >
            {authChecked && !isLoggedIn && (
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #004e7c)` }}>
                {t.home.startTrading} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {authChecked && isLoggedIn && (
              <button onClick={scrollToCoinsTable} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #004e7c)` }}>
                View Markets <ChevronDown className="h-4 w-4" />
              </button>
            )}
            <Link href="/coin/BTCUSDT" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold border border-border hover:bg-muted transition-colors active:scale-95">
              {t.home.viewLiveChart}
            </Link>
          </div>

          <div
            className={`flex items-center gap-10 flex-wrap pt-2 transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "320ms" }}
          >
            {[
              { label: t.home.tradingPairs,   value: "400+"   },
              { label: t.home.virtualBalance, value: "$1,000" },
              { label: t.home.dataDelay,      value: "0ms"    },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-2xl font-black text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — mock chart widget */}
        <div
          className={`relative z-10 hidden lg:block w-[380px] shrink-0 transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          style={{ transitionDelay: "200ms" }}
        >
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
                  className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${h}%`,
                    background:  i >= 4 ? `${PRIMARY}30` : "hsl(var(--muted))",
                    borderTop:   i >= 4 ? `2px solid ${PRIMARY}` : undefined,
                    transitionDelay: heroVisible ? `${400 + i * 40}ms` : "0ms",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section A: Market Stats Bar ───────────────────────────── */}
      <section ref={statsBarRef} className={revealClass(statsBarVisible)}>
        <div className="flex flex-wrap gap-6 md:gap-10 py-5 px-0 border-b border-border/40">

          {/* Total Market Cap */}
          <div className="flex flex-col gap-0.5 min-w-[120px]">
            <span className="text-xs text-muted-foreground">Total Market Cap</span>
            {globalStats ? (
              <span className="text-sm font-bold font-mono">{globalStats.totalMarketCap || "—"}</span>
            ) : (
              <div className="h-5 w-24 bg-muted animate-pulse rounded mt-0.5" />
            )}
          </div>

          {/* 24h Volume */}
          <div className="flex flex-col gap-0.5 min-w-[110px]">
            <span className="text-xs text-muted-foreground">24h Volume</span>
            {globalStats ? (
              <span className="text-sm font-bold font-mono">{globalStats.totalVolume24h || "—"}</span>
            ) : (
              <div className="h-5 w-20 bg-muted animate-pulse rounded mt-0.5" />
            )}
          </div>

          {/* BTC Dominance */}
          <div className="flex flex-col gap-0.5 min-w-[110px]">
            <span className="text-xs text-muted-foreground">BTC Dominance</span>
            {globalStats ? (
              <span className="text-sm font-bold font-mono">{globalStats.btcDominance || "—"}</span>
            ) : (
              <div className="h-5 w-16 bg-muted animate-pulse rounded mt-0.5" />
            )}
          </div>

          {/* Active Cryptos */}
          <div className="flex flex-col gap-0.5 min-w-[110px]">
            <span className="text-xs text-muted-foreground">Active Cryptos</span>
            {globalStats ? (
              <span className="text-sm font-bold font-mono">
                {globalStats.activeCryptos > 0 ? globalStats.activeCryptos.toLocaleString("en-US") : "—"}
              </span>
            ) : (
              <div className="h-5 w-16 bg-muted animate-pulse rounded mt-0.5" />
            )}
          </div>

          {/* Fear & Greed */}
          <div className="flex flex-col gap-0.5 min-w-[140px]">
            <span className="text-xs text-muted-foreground">Fear &amp; Greed Index</span>
            {fearGreed ? (
              <span className="text-sm font-bold font-mono">
                <span style={{ color: fearGreedColor(fearGreed.value) }}>{fearGreed.value}</span>
                <span className="text-muted-foreground font-normal"> — {fearGreed.classification}</span>
              </span>
            ) : (
              <div className="h-5 w-28 bg-muted animate-pulse rounded mt-0.5" />
            )}
          </div>

        </div>
      </section>

      {/* ── Market Pulse ──────────────────────────────────────────── */}
      <section ref={marketRef} className={revealClass(marketVisible)}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Market Pulse</h2>
            <p className="text-sm text-muted-foreground mt-1">Top movers updated in real-time.</p>
          </div>
          <Link href="/coin" className="flex items-center gap-1 text-sm font-bold hover:underline" style={{ color: PRIMARY }}>
            View All Assets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pulseCoins
            ? pulseCoins.map((coin, i) => {
                const sym = coin.symbol.replace("USDT", "");
                const pct = parseFloat(coin.priceChangePercent);
                const pos = pct >= 0;
                return (
                  <Link
                    key={coin.symbol}
                    href={`/coin/${coin.symbol}`}
                    className="group flex flex-col gap-5 p-5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                    style={{ transitionDelay: marketVisible ? `${i * 60}ms` : "0ms" }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-transform duration-300 group-hover:scale-110"
                          style={{ background: `${PRIMARY}15`, border: `1px solid ${PRIMARY}30`, color: PRIMARY }}
                        >
                          {sym.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{sym}</p>
                          <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest">USDT pair</p>
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-[0.65rem] font-bold"
                        style={{ background: pos ? `${GREEN}18` : `${RED}18`, color: pos ? GREEN : RED }}
                      >
                        {pos ? "+" : ""}{pct.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-foreground">${formatPrice(coin.lastPrice)}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Live price</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-5 p-5 rounded-xl border border-border bg-card">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3.5 w-12 bg-muted animate-pulse rounded" />
                        <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-14 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))
          }
        </div>
      </section>

      {/* ── Section B: Top Gainers & Losers ──────────────────────── */}
      <section ref={glRef} className={revealClass(glVisible)}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[0.65rem] uppercase tracking-widest font-semibold block mb-2" style={{ color: PRIMARY }}>
              24h Movers
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Top Gainers &amp; Losers</h2>
            <p className="text-sm text-muted-foreground mt-1">Best and worst performers over the last 24 hours.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Top Gainers */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${GREEN}15` }}>
                <TrendingUp className="h-4 w-4" style={{ color: GREEN }} />
              </div>
              <span className="font-bold text-sm">Top Gainers</span>
            </div>

            <div className="divide-y divide-border/40">
              {gainers
                ? gainers.map((coin, i) => {
                    const sym = coin.symbol.replace("USDT", "");
                    const pct = parseFloat(coin.priceChangePercent);
                    return (
                      <Link
                        key={coin.symbol}
                        href={`/coin/${coin.symbol}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors duration-150 group"
                        style={{ transitionDelay: glVisible ? `${i * 40}ms` : "0ms" }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[0.6rem] text-muted-foreground font-mono w-4 shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold leading-none">{sym}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{sym}/USDT</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-3">
                          <span className="text-sm font-mono font-bold text-foreground">${formatPrice(coin.lastPrice)}</span>
                          <span className="text-sm font-mono font-bold min-w-[60px] text-right" style={{ color: GREEN }}>
                            +{pct.toFixed(2)}%
                          </span>
                        </div>
                      </Link>
                    );
                  })
                : Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-muted animate-pulse rounded" />
                        <div className="flex flex-col gap-1.5">
                          <div className="h-3 w-14 bg-muted animate-pulse rounded" />
                          <div className="h-2.5 w-10 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Top Losers */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${RED}15` }}>
                <TrendingDown className="h-4 w-4" style={{ color: RED }} />
              </div>
              <span className="font-bold text-sm">Top Losers</span>
            </div>

            <div className="divide-y divide-border/40">
              {losers
                ? losers.map((coin, i) => {
                    const sym = coin.symbol.replace("USDT", "");
                    const pct = parseFloat(coin.priceChangePercent);
                    return (
                      <Link
                        key={coin.symbol}
                        href={`/coin/${coin.symbol}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors duration-150 group"
                        style={{ transitionDelay: glVisible ? `${i * 40}ms` : "0ms" }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[0.6rem] text-muted-foreground font-mono w-4 shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold leading-none">{sym}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{sym}/USDT</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-3">
                          <span className="text-sm font-mono font-bold text-foreground">${formatPrice(coin.lastPrice)}</span>
                          <span className="text-sm font-mono font-bold min-w-[60px] text-right" style={{ color: RED }}>
                            {pct.toFixed(2)}%
                          </span>
                        </div>
                      </Link>
                    );
                  })
                : Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-muted animate-pulse rounded" />
                        <div className="flex flex-col gap-1.5">
                          <div className="h-3 w-14 bg-muted animate-pulse rounded" />
                          <div className="h-2.5 w-10 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section ref={featuresRef} className={revealClass(featuresVisible)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          <div className="lg:col-span-4 flex flex-col gap-6">
            <span className="text-[0.65rem] uppercase tracking-widest font-semibold" style={{ color: PRIMARY }}>
              The Platform Advantage
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">{t.home.featuresTitle}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.home.featuresSubtitle}</p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ transitionDelay: featuresVisible ? `${i * 70}ms` : "0ms" }}
                >
                  {f.badge && (
                    <span className="absolute top-4 right-4 text-[0.6rem] font-bold px-2 py-0.5 rounded-full border" style={{ color: GREEN, borderColor: `${GREEN}40`, background: `${GREEN}12` }}>
                      {f.badge}
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${f.color}15` }}>
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

      {/* ── Section C: How It Works ───────────────────────────────── */}
      <section ref={howItWorksRef} className={revealClass(howItWorksVisible)}>
        <div className="flex flex-col gap-4 mb-10">
          <span className="text-[0.65rem] uppercase tracking-widest font-semibold" style={{ color: PRIMARY }}>
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Start trading in minutes</h2>
        </div>

        {/* On md+: 5-column grid — card | arrow | card | arrow | card */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 md:gap-4 items-start gap-y-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === HOW_IT_WORKS.length - 1;
            return (
              <React.Fragment key={step.step}>
                <div
                  className="flex flex-col gap-5 p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ transitionDelay: howItWorksVisible ? `${i * 100}ms` : "0ms" }}
                >
                  {/* Step badge */}
                  <span
                    className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full w-fit"
                    style={{ color: PRIMARY, background: `${PRIMARY}18` }}
                  >
                    Step {step.step}
                  </span>

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${PRIMARY}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: PRIMARY }} />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Connector arrow between cards — only on md+, not after last */}
                {!isLast && (
                  <div key={`arrow-${i}`} className="hidden md:flex items-center justify-center pt-16">
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className={`relative flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-10 rounded-2xl border overflow-hidden text-center sm:text-left ${revealClass(ctaVisible)}`}
        style={{ background: `linear-gradient(135deg, ${PRIMARY}10 0%, ${GREEN}08 100%)`, borderColor: `${PRIMARY}30` }}
      >
        <div className="pointer-events-none absolute inset-0 blur-[120px] opacity-20" style={{ background: PRIMARY }} />
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">{t.home.ctaTitle}</h2>
          <p className="text-sm text-muted-foreground max-w-md">{t.home.ctaDesc}</p>
        </div>
        {authChecked && !isLoggedIn && (
          <Link href="/signup" className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-bold text-white hover:opacity-90 hover:scale-105 transition-all active:scale-95" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #004e7c)` }}>
            {t.home.getStarted} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {authChecked && isLoggedIn && (
          <button onClick={scrollToCoinsTable} className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-bold text-white hover:opacity-90 hover:scale-105 transition-all active:scale-95" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #004e7c)` }}>
            View Markets <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </section>

      {/* ── Live Markets Table ────────────────────────────────────── */}
      <section ref={tableRef} id="coins-table-section" className={`flex flex-col gap-4 scroll-mt-20 ${revealClass(tableVisible)}`}>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">{t.home.liveMarketsTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.liveMarketsDesc}</p>
        </div>
        <CoinListClient />
      </section>

    </div>
  );
}
