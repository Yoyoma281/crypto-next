'use client';

import Link from "next/link";
import { BarChart2, Wallet, ShieldCheck, Zap, ArrowRight, TrendingUp } from "lucide-react";
import CoinListClient from "./(main)/coin/CoinListClient";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();

  const FEATURES = [
    { icon: Zap, title: t.home.f1Title, desc: t.home.f1Desc, color: "#f59e0b" },
    { icon: BarChart2, title: t.home.f2Title, desc: t.home.f2Desc, color: "#10a1e7" },
    { icon: Wallet, title: t.home.f3Title, desc: t.home.f3Desc, color: "#16c784" },
    { icon: ShieldCheck, title: t.home.f4Title, desc: t.home.f4Desc, color: "#a855f7" },
  ];

  const STEPS = [
    { n: "01", title: t.home.s1Title, desc: t.home.s1Desc },
    { n: "02", title: t.home.s2Title, desc: t.home.s2Desc },
    { n: "03", title: t.home.s3Title, desc: t.home.s3Desc },
    { n: "04", title: t.home.s4Title, desc: t.home.s4Desc },
  ];

  return (
    <div className="flex flex-col gap-20">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center gap-6 pt-12 pb-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
          style={{ color: "#16c784", borderColor: "rgba(22,199,132,0.3)", background: "rgba(22,199,132,0.08)" }}
        >
          <TrendingUp className="h-3 w-3" />
          {t.home.badge}
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight max-w-2xl leading-tight">
          {t.home.heroTitle1}{" "}
          <span style={{ color: "#10a1e7" }}>{t.home.heroTitle2}</span>
          <br />{t.home.heroTitle3}
        </h1>

        <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
          {t.home.heroDesc.split(/(\$1,000[^.]*USDT[^.]*)/)[0]}
          <strong className="text-foreground">
            {t.home.heroDesc.match(/\$1,000[^.]*USDT[^.]*/)?.[0]}
          </strong>
          {t.home.heroDesc.split(/\$1,000[^.]*USDT[^.]*/)[1]}
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#10a1e7" }}
          >
            {t.home.startTrading} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/Exchange/BTCUSDT"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border hover:bg-muted transition-colors"
          >
            {t.home.viewLiveChart}
          </Link>
        </div>

        {/* Social proof numbers */}
        <div className="flex items-center gap-8 mt-2 flex-wrap justify-center">
          {[
            { label: t.home.tradingPairs, value: "400+" },
            { label: t.home.virtualBalance, value: "$1,000" },
            { label: t.home.dataDelay, value: "0ms" },
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
          <h2 className="text-2xl font-bold mb-1">{t.home.featuresTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.featuresSubtitle}</p>
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
          <h2 className="text-2xl font-bold mb-1">{t.home.howItWorksTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.howItWorksSubtitle}</p>
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
          <h2 className="text-xl font-bold mb-1">{t.home.ctaTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.ctaDesc}</p>
        </div>
        <Link
          href="/signup"
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#10a1e7" }}
        >
          {t.home.getStarted} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── Live Markets Table ───────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t.home.liveMarketsTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {t.home.liveMarketsDesc}
          </p>
        </div>
        <CoinListClient />
      </section>

    </div>
  );
}
