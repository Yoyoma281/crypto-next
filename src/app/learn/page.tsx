import Link from "next/link";
import {
  BookOpen,
  BarChart2,
  Shield,
  TrendingUp,
  Layers,
  List,
  ArrowRight,
  GraduationCap,
  BookMarked,
  Target,
} from "lucide-react";

export const metadata = { title: "Learn — CrySer Education Hub" };

const PRIMARY = "#8ccdff";
const GREEN = "#42e09a";
const ORANGE = "#f97316";

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: GREEN,
  Intermediate: PRIMARY,
  Advanced: ORANGE,
};

const GUIDES = [
  {
    title: "How to Trade",
    href: "/learn/how-to-trade",
    icon: BookOpen,
    description:
      "Learn market orders, limit orders, and how to execute your first trade.",
    difficulty: "Beginner",
    readTime: "5 min",
    iconBg: "rgba(66,224,154,0.1)",
    iconColor: GREEN,
  },
  {
    title: "Reading Charts",
    href: "/learn/reading-charts",
    icon: BarChart2,
    description:
      "Understand candlestick charts, support/resistance levels, and key patterns.",
    difficulty: "Beginner",
    readTime: "8 min",
    iconBg: "rgba(140,205,255,0.1)",
    iconColor: PRIMARY,
  },
  {
    title: "Risk Management",
    href: "/learn/risk-management",
    icon: Shield,
    description:
      "Protect your capital with stop-losses, position sizing, and portfolio diversification.",
    difficulty: "Intermediate",
    readTime: "10 min",
    iconBg: "rgba(140,205,255,0.1)",
    iconColor: PRIMARY,
  },
  {
    title: "Technical Indicators",
    href: "/learn/technical-indicators",
    icon: TrendingUp,
    description:
      "Use RSI, MACD, EMA, and Bollinger Bands to time your entries and exits.",
    difficulty: "Intermediate",
    readTime: "12 min",
    iconBg: "rgba(249,115,22,0.1)",
    iconColor: ORANGE,
  },
  {
    title: "Trading Strategies",
    href: "/learn/trading-strategies",
    icon: Layers,
    description:
      "Scalping, swing trading, and DCA — find the strategy that fits your style.",
    difficulty: "Advanced",
    readTime: "15 min",
    iconBg: "rgba(249,115,22,0.1)",
    iconColor: ORANGE,
  },
  {
    title: "Understanding Order Books",
    href: "/learn/order-books",
    icon: List,
    description:
      "How order books work, bid-ask spread, and reading market depth.",
    difficulty: "Beginner",
    readTime: "6 min",
    iconBg: "rgba(66,224,154,0.1)",
    iconColor: GREEN,
  },
  {
    title: "Crypto Glossary",
    href: "/learn/glossary",
    icon: BookMarked,
    description:
      "33 essential crypto terms explained in plain English — from HODL and FUD to DeFi, Slippage, and Yield Farming.",
    difficulty: "Beginner",
    readTime: "Reference",
    iconBg: "rgba(140,205,255,0.1)",
    iconColor: PRIMARY,
  },
  {
    title: "Strategy Templates",
    href: "/learn/strategies",
    icon: Target,
    description:
      "Ready-made trading strategies — DCA, dip buying, momentum plays, and safe haven rotation. One-click to apply.",
    difficulty: "Intermediate",
    readTime: "Interactive",
    iconBg: "rgba(245,200,66,0.1)",
    iconColor: "#f5c842",
  },
];

export default function LearnPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 flex flex-col gap-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" style={{ color: PRIMARY }} />
          <span
            className="text-[0.65rem] uppercase tracking-widest font-semibold"
            style={{ color: PRIMARY }}
          >
            Education Hub
          </span>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Learn to Trade Crypto
          </h1>
          <p className="text-muted-foreground mt-2 text-base leading-relaxed">
            From beginner to advanced — everything you need to trade
            confidently.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-6 mt-2">
          {[
            { label: "Guides", value: "8" },
            { label: "Topics covered", value: "30+" },
            { label: "Avg. read time", value: "9 min" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold" style={{ color: PRIMARY }}>
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          const diffColor = DIFFICULTY_COLORS[guide.difficulty];
          return (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex flex-col gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Icon + difficulty */}
              <div className="flex items-start justify-between">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: guide.iconBg }}
                >
                  <Icon className="h-5 w-5" style={{ color: guide.iconColor }} />
                </div>
                <span
                  className="text-[0.6rem] uppercase tracking-widest font-semibold px-2 py-1 rounded-full"
                  style={{
                    color: diffColor,
                    background: `${diffColor}18`,
                    border: `1px solid ${diffColor}40`,
                  }}
                >
                  {guide.difficulty}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5 flex-1">
                <h2 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {guide.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] text-muted-foreground">
                  {guide.readTime} read
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8 rounded-2xl border"
        style={{
          background:
            "linear-gradient(135deg, rgba(140,205,255,0.06) 0%, rgba(66,224,154,0.06) 100%)",
          borderColor: "rgba(140,205,255,0.2)",
        }}
      >
        <div>
          <h2 className="text-lg font-bold mb-1">
            Ready to put your knowledge to work?
          </h2>
          <p className="text-sm text-muted-foreground">
            Start paper trading with $1,000 in virtual USDT — zero risk, real
            market prices.
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #8ccdff, #004e7c)",
          }}
        >
          Start Trading <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
