import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Lightbulb,
  AlertTriangle,
  CircleDot,
  Clock,
  Zap,
  Sun,
  TrendingUp,
  RefreshCw,
  Lock,
} from "lucide-react";

export const metadata = { title: "Trading Strategies — CrySer Learn" };

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

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

export default function TradingStrategiesPage() {
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
              color: ORANGE,
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.3)",
            }}
          >
            Advanced
          </span>
          <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
            <Clock className="h-3 w-3" /> 15 min read
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(249,115,22,0.1)" }}
          >
            <Layers className="h-5 w-5" style={{ color: ORANGE }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trading Strategies</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Find the approach that matches your personality and time commitment
            </p>
          </div>
        </div>
        <Callout type="info">
          There is no universally "best" trading strategy. The best strategy is
          the one you can execute consistently without emotional interference.
          Read all five, then pick one and practice it exclusively until you
          master it.
        </Callout>
      </div>

      {/* Strategy Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { name: "Scalping", time: "Seconds–minutes", color: RED },
          { name: "Day Trading", time: "Minutes–hours", color: ORANGE },
          { name: "Swing Trading", time: "Days–weeks", color: PRIMARY },
          { name: "DCA", time: "Weeks–months", color: GREEN },
          { name: "HODLing", time: "Months–years", color: "#a855f7" },
        ].map((s) => (
          <div
            key={s.name}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card text-center"
          >
            <span className="font-bold text-xs" style={{ color: s.color }}>
              {s.name}
            </span>
            <span className="text-[10px] text-muted-foreground leading-snug">
              {s.time}
            </span>
          </div>
        ))}
      </div>

      {/* 1. Scalping */}
      <Section
        title="Scalping"
        icon={Zap}
        color={RED}
        bg="rgba(255,180,171,0.1)"
      >
        <p>
          Scalping is the fastest trading style. Scalpers open and close dozens
          or even hundreds of trades per day, targeting tiny price movements —
          typically 0.1% to 0.5% per trade. The goal is to accumulate small
          gains consistently throughout the day.
        </p>
        <p>
          Scalpers exclusively use 1-minute and 5-minute charts and rely on
          speed, discipline, and tight risk management. They need extremely
          liquid markets (BTC, ETH) where orders fill instantly with minimal
          slippage. Even small spreads eat significantly into scalping profits,
          so cost per trade matters enormously.
        </p>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-xs font-semibold text-foreground">
              Scalping at a glance
            </p>
          </div>
          <div className="px-4 py-2">
            <StatRow label="Timeframe" value="1m – 5m" color={RED} />
            <StatRow label="Hold duration" value="Seconds to minutes" color={RED} />
            <StatRow label="Trades per day" value="10 – 100+" color={ORANGE} />
            <StatRow label="Target per trade" value="0.1% – 0.5%" color={GREEN} />
            <StatRow label="Difficulty" value="Very High" color={RED} />
            <StatRow label="Time required" value="Full attention during session" color={ORANGE} />
          </div>
        </div>

        <Callout type="warning">
          Scalping requires exceptional focus and emotional control. It is the
          most stressful style and the hardest to be consistently profitable
          in. For beginners, swing trading or DCA are far better starting points.
        </Callout>
      </Section>

      {/* 2. Day Trading */}
      <Section
        title="Day Trading"
        icon={Sun}
        color={ORANGE}
        bg="rgba(249,115,22,0.1)"
      >
        <p>
          Day traders open and close all positions within the same trading
          session — they do not hold overnight. This eliminates the risk of
          price gaps from news events that occur outside market hours. In
          crypto, which trades 24/7, day traders typically define their own
          "session" (e.g., 4-8 hours of active trading).
        </p>
        <p>
          Day trading uses 15-minute to 1-hour charts for entries and 4-hour
          charts to understand the daily trend. A typical day trade might last
          30 minutes to several hours, targeting moves of 1% to 5%. Day traders
          use technical analysis heavily: support/resistance, RSI, MACD, and
          moving averages.
        </p>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-xs font-semibold text-foreground">
              Day trading at a glance
            </p>
          </div>
          <div className="px-4 py-2">
            <StatRow label="Timeframe" value="15m – 1h (context: 4h)" color={ORANGE} />
            <StatRow label="Hold duration" value="30 minutes to several hours" color={ORANGE} />
            <StatRow label="Trades per day" value="2 – 10" color={ORANGE} />
            <StatRow label="Target per trade" value="1% – 5%" color={GREEN} />
            <StatRow label="Difficulty" value="High" color={ORANGE} />
            <StatRow label="Time required" value="3–8 hours active attention" color={ORANGE} />
          </div>
        </div>

        <p>
          The hardest discipline for day traders is sticking to their daily loss
          limit — a maximum loss per day after which they stop trading entirely.
          A common rule is 3% of the account per day. This prevents one bad
          morning from turning into a catastrophic session.
        </p>
        <Callout type="tip">
          Start your day trading session by identifying the key levels (support,
          resistance, daily high/low) before placing any trade. Knowing where
          you are on the chart prevents reactive, impulsive entries.
        </Callout>
      </Section>

      {/* 3. Swing Trading */}
      <Section
        title="Swing Trading"
        icon={TrendingUp}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          Swing trading captures medium-term price "swings" — moves that
          typically last anywhere from 2 days to a few weeks. It is the most
          accessible style for people who cannot watch charts full-time. Swing
          traders check charts once or twice a day, set orders at key levels,
          and let the trade develop.
        </p>
        <p>
          The 4-hour and daily charts are the primary tools. Swing traders look
          for clear trend structures: higher highs and higher lows in uptrends,
          lower lows and lower highs in downtrends. They enter on pullbacks to
          support in an uptrend, or bounces to resistance in a downtrend, with
          targets at the next major level.
        </p>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-xs font-semibold text-foreground">
              Swing trading at a glance
            </p>
          </div>
          <div className="px-4 py-2">
            <StatRow label="Timeframe" value="4h – 1d" color={PRIMARY} />
            <StatRow label="Hold duration" value="2 days to 3 weeks" color={PRIMARY} />
            <StatRow label="Trades per week" value="1 – 5" color={PRIMARY} />
            <StatRow label="Target per trade" value="5% – 30%" color={GREEN} />
            <StatRow label="Difficulty" value="Moderate" color={PRIMARY} />
            <StatRow label="Time required" value="30–60 min/day chart review" color={GREEN} />
          </div>
        </div>

        <Callout type="tip">
          Swing trading is the recommended starting strategy for most traders.
          The slower pace allows time to think through each trade calmly, and
          the larger targets make risk/reward ratios easier to achieve.
        </Callout>
      </Section>

      {/* 4. DCA */}
      <Section
        title="Dollar Cost Averaging (DCA)"
        icon={RefreshCw}
        color={GREEN}
        bg="rgba(66,224,154,0.1)"
      >
        <p>
          Dollar Cost Averaging (DCA) is not active trading — it is a
          systematic investment strategy. Instead of trying to time the market
          perfectly, you invest a fixed dollar amount at regular intervals
          (weekly, monthly) regardless of price. Over time, you accumulate more
          coins when prices are low and fewer when prices are high, averaging
          your cost basis.
        </p>
        <p>
          DCA removes the psychological burden of trying to buy the "perfect"
          dip. Studies consistently show that even professional investors
          struggle to outperform simple, consistent DCA over long periods. For
          most people who are long-term believers in crypto but do not want to
          actively trade, DCA is the most rational approach.
        </p>

        <div
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{
            background: "rgba(66,224,154,0.05)",
            borderColor: "rgba(66,224,154,0.2)",
          }}
        >
          <p className="text-xs font-semibold" style={{ color: GREEN }}>
            DCA example: Buying $100 of BTC monthly
          </p>
          <div className="grid grid-cols-4 gap-2 text-[11px]">
            {[
              { month: "Month 1", price: "$60,000", coins: "0.00167" },
              { month: "Month 2", price: "$45,000", coins: "0.00222" },
              { month: "Month 3", price: "$52,000", coins: "0.00192" },
              { month: "Month 4", price: "$70,000", coins: "0.00143" },
            ].map((row) => (
              <div
                key={row.month}
                className="flex flex-col gap-1 p-2 rounded-lg border border-border bg-card"
              >
                <span className="font-semibold text-foreground text-[10px]">
                  {row.month}
                </span>
                <span className="text-muted-foreground">{row.price}</span>
                <span style={{ color: GREEN }}>{row.coins} BTC</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Spent $400 total. Average cost = $400 / 0.00724 BTC ={" "}
            <span style={{ color: GREEN }}>~$55,248 per BTC</span> — below the
            highest price paid.
          </p>
        </div>

        <Callout type="info">
          DCA works best with assets you believe in long-term. It is not a
          strategy for speculative altcoins with high failure risk — stick to
          major coins like BTC and ETH for DCA strategies.
        </Callout>
      </Section>

      {/* 5. HODLing */}
      <Section
        title="HODLing"
        icon={Lock}
        color="#a855f7"
        bg="rgba(168,85,247,0.1)"
      >
        <p>
          HODL originated from a 2013 Bitcoin forum post where a user
          accidentally typed "HODL" instead of "HOLD" during a market crash.
          The community adopted it as an acronym: "Hold On for Dear Life." As a
          strategy, HODLing means buying an asset and holding it through all
          volatility with a long-term conviction.
        </p>
        <p>
          HODLing is based on the thesis that despite massive short-term
          volatility, certain crypto assets (primarily Bitcoin and Ethereum) will
          be worth significantly more in 5–10 years than today. Rather than
          trying to trade around cycles and risk missing big moves, HODLers
          simply hold and ignore the noise.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {[
            {
              label: "Advantages",
              color: GREEN,
              points: [
                "No time commitment — check prices occasionally",
                "Avoids the most common trading mistake: buying and selling at the wrong times",
                "Tax advantages in many jurisdictions for long-term holds",
                "Works well in long-term bull markets",
              ],
            },
            {
              label: "Disadvantages",
              color: RED,
              points: [
                "Difficult psychologically during 80%+ bear market drawdowns",
                "No protection against assets that go to zero",
                "Capital locked up — cannot capture other opportunities",
                "Only works for fundamentally sound assets",
              ],
            },
          ].map((side) => (
            <div
              key={side.label}
              className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2"
            >
              <span
                className="font-bold text-xs"
                style={{ color: side.color }}
              >
                {side.label}
              </span>
              <ul className="flex flex-col gap-1.5">
                {side.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-xs text-muted-foreground leading-snug">
                    <span style={{ color: side.color }} className="shrink-0 mt-0.5">
                      •
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Callout type="tip">
          HODLing and active trading are not mutually exclusive. Many successful
          investors keep a "core" long-term holding they never touch, while
          actively trading a smaller portion of their portfolio.
        </Callout>
      </Section>

      {/* Up Next + CTA */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Up Next
            </p>
            <p className="font-bold text-sm">Understanding Order Books</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              How order books work, bid-ask spread, and reading market depth.
            </p>
          </div>
          <Link
            href="/learn/order-books"
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
              Test your chosen strategy with $1,000 in virtual USDT — no risk.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
          >
            Start Trading <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
