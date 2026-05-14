import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  CircleDot,
  Clock,
  Activity,
  BarChart2,
} from "lucide-react";

export const metadata = { title: "Technical Indicators — CrySer Learn" };

const PRIMARY = "#8ccdff";
const GREEN = "#42e09a";
const RED = "#ffb4ab";
const ORANGE = "#f97316";

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

export default function TechnicalIndicatorsPage() {
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
              color: PRIMARY,
              background: "rgba(140,205,255,0.1)",
              border: "1px solid rgba(140,205,255,0.3)",
            }}
          >
            Intermediate
          </span>
          <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
            <Clock className="h-3 w-3" /> 12 min read
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(249,115,22,0.1)" }}
          >
            <TrendingUp className="h-5 w-5" style={{ color: ORANGE }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Technical Indicators</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tools that transform price data into actionable signals
            </p>
          </div>
        </div>
        <Callout type="info">
          Indicators are mathematical calculations applied to price or volume
          data. They do not predict the future — they help you understand the
          current state of the market and identify high-probability setups. Use
          them as supporting evidence, not as oracles.
        </Callout>
      </div>

      {/* 1. RSI */}
      <Section
        title="RSI — Relative Strength Index"
        icon={Activity}
        color={ORANGE}
        bg="rgba(249,115,22,0.1)"
      >
        <p>
          The{" "}
          <span className="font-semibold" style={{ color: ORANGE }}>
            Relative Strength Index (RSI)
          </span>{" "}
          measures the speed and magnitude of recent price changes to evaluate
          whether an asset is overbought or oversold. It oscillates between 0
          and 100 and is typically calculated over 14 periods.
        </p>

        <Calloutbox>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* Mini RSI gauge */}
              <div className="relative h-4 w-full max-w-xs rounded-full overflow-hidden flex-1">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${RED} 0%, ${RED} 30%, rgba(140,205,255,0.3) 30%, rgba(140,205,255,0.3) 70%, ${GREEN} 70%, ${GREEN} 100%)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-1.5">
                  <span className="text-[9px] font-bold text-white/80">0</span>
                  <span className="text-[9px] font-bold text-white/80">30</span>
                  <span className="text-[9px] font-bold text-white/80">70</span>
                  <span className="text-[9px] font-bold text-white/80">100</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { zone: "Below 30", label: "Oversold", color: GREEN, desc: "Asset may be undervalued. Potential buy signal — price could bounce." },
                { zone: "30 – 70", label: "Neutral", color: PRIMARY, desc: "Normal range. No extreme conditions. Price action and trend context matter more here." },
                { zone: "Above 70", label: "Overbought", color: RED, desc: "Asset may be overvalued. Potential sell signal — price could pull back." },
              ].map((z) => (
                <div
                  key={z.zone}
                  className="p-2.5 rounded-lg border border-border flex flex-col gap-1"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">{z.zone}</span>
                  <span className="font-bold text-xs" style={{ color: z.color }}>{z.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-snug">{z.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Calloutbox>

        <p>
          RSI divergence is a powerful signal. If price makes a new high but RSI
          makes a lower high, this is called{" "}
          <span className="font-semibold" style={{ color: RED }}>
            bearish divergence
          </span>{" "}
          — momentum is weakening even as price rises. The opposite —{" "}
          <span className="font-semibold" style={{ color: GREEN }}>
            bullish divergence
          </span>{" "}
          — occurs when price makes a new low but RSI makes a higher low,
          suggesting selling pressure is exhausting.
        </p>
        <p>
          Do not use RSI in isolation. In a strong uptrend, RSI can stay above
          70 for extended periods. In a strong downtrend, it can stay below 30.
          Always combine RSI signals with trend direction and price structure.
        </p>
        <Callout type="tip">
          RSI works best on the 1h and 4h timeframes. On 1-minute charts it
          generates too many false signals to be reliable.
        </Callout>
      </Section>

      {/* 2. MACD */}
      <Section
        title="MACD — Moving Average Convergence Divergence"
        icon={BarChart2}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          MACD is a trend-following momentum indicator that shows the
          relationship between two exponential moving averages. It consists of
          three components:
        </p>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden mt-1">
          {[
            {
              name: "MACD Line",
              formula: "EMA(12) − EMA(26)",
              color: PRIMARY,
              desc: "The difference between the 12-period and 26-period EMAs. When positive, the shorter EMA is above the longer — bullish momentum. When negative — bearish.",
            },
            {
              name: "Signal Line",
              formula: "EMA(9) of MACD",
              color: ORANGE,
              desc: "A 9-period EMA smoothed from the MACD line. When MACD crosses above the Signal line, it is a bullish crossover. When it crosses below, bearish.",
            },
            {
              name: "Histogram",
              formula: "MACD − Signal",
              color: GREEN,
              desc: "Bars above/below zero showing the distance between MACD and Signal. Growing bars = strengthening momentum. Shrinking bars = momentum fading — potential reversal incoming.",
            },
          ].map((row) => (
            <div key={row.name} className="flex gap-4 px-4 py-3.5 bg-card">
              <div className="w-28 shrink-0">
                <p className="font-semibold text-xs" style={{ color: row.color }}>
                  {row.name}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  {row.formula}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {row.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-1">
          The most common MACD signal is the{" "}
          <span className="font-semibold" style={{ color: GREEN }}>
            bullish crossover
          </span>
          : when the MACD line crosses above the Signal line, especially when
          both are below zero (negative territory). This suggests momentum is
          shifting from bearish to bullish. The{" "}
          <span className="font-semibold" style={{ color: RED }}>
            bearish crossover
          </span>{" "}
          (MACD below Signal, especially above zero) signals fading bullish
          momentum.
        </p>
        <Callout type="warning">
          MACD is a lagging indicator — it uses historical data. By the time a
          crossover appears, the move may already be underway. Use it to confirm
          trends, not to predict reversals.
        </Callout>
      </Section>

      {/* 3. Moving Averages */}
      <Section
        title="Moving Averages — EMA 9, 21, 200"
        icon={TrendingUp}
        color={GREEN}
        bg="rgba(66,224,154,0.1)"
      >
        <p>
          A{" "}
          <span className="font-semibold" style={{ color: GREEN }}>
            moving average
          </span>{" "}
          smooths price data by calculating the average over a set number of
          periods, creating a line that filters out short-term noise. The{" "}
          <span className="font-semibold" style={{ color: GREEN }}>
            Exponential Moving Average (EMA)
          </span>{" "}
          gives more weight to recent prices, making it more responsive to
          current market conditions than a Simple Moving Average (SMA).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
          {[
            {
              period: "EMA 9",
              role: "Short-term trend",
              color: GREEN,
              desc: "Very sensitive to price. Used by day traders to identify the immediate momentum direction. Crosses above/below EMA 21 give quick signals.",
            },
            {
              period: "EMA 21",
              role: "Medium-term trend",
              color: PRIMARY,
              desc: "The primary swing trading EMA. Price holding above EMA 21 = bullish bias. Price below = bearish. Ideal for timing pullback entries in trending markets.",
            },
            {
              period: "EMA 200",
              role: "Long-term trend",
              color: ORANGE,
              desc: "The most watched line by institutions. Price above EMA 200 = bull market. Below = bear market. The 'golden cross' (EMA 50 above EMA 200) is a major bullish signal.",
            },
          ].map((ma) => (
            <div
              key={ma.period}
              className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1.5"
            >
              <span
                className="font-bold text-sm font-mono"
                style={{ color: ma.color }}
              >
                {ma.period}
              </span>
              <span className="text-xs font-semibold text-foreground">
                {ma.role}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {ma.desc}
              </p>
            </div>
          ))}
        </div>

        <p>
          A powerful entry technique is trading pullbacks to moving averages.
          In an uptrend, when price pulls back to touch EMA 21 and then bounces,
          that is a high-quality entry — you are buying at a known area of
          historical support with the trend on your side.
        </p>
        <Callout type="tip">
          Stack multiple EMAs (9, 21, 200) on the same chart. When they are in
          order (9 above 21 above 200) and price is above all three, conditions
          are strongly bullish. The reverse signals a strong downtrend.
        </Callout>
      </Section>

      {/* 4. Bollinger Bands */}
      <Section
        title="Bollinger Bands — Volatility and Squeeze"
        icon={Activity}
        color={ORANGE}
        bg="rgba(249,115,22,0.1)"
      >
        <p>
          Bollinger Bands consist of a middle SMA (usually 20-period) and two
          outer bands set at 2 standard deviations above and below it. The bands
          dynamically widen when volatility is high and narrow when it is low.
          This makes them an excellent tool for measuring market volatility and
          timing breakouts.
        </p>

        <Calloutbox>
          <div className="flex flex-col gap-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">
              Key Bollinger Band signals:
            </p>
            {[
              {
                signal: "Band squeeze",
                color: PRIMARY,
                desc: "When bands narrow dramatically, volatility is compressing. This typically precedes a large directional move. The squeeze itself does not tell you which direction — wait for the breakout candle.",
              },
              {
                signal: "Price at upper band",
                color: RED,
                desc: "Price touching the upper band signals it is trading in the upper range of statistical normality. It does not mean \"sell immediately\" — in strong uptrends, price can ride the upper band. But it does mean the asset is extended.",
              },
              {
                signal: "Price at lower band",
                color: GREEN,
                desc: "Touching the lower band in a range-bound market can signal oversold conditions and a potential bounce. However, in a downtrend, price breaking below the lower band confirms strong selling pressure.",
              },
              {
                signal: "Band walk",
                color: ORANGE,
                desc: "In a strong trend, price can hug and \"walk\" along one of the outer bands for extended periods. This is a sign of extreme momentum, not a reversal signal.",
              },
            ].map((s) => (
              <div
                key={s.signal}
                className="flex gap-3 pt-2 border-t border-border first:border-0 first:pt-0"
              >
                <span
                  className="font-semibold w-36 shrink-0 text-xs"
                  style={{ color: s.color }}
                >
                  {s.signal}
                </span>
                <span className="leading-relaxed">{s.desc}</span>
              </div>
            ))}
          </div>
        </Calloutbox>

        <p>
          The Bollinger Band squeeze is the most actionable signal. After a long
          period of low volatility (tight bands), the market tends to make a
          sharp move. Combine the squeeze with volume analysis and MACD direction
          to anticipate which way the breakout will go.
        </p>
        <Callout type="info">
          Bollinger Bands are most useful in ranging (sideways) markets. In
          trending markets, use moving averages instead — price will
          consistently trade outside one band in a strong trend, giving false
          signals.
        </Callout>
      </Section>

      {/* Up Next + CTA */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Up Next
            </p>
            <p className="font-bold text-sm">Trading Strategies</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scalping, swing trading, and DCA — find the strategy that fits
              your style.
            </p>
          </div>
          <Link
            href="/learn/trading-strategies"
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
              Apply these indicators on live charts and test your analysis.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
          >
            Open Charts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
