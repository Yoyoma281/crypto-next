import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Lightbulb,
  AlertTriangle,
  CircleDot,
  Clock,
  TrendingDown,
  PieChart,
  Target,
} from "lucide-react";
import LearnQuiz from "@/components/LearnQuiz";

export const metadata = { title: "Risk Management — CrySer Learn" };

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

export default function RiskManagementPage() {
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
            <Clock className="h-3 w-3" /> 10 min read
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(140,205,255,0.1)" }}
          >
            <Shield className="h-5 w-5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Risk Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              The skill that separates long-term survivors from blown accounts
            </p>
          </div>
        </div>
        <Callout type="info">
          Professional traders often say: "Your job is not to make money — your
          job is to not lose it." Risk management is the single most important
          skill in trading. All the analysis in the world is useless without it.
        </Callout>
      </div>

      {/* 1. The 1-2% rule */}
      <Section
        title="The 1-2% Rule"
        icon={Target}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          The most widely adopted risk management rule among professional traders
          is simple:{" "}
          <span className="font-semibold" style={{ color: PRIMARY }}>
            never risk more than 1-2% of your total portfolio on any single
            trade
          </span>
          . This sounds conservative — and it is. That is the point.
        </p>
        <p>
          If your portfolio is $1,000 and you apply the 2% rule, your maximum
          loss on any single trade is $20. Even if you have 10 losing trades in
          a row — an extreme streak — you have only lost $200 and still have
          $800 to trade with. Your account survives. A 50% loss requires a 100%
          gain to break even; a 20% loss requires only a 25% gain.
        </p>

        <Calloutbox>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold text-foreground">
              Comparing risk approaches on a $1,000 account:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "10% per trade",
                  losses: "7 consecutive losses",
                  result: "~$478 remaining",
                  color: RED,
                },
                {
                  label: "5% per trade",
                  losses: "7 consecutive losses",
                  result: "~$698 remaining",
                  color: "#f97316",
                },
                {
                  label: "2% per trade",
                  losses: "7 consecutive losses",
                  result: "~$868 remaining",
                  color: GREEN,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1.5 p-3 rounded-lg border border-border"
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: row.color }}
                  >
                    {row.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {row.losses}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {row.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Calloutbox>

        <p>
          Even the best traders in the world have losing streaks. The 1-2% rule
          ensures that no single trade — or even a run of bad trades — can end
          your trading career. Small, consistent losses are acceptable and
          recoverable. Large losses are not.
        </p>
        <Callout type="tip">
          On CrySer, treat your $1,000 virtual balance as if it were real.
          Practice the 1-2% rule from day one. The habits you form in paper
          trading carry directly into real trading.
        </Callout>
      </Section>

      {/* 2. Stop-loss orders */}
      <Section
        title="Stop-Loss Orders"
        icon={TrendingDown}
        color={RED}
        bg="rgba(255,180,171,0.1)"
      >
        <p>
          A{" "}
          <span className="font-semibold" style={{ color: RED }}>
            stop-loss
          </span>{" "}
          is a predefined price level at which you automatically exit a losing
          trade. It is your safety net — if the market moves against you beyond
          a certain point, you get out before the loss becomes catastrophic.
        </p>
        <p>
          The key word is "predefined." You must set your stop-loss{" "}
          <em>before</em> you enter the trade, while you are thinking clearly.
          Once you are in a losing position, emotions — specifically hope and
          denial — will push you to avoid closing the trade. A pre-set
          stop-loss removes that decision from the emotional moment.
        </p>

        <div className="flex flex-col gap-3 mt-1">
          <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-border bg-card">
            <p className="text-xs font-bold text-foreground">
              How to calculate your stop-loss price:
            </p>
            <ol className="flex flex-col gap-2 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
              <li>
                Decide the maximum dollar amount you are willing to lose on this
                trade (e.g., $20 on a $1,000 account = 2% rule).
              </li>
              <li>
                Calculate the percentage drop from your entry price that equals
                that loss for your position size.
              </li>
              <li>
                Set the stop-loss at that price. Example: bought $200 of BTC at
                $60,000. A $20 loss is 10% of $200. Stop-loss at $54,000 (10%
                below entry).
              </li>
            </ol>
          </div>
        </div>

        <p>
          Place stop-losses at logical price levels — not arbitrary percentages.
          Good stop-loss locations include: just below a strong support level,
          below the low of the most recent swing, or below a key moving average.
          This way, if price breaks those levels, the market is genuinely telling
          you the trade thesis is wrong.
        </p>
        <Callout type="warning">
          Never move your stop-loss further away from your entry price to "give
          the trade more room." This is one of the most destructive habits a
          trader can develop. If your stop is hit, accept the small loss and
          move on.
        </Callout>
      </Section>

      {/* 3. Position sizing */}
      <Section
        title="Position Sizing"
        icon={Target}
        color={GREEN}
        bg="rgba(66,224,154,0.1)"
      >
        <p>
          Position sizing determines how much capital you allocate to each
          trade. It is the mechanism that enforces your risk rules. Two traders
          can have the same stop-loss percentage but very different risk outcomes
          based on how much of their portfolio they put in.
        </p>

        <Calloutbox>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-foreground">
              Position sizing formula (concept):
            </p>
            <div
              className="rounded-lg p-3 text-sm font-mono"
              style={{ background: "rgba(140,205,255,0.05)", border: "1px solid rgba(140,205,255,0.2)" }}
            >
              <span style={{ color: GREEN }}>Position Size</span>
              {" = "}
              <span style={{ color: PRIMARY }}>Account Risk ($)</span>
              {" / "}
              <span style={{ color: RED }}>Trade Risk (%)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Example: Account = $1,000. Risk per trade = 2% = $20. You plan to
              buy BTC with a 5% stop-loss. Position size = $20 / 5% = $400. Put
              $400 into the trade, not your whole balance.
            </p>
          </div>
        </Calloutbox>

        <p>
          Most beginners size their positions based on how confident they feel —
          which leads to over-sizing on bad trades and under-sizing on good ones.
          Systematic position sizing removes emotion from the equation and
          ensures consistent risk across all trades regardless of how you feel
          about any particular setup.
        </p>
        <Callout type="tip">
          A good starting rule: never put more than 10-20% of your total balance
          into a single position, even if your risk per trade is small. This
          prevents concentration risk.
        </Callout>
      </Section>

      {/* 4. Portfolio diversification */}
      <Section
        title="Portfolio Diversification"
        icon={PieChart}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          Diversification means spreading your capital across multiple assets
          instead of concentrating it in one. In crypto, this means holding
          several coins from different sectors rather than putting everything
          into Bitcoin or a single altcoin.
        </p>
        <p>
          The logic is simple: different assets do not always move together.
          When Bitcoin falls sharply, some assets may hold value better.
          Diversification does not eliminate risk — it{" "}
          <span className="font-semibold" style={{ color: PRIMARY }}>
            reduces the impact of any single asset going against you
          </span>
          . A 50% crash in one coin that represents 10% of your portfolio hurts
          much less than the same crash in a coin that represents 80%.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {[
            {
              title: "Correlated assets",
              desc: "Most altcoins move with Bitcoin. True diversification means different sectors: DeFi, Layer 1s, gaming, stablecoins. Don't just hold 10 altcoins — they may all crash together.",
              color: "#f97316",
            },
            {
              title: "Cash is a position",
              desc: "Holding USDT (stable cash) is a valid strategy. Being 50% in cash means a 20% crash in your positions only costs you 10% of your portfolio. Dry powder lets you buy dips.",
              color: GREEN,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1.5"
            >
              <p
                className="font-semibold text-sm"
                style={{ color: item.color }}
              >
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Cutting losses */}
      <Section
        title="The Importance of Cutting Losses Quickly"
        icon={TrendingDown}
        color={RED}
        bg="rgba(255,180,171,0.1)"
      >
        <p>
          The single biggest mistake that wipes out new traders is holding
          losing trades far too long. The psychology is understandable: you do
          not want to admit you were wrong, you hope for a recovery, you
          convince yourself "it will come back." Sometimes it does — but often
          it does not, and the loss compounds.
        </p>
        <p>
          Markets can move faster and further than most people expect. A 20%
          loss requires a 25% gain to break even. A 50% loss requires a 100%
          gain. A 90% loss requires a 900% gain. Small, controlled losses are
          not just acceptable — they are{" "}
          <span className="font-semibold" style={{ color: RED }}>
            essential
          </span>{" "}
          to long-term survival. Every professional trader has a strategy for
          cutting losses before they become catastrophic.
        </p>

        <Calloutbox>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-bold text-foreground text-xs">
              Recovery needed after losses:
            </p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { loss: "-10%", need: "+11.1%", color: GREEN },
                { loss: "-25%", need: "+33.3%", color: "#f97316" },
                { loss: "-50%", need: "+100%", color: RED },
                { loss: "-75%", need: "+300%", color: "#dc2626" },
              ].map((row) => (
                <div
                  key={row.loss}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border"
                >
                  <span className="font-bold" style={{ color: row.color }}>
                    {row.loss}
                  </span>
                  <span className="text-[10px] text-muted-foreground">needs</span>
                  <span className="font-semibold text-foreground text-[11px]">
                    {row.need}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Calloutbox>

        <Callout type="warning">
          "Hoping" is not a trading strategy. If the reason you entered a trade
          is no longer valid, exit immediately. The market does not care about
          your entry price.
        </Callout>
      </Section>

      {/* Quiz */}
      <LearnQuiz
        quizId="risk-management"
        questions={[
          {
            question:
              "According to the 1-2% rule, how much of a $1,000 account should you risk per trade?",
            options: ["$50–$100", "$10–$20", "$100–$200", "$200+"],
            correct: 1,
            explanation:
              "The 1-2% rule means risking no more than $10–$20 on a $1,000 account per trade, so a losing streak can't wipe you out.",
          },
          {
            question: "When should you set your stop-loss?",
            options: [
              "After the trade starts losing",
              "Before entering the trade",
              "After hitting your profit target",
              "When the market closes",
            ],
            correct: 1,
            explanation:
              "Stop-losses must be set before entry, while you can think clearly — not during the emotional heat of a losing position.",
          },
          {
            question: "What is the purpose of position sizing?",
            options: [
              "To maximise profit on every trade",
              "To ensure consistent risk across all trades",
              "To hold as many coins as possible",
              "To avoid paying fees",
            ],
            correct: 1,
            explanation:
              "Position sizing ensures you risk a consistent dollar amount regardless of how you feel about a particular trade — removing emotion.",
          },
          {
            question:
              "If you suffer a 50% loss on your portfolio, what gain is needed to break even?",
            options: ["50%", "75%", "100%", "25%"],
            correct: 2,
            explanation:
              "A 50% loss cuts your account in half — you need a 100% gain just to return to the starting balance. This is why avoiding large losses is critical.",
          },
        ]}
      />

      {/* Up Next + CTA */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Up Next
            </p>
            <p className="font-bold text-sm">Technical Indicators</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use RSI, MACD, EMA, and Bollinger Bands to time your entries and
              exits.
            </p>
          </div>
          <Link
            href="/learn/technical-indicators"
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
              Apply risk management with $1,000 in virtual USDT — zero
              financial risk.
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
