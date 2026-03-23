import Link from "next/link";
import {
  ArrowLeft, BookOpen, TrendingUp, TrendingDown, BarChart2,
  Layers, ShieldCheck, Lightbulb, ArrowRight, CircleDot,
  AlertTriangle, Target, RefreshCw,
} from "lucide-react";

export const metadata = { title: "How to Trade — CrySer" };

function Section({ title, icon: Icon, color, bg, children }: {
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
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

function Callout({ type, children }: { type: "tip" | "warning" | "info"; children: React.ReactNode }) {
  const styles = {
    tip:     { color: "#4edea3", bg: "rgba(78,222,163,0.07)",  border: "rgba(78,222,163,0.25)",  icon: Lightbulb,      label: "Tip" },
    warning: { color: "#ffb3ad", bg: "rgba(255,179,173,0.07)",  border: "rgba(255,179,173,0.25)",  icon: AlertTriangle,  label: "Warning" },
    info:    { color: "#b9c7e0", bg: "rgba(185,199,224,0.07)",  border: "rgba(185,199,224,0.25)",  icon: CircleDot,      label: "Note" },
  }[type];
  const Icon = styles.icon;
  return (
    <div className="flex gap-3 p-4 rounded-xl border text-sm" style={{ background: styles.bg, borderColor: styles.border }}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: styles.color }} />
      <div style={{ color: styles.color }}>
        <strong>{styles.label}: </strong>
        <span className="text-foreground/80">{children}</span>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{n}</div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="pb-6 flex flex-col gap-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function TermRow({ term, def }: { term: string; def: string }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-border last:border-0 text-sm">
      <span className="font-semibold text-foreground w-36 shrink-0">{term}</span>
      <span className="text-muted-foreground">{def}</span>
    </div>
  );
}

