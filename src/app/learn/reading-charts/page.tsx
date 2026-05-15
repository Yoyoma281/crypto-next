import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  Lightbulb,
  AlertTriangle,
  CircleDot,
  Clock,
} from "lucide-react";
import LearnQuiz from "@/components/LearnQuiz";

export const metadata = { title: "Reading Charts — CrySer Learn" };

const PRIMARY = "#8ccdff";
const GREEN = "#42e09a";
const RED = "#ffb4ab";

function Section({
  title,
  icon: Icon,
  color,
  bg,
  children,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: bg }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Callout({
  type,
  children,
}: {
  type: "tip" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    tip: {
      color: GREEN,
      bg: "rgba(66,224,154,0.07)",
      border: "rgba(66,224,154,0.25)",
      icon: Lightbulb,
      label: "Tip",
    },
    warning: {
      color: RED,
      bg: "rgba(255,180,171,0.07)",
      border: "rgba(255,180,171,0.25)",
      icon: AlertTriangle,
      label: "Warning",
    },
    info: {
      color: PRIMARY,
      bg: "rgba(140,205,255,0.07)",
      border: "rgba(140,205,255,0.25)",
      icon: CircleDot,
      label: "Note",
    },
  }[type];
  const Icon = styles.icon;
  return (
    <div
      className="flex gap-3 p-4 rounded-xl border text-sm"
      style={{ background: styles.bg, borderColor: styles.border }}
    >
      <Icon
        className="h-4 w-4 mt-0.5 shrink-0"
        style={{ color: styles.color }}
      />
      <div style={{ color: styles.color }}>
        <strong>{styles.label}: </strong>
        <span className="text-foreground/80">{children}</span>
      </div>
    </div>
  );
}

function Calloutbox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 my-4">
      {children}
    </div>
  );
}

export default function ReadingChartsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 flex flex-col gap-12">
      {/* Back link */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Learn
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[0.65rem] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full"
            style={{
              color: GREEN,
              background: "rgba(66,224,154,0.1)",
              border: "1px solid rgba(66,224,154,0.3)",
            }}
          >
            Beginner
          </span>
          <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
            <Clock className="h-3 w-3" /> 8 min read
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(140,205,255,0.1)" }}
          >
            <BarChart2 className="h-5 w-5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Reading Candlestick Charts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              The universal language of every financial market
            </p>
          </div>
        </div>
        <Callout type="info">
          Candlestick charts were invented in 18th-century Japan to track rice
          prices. Today they are the standard for every financial market — from
          stocks to crypto.
        </Callout>
      </div>

      {/* 1. What is a candlestick */}
      <Section
        title="What Is a Candlestick?"
        icon={BarChart2}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          Each candlestick represents a single time period — on a 1-hour chart
          that is one hour, on a daily chart that is one full trading day. Every
          candle encodes four pieces of price information called{" "}
          <span className="font-semibold" style={{ color: PRIMARY }}>
            OHLC
          </span>
          : Open, High, Low, and Close.
        </p>

        {/* Visual candlestick diagram */}
        <Calloutbox>
          <div className="flex flex-col sm:flex-row gap-8 items-start justify-center py-2">
            {/* Green candle */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: GREEN }}>
                Bullish (Green)
              </span>
              <div className="flex flex-col items-center gap-0">
                {/* Upper wick */}
                <div className="w-px h-8 bg-green-400 opacity-60" />
                {/* Body */}
                <div
                  className="w-8 h-14 rounded-sm"
                  style={{ background: GREEN, opacity: 0.85 }}
                />
                {/* Lower wick */}
                <div className="w-px h-5 bg-green-400 opacity-60" />
              </div>
              <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
                <div>
                  High <span style={{ color: GREEN }}>↑</span>
                </div>
                <div>Close &gt; Open</div>
                <div>
                  Low <span style={{ color: RED }}>↓</span>
                </div>
              </div>
            </div>

            {/* Annotations */}
            <div className="flex flex-col gap-3 text-xs text-muted-foreground justify-center py-4">
              {[
                {
                  label: "High",
                  desc: "The highest price reached during the period — shown by the top wick.",
                  color: GREEN,
                },
                {
                  label: "Close",
                  desc: "The price when the period ended. For a green candle, close is above open.",
                  color: GREEN,
                },
                {
                  label: "Open",
                  desc: "The price when the period began. For a green candle, open is below close.",
                  color: "#b9c7e0",
                },
                {
                  label: "Low",
                  desc: "The lowest price reached — shown by the bottom wick.",
                  color: RED,
                },
              ].map((row) => (
                <div key={row.label} className="flex gap-3 items-start">
                  <span
                    className="font-bold w-10 shrink-0"
                    style={{ color: row.color }}
                  >
                    {row.label}
                  </span>
                  <span className="leading-snug">{row.desc}</span>
                </div>
              ))}
            </div>

            {/* Red candle */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: RED }}>
                Bearish (Red)
              </span>
              <div className="flex flex-col items-center gap-0">
                <div className="w-px h-5 bg-red-400 opacity-60" />
                <div
                  className="w-8 h-14 rounded-sm"
                  style={{ background: RED, opacity: 0.85 }}
                />
                <div className="w-px h-8 bg-red-400 opacity-60" />
              </div>
              <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
                <div>
                  High <span style={{ color: GREEN }}>↑</span>
                </div>
                <div>Open &gt; Close</div>
                <div>
                  Low <span style={{ color: RED }}>↓</span>
                </div>
              </div>
            </div>
          </div>
        </Calloutbox>

        <p>
          A{" "}
          <span className="font-semibold" style={{ color: GREEN }}>
            green (bullish) candle
          </span>{" "}
          means the price closed higher than it opened — buyers won that period.
          A{" "}
          <span className="font-semibold" style={{ color: RED }}>
            red (bearish) candle
          </span>{" "}
          means it closed lower — sellers dominated. The thin lines extending
          above and below the body are called{" "}
          <span className="font-semibold" style={{ color: PRIMARY }}>
            wicks
          </span>{" "}
          (also called shadows) and show the full price range reached.
        </p>
        <p>
          Long wicks indicate that price was pushed far in one direction but
          rejected — buyers or sellers stepped in and pushed it back. A candle
          with a very long lower wick and small body, for example, often signals
          that sellers tried to push the price down but buyers absorbed the
          selling and the price recovered.
        </p>
        <Callout type="tip">
          When learning to read charts, ignore individual candles at first.
          Focus on the overall direction — are you seeing mostly green candles
          trending upward, or red ones trending down?
        </Callout>
      </Section>

      {/* 2. Common patterns */}
      <Section
        title="Common Candlestick Patterns"
        icon={BarChart2}
        color={GREEN}
        bg="rgba(66,224,154,0.1)"
      >
        <p>
          Certain candlestick shapes and combinations appear repeatedly and
          carry predictive value. You do not need to memorize dozens — mastering
          three core patterns is enough to start reading price action
          effectively.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
          {[
            {
              name: "Doji",
              color: PRIMARY,
              bg: "rgba(140,205,255,0.07)",
              desc: "Open and close are almost equal, creating a cross shape. The market is indecisive — neither buyers nor sellers are in control. Often signals a trend reversal when it appears after a strong move.",
            },
            {
              name: "Hammer",
              color: GREEN,
              bg: "rgba(66,224,154,0.07)",
              desc: "A small body near the top with a long lower wick (at least 2x the body). It forms after a downtrend and signals buyers rejected the low price — potential bullish reversal. The inverted hammer looks the same but upside-down.",
            },
            {
              name: "Engulfing",
              color: RED,
              bg: "rgba(255,180,171,0.07)",
              desc: "A two-candle pattern where the second candle's body completely engulfs the first. A bullish engulfing (green swallows red) after a downtrend signals buyers taking control. A bearish engulfing signals the opposite.",
            },
          ].map((p) => (
            <div
              key={p.name}
              className="p-4 rounded-xl border border-border flex flex-col gap-2"
              style={{ background: p.bg }}
            >
              <span className="font-bold text-sm" style={{ color: p.color }}>
                {p.name}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <Callout type="warning">
          No pattern is 100% reliable. Always look for confirmation — a strong
          candle in the expected direction after the signal — before acting on a
          pattern.
        </Callout>
      </Section>

      {/* 3. Support and resistance */}
      <Section
        title="Support and Resistance"
        icon={BarChart2}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          Support and resistance are horizontal price levels where the market
          has historically reversed or paused. They are the most widely used
          concept in technical analysis because they reflect the collective
          memory of market participants — traders remember where price stopped
          before, and act on it again.
        </p>

        <Calloutbox>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex gap-3 items-start">
              <span
                className="font-semibold w-24 shrink-0"
                style={{ color: GREEN }}
              >
                Support
              </span>
              <span className="text-muted-foreground leading-relaxed">
                A price level where demand is strong enough to stop a decline.
                Think of it as a floor. When price falls to support, buyers
                tend to enter, pushing price back up. If price breaks below
                support convincingly, that level often becomes new resistance.
              </span>
            </div>
            <div className="flex gap-3 items-start border-t border-border pt-3">
              <span
                className="font-semibold w-24 shrink-0"
                style={{ color: RED }}
              >
                Resistance
              </span>
              <span className="text-muted-foreground leading-relaxed">
                A price level where supply is strong enough to stop a rise.
                Think of it as a ceiling. When price rises to resistance,
                sellers tend to dominate and push price back down. If broken,
                resistance flips to support.
              </span>
            </div>
          </div>
        </Calloutbox>

        <p>
          To identify support and resistance, look for price levels where the
          chart has touched and reversed multiple times. The more times a level
          has held, the more significant it is. Round numbers like $50,000 for
          Bitcoin act as psychological support/resistance because many traders
          place orders at round numbers.
        </p>
        <p>
          When price breaks through a strong resistance level with high volume,
          that is called a{" "}
          <span className="font-semibold" style={{ color: PRIMARY }}>
            breakout
          </span>{" "}
          — often the start of a significant new move. When it fails to break
          and reverses, it is called a{" "}
          <span className="font-semibold" style={{ color: RED }}>
            rejection
          </span>
          .
        </p>
        <Callout type="tip">
          Draw your support and resistance lines at the body of candles, not
          the wicks. Bodies represent where price consistently traded; wicks
          are outlier extremes.
        </Callout>
      </Section>

      {/* 4. Timeframes */}
      <Section
        title="Timeframes Explained"
        icon={Clock}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          The same chart looks completely different depending on the timeframe
          you choose. A coin might be in a strong uptrend on the daily chart
          while pulling back on the 15-minute chart. Understanding timeframes
          helps you align your trades with the bigger picture.
        </p>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden mt-1">
          {[
            {
              tf: "1m / 5m",
              use: "Scalping",
              desc: "Extremely short-term. Very noisy — lots of random movement. Only useful for very fast traders who want to capture tiny moves. High stress, high transaction costs.",
              color: RED,
            },
            {
              tf: "15m / 30m",
              use: "Short-term trading",
              desc: "Good for day traders who open and close positions within a few hours. Enough detail to spot intraday patterns without too much noise.",
              color: "#f97316",
            },
            {
              tf: "1h / 4h",
              use: "Swing trading",
              desc: "The sweet spot for most traders. Clean signals, clear trends. Use the 4h to understand trend direction and the 1h to time entries. Most technical patterns are more reliable here.",
              color: PRIMARY,
            },
            {
              tf: "1d / 1w",
              use: "Position trading",
              desc: "Long-term trend identification. Fewer signals but much more reliable. Professional traders and institutions use daily charts to make high-conviction decisions.",
              color: GREEN,
            },
          ].map((row) => (
            <div key={row.tf} className="flex gap-4 px-4 py-3.5 bg-card">
              <div className="w-20 shrink-0">
                <span
                  className="font-mono font-bold text-sm"
                  style={{ color: row.color }}
                >
                  {row.tf}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  {row.use}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {row.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Callout type="tip">
          Always check the higher timeframe first. If the daily chart shows a
          strong downtrend, be cautious about going long on the 15m chart —
          you are trading against the bigger trend.
        </Callout>
      </Section>

      {/* Quiz */}
      <LearnQuiz
        quizId="reading-charts"
        questions={[
          {
            question: "What does a green candlestick indicate?",
            options: ["Price fell", "Price rose", "No change", "High volume"],
            correct: 1,
            explanation:
              "A green (bullish) candle means the closing price was higher than the opening price.",
          },
          {
            question: "What is RSI primarily used for?",
            options: [
              "Measuring volume",
              "Identifying overbought/oversold conditions",
              "Predicting exact prices",
              "Calculating fees",
            ],
            correct: 1,
            explanation:
              "RSI (Relative Strength Index) measures momentum and helps identify overbought (>70) or oversold (<30) conditions.",
          },
          {
            question:
              "A 'higher high, higher low' pattern suggests a...",
            options: [
              "Downtrend",
              "Sideways market",
              "Uptrend",
              "Reversal",
            ],
            correct: 2,
            explanation:
              "Higher highs and higher lows are the definition of an uptrend in technical analysis.",
          },
          {
            question: "Which timeframe shows the most detail?",
            options: ["1W", "1D", "1H", "1M (monthly)"],
            correct: 2,
            explanation:
              "Shorter timeframes like 1H show more granular price movements than daily or weekly charts.",
          },
        ]}
      />

      {/* Up Next + CTA */}
      <div className="flex flex-col gap-4">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card"
        >
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Up Next
            </p>
            <p className="font-bold text-sm">Risk Management</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Protect your capital with stop-losses, position sizing, and
              portfolio diversification.
            </p>
          </div>
          <Link
            href="/learn/risk-management"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
          >
            Next Guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7 rounded-2xl border"
          style={{
            background:
              "linear-gradient(135deg, rgba(140,205,255,0.07) 0%, rgba(66,224,154,0.07) 100%)",
            borderColor: "rgba(140,205,255,0.2)",
          }}
        >
          <div>
            <h2 className="text-lg font-bold mb-1">Practice on CrySer</h2>
            <p className="text-sm text-muted-foreground">
              Open a live chart and practice reading candlesticks on real
              price data.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
          >
            Go to Markets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