export default function HowToTradePage() {
  return (
    <div className="max-w-3xl mx-auto py-10 flex flex-col gap-12">

      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Markets
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,161,231,0.1)" }}>
            <BookOpen className="h-5 w-5" style={{ color: "#4edea3" }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">How to Trade on CrySer</h1>
            <p className="text-sm text-muted-foreground mt-0.5">A complete guide to paper trading cryptocurrency</p>
          </div>
        </div>
        <Callout type="info">
          CrySer uses 100% real live market data but <strong>no real money</strong>. Every new account starts with $1,000 in virtual
          USDT. This is the perfect environment to learn without any financial risk.
        </Callout>
      </div>

      {/* 1. What is paper trading */}
      <Section title="What is Paper Trading?" icon={BookOpen} color="#4edea3" bg="rgba(78,222,163,0.1)">
        <p>
          Paper trading (also called simulated or virtual trading) is the practice of buying and selling assets using fake money
          while tracking real market prices. The term comes from a time when aspiring traders would record imaginary trades on
          paper to practice without risking capital.
        </p>
        <p>
          On CrySer, your trades execute at live Binance prices — so your results are as realistic as possible. The only
          difference is that your profits and losses stay virtual.
        </p>
        <Callout type="tip">
          Treat your virtual $1,000 as if it were real money. The habits you build now — discipline, patience, risk
          management — carry directly into real trading.
        </Callout>
      </Section>

      {/* 2. The Platform */}
      <Section title="Understanding the Platform" icon={Layers} color="#b9c7e0" bg="rgba(185,199,224,0.1)">
        <p>CrySer has three main areas:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
          {[
            {
              title: "Markets",
              href: "/",
              color: "#4edea3",
              bg: "rgba(78,222,163,0.07)",
              desc: "Browse 400+ USDT trading pairs with live prices, 24h change, and volume.",
            },
            {
              title: "Exchange",
              href: "/Exchange/BTCUSDT",
              color: "#b9c7e0",
              bg: "rgba(185,199,224,0.07)",
              desc: "Place buy and sell orders with a real-time TradingView chart and live order book.",
            },
            {
              title: "Portfolio",
              href: "/Portfolio",
              color: "#ffb3ad",
              bg: "rgba(255,179,173,0.07)",
              desc: "Track your holdings, see your current value, and review your trade history.",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex flex-col gap-1.5 p-4 rounded-xl border border-border hover:border-primary/40 transition-colors group"
              style={{ background: item.bg }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm" style={{ color: item.color }}>{item.title}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: item.color }} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* 3. Placing your first trade */}
      <Section title="Placing Your First Trade" icon={Target} color="#4edea3" bg="rgba(78,222,163,0.1)">
        <p>Follow these steps to place your first buy order:</p>
        <div className="mt-2">
          <Step n="1" title="Go to the Markets page">
            Browse the list of available trading pairs. Each row shows the coin name, current price, 24-hour price
            change, and volume. Click any coin to open its Exchange page.
          </Step>
          <Step n="2" title="Choose a trading pair">
            All pairs on CrySer are quoted in USDT (Tether). If you buy BTC/USDT, you spend USDT to receive
            virtual Bitcoin. Start with a well-known pair like BTC/USDT or ETH/USDT for your first trade.
          </Step>
          <Step n="3" title="Study the chart">
            The Exchange page shows a live TradingView candlestick chart. Switch between timeframes (1m, 5m, 15m,
            1h, 4h, 1d) to get different perspectives on price movement. Don&apos;t rush — watch for a few minutes first.
          </Step>
          <Step n="4" title="Enter your order">
            In the Trade panel on the right, enter the amount of USDT you want to spend (or the quantity of the
            asset you want to buy). The platform will calculate the other value automatically.
          </Step>
          <Step n="5" title="Confirm your trade">
            Click <strong>Buy</strong>. Your order executes immediately at the current live market price. Your
            USDT balance decreases and your coin holding increases in your Portfolio.
          </Step>
        </div>
        <Callout type="tip">
          Never put your entire balance into one trade. A common rule is to risk no more than 1–5% of your total
          balance on a single position.
        </Callout>
      </Section>

      {/* 4. Reading charts */}
      <Section title="Reading Candlestick Charts" icon={BarChart2} color="#b9c7e0" bg="rgba(185,199,224,0.1)">
        <p>
          CrySer uses TradingView candlestick charts — the industry standard. Each candle represents one time period
          (e.g., 1 hour on the 1h chart) and shows four prices:
        </p>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {[
            { label: "Open", desc: "The price at the start of the period.", color: "#b9c7e0" },
            { label: "Close", desc: "The price at the end of the period.", color: "#b9c7e0" },
            { label: "High", desc: "The highest price reached during the period.", color: "#4edea3" },
            { label: "Low",  desc: "The lowest price reached during the period.", color: "#ffb3ad" },
          ].map((c) => (
            <div key={c.label} className="p-3 rounded-lg border border-border bg-muted/30 flex gap-2">
              <span className="font-bold text-sm w-12 shrink-0" style={{ color: c.color }}>{c.label}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{c.desc}</span>
            </div>
          ))}
        </div>
        <p className="mt-1">
          A <span className="font-semibold" style={{ color: "#4edea3" }}>green candle</span> means the price closed
          higher than it opened (bullish). A <span className="font-semibold" style={{ color: "#ffb3ad" }}>red candle</span> means
          it closed lower (bearish). The thin lines above and below the body are called <strong className="text-foreground">wicks</strong> — they
          show the full high/low range.
        </p>
        <Callout type="info">
          Use longer timeframes (4h, 1d) to understand the overall trend, and shorter ones (15m, 1h) to time your entry.
        </Callout>
      </Section>

      {/* 5. Order book */}
      <Section title="The Order Book & Recent Trades" icon={RefreshCw} color="#4edea3" bg="rgba(78,222,163,0.1)">
        <p>
          The Exchange page shows a live <strong className="text-foreground">Order Book</strong> — a real-time list of all open
          buy (bid) and sell (ask) orders on Binance for that pair.
        </p>
        <div className="rounded-xl border border-border overflow-hidden mt-1">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#4edea3" }}>
                <TrendingUp className="h-3 w-3" /> Bids (Buy Orders)
              </div>
              <p className="text-xs text-muted-foreground">
                Prices buyers are willing to pay. Listed from highest to lowest. The highest bid is the current best
                buy price — anything above this will execute immediately.
              </p>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#ffb3ad" }}>
                <TrendingDown className="h-3 w-3" /> Asks (Sell Orders)
              </div>
              <p className="text-xs text-muted-foreground">
                Prices sellers are asking for. Listed from lowest to highest. The lowest ask is the current best
                sell price — your buy orders fill at or near this level.
              </p>
            </div>
          </div>
        </div>
        <p>
          The gap between the highest bid and lowest ask is called the <strong className="text-foreground">spread</strong>. A
          smaller spread means more liquidity and tighter execution. Major pairs like BTC/USDT have very tight spreads.
        </p>
        <p>
          The <strong className="text-foreground">Recent Trades</strong> panel shows the latest completed trades in real time —
          useful for gauging momentum. A stream of green (buy) trades suggests buying pressure; red (sell) suggests selling pressure.
        </p>
      </Section>

      {/* 6. Selling */}
      <Section title="Taking Profits & Cutting Losses" icon={TrendingDown} color="#ffb3ad" bg="rgba(255,179,173,0.1)">
        <p>
          Buying is the easy part — knowing when to sell is what separates good traders from bad ones. On CrySer,
          selling works the same as buying: go to the Exchange page for the coin you hold and place a Sell order.
        </p>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex gap-3 items-start p-3 rounded-lg border border-border bg-card">
            <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#4edea3" }} />
            <div>
              <p className="text-sm font-semibold text-foreground">Taking profit</p>
              <p className="text-xs text-muted-foreground">Sell when the price has risen to your target. Set a goal <em>before</em> you enter the trade (e.g., &quot;I&apos;ll sell when I&apos;m up 10%&quot;). Greed is one of the biggest trading mistakes.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start p-3 rounded-lg border border-border bg-card">
            <TrendingDown className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#ffb3ad" }} />
            <div>
              <p className="text-sm font-semibold text-foreground">Cutting losses (stop-loss)</p>
              <p className="text-xs text-muted-foreground">Decide your maximum acceptable loss before entering (e.g., &quot;I&apos;ll exit if I&apos;m down 5%&quot;). Holding a losing trade hoping it recovers is called &quot;holding a bag&quot; and can wipe accounts.</p>
            </div>
          </div>
        </div>
        <Callout type="warning">
          Letting losses run while cutting winners short is the most common beginner mistake. Set targets and stop-losses
          before you trade, and stick to them.
        </Callout>
      </Section>

      {/* 7. Risk management */}
      <Section title="Risk Management Basics" icon={ShieldCheck} color="#a855f7" bg="rgba(168,85,247,0.1)">
        <p>
          Risk management is the foundation of successful trading. Even experienced traders lose on individual trades —
          the goal is to ensure your wins outweigh your losses over time.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {[
            {
              title: "Position Sizing",
              desc: "Never risk more than 1–5% of your total balance on a single trade. Smaller positions mean a single bad trade can't ruin you.",
              color: "#b9c7e0",
            },
            {
              title: "Diversification",
              desc: "Don't put everything into one coin. Spreading across several assets reduces the impact of any one going against you.",
              color: "#4edea3",
            },
            {
              title: "Risk/Reward Ratio",
              desc: "Aim for trades where the potential gain is at least 2× the potential loss. A 2:1 reward-to-risk ratio means you profit even if you're wrong half the time.",
              color: "#7a9db4",
            },
            {
              title: "Avoid FOMO",
              desc: "Fear Of Missing Out causes impulsive entries near price peaks. If you missed a big move, wait for the next setup — there's always another opportunity.",
              color: "#ffb3ad",
            },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1.5">
              <p className="font-semibold text-sm" style={{ color: item.color }}>{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Key Terms */}
      <Section title="Key Trading Terms" icon={BookOpen} color="#b9c7e0" bg="rgba(185,199,224,0.1)">
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4">
            <TermRow term="USDT" def="Tether — a stablecoin pegged to $1 USD. All pairs on CrySer are quoted against USDT." />
            <TermRow term="Bid / Ask" def="Bid = highest price a buyer will pay. Ask = lowest price a seller will accept." />
            <TermRow term="Spread" def="The difference between the best bid and best ask. Smaller = better liquidity." />
            <TermRow term="Market Order" def="An order that executes immediately at the current best available price." />
            <TermRow term="Volatility" def="How rapidly and widely a price moves. High volatility = bigger swings, bigger risk and reward." />
            <TermRow term="Bull Market" def="A prolonged period of rising prices. Sentiment is positive — buyers dominate." />
            <TermRow term="Bear Market" def="A prolonged period of falling prices (typically a drop of 20%+). Sellers dominate." />
            <TermRow term="Support" def="A price level where buying interest is historically strong, acting as a floor." />
            <TermRow term="Resistance" def="A price level where selling interest is historically strong, acting as a ceiling." />
            <TermRow term="Volume" def="The total amount of an asset traded in a given period. High volume confirms price moves." />
            <TermRow term="24h Change (%)" def="The percentage price change over the last 24 hours, compared to the price 24h ago." />
            <TermRow term="Portfolio" def="The total collection of assets you hold, valued at current market prices." />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8 rounded-2xl border"
        style={{ background: "linear-gradient(135deg, rgba(185,199,224,0.08) 0%, rgba(78,222,163,0.08) 100%)", borderColor: "rgba(185,199,224,0.2)" }}
      >
        <div>
          <h2 className="text-lg font-bold mb-1">Ready to put it into practice?</h2>
          <p className="text-sm text-muted-foreground">Open the exchange and place your first paper trade — risk free.</p>
        </div>
        <Link
          href="/Exchange/BTCUSDT"
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#4edea3" }}
        >
          Go to Exchange <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
}
