import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  List,
  Lightbulb,
  AlertTriangle,
  CircleDot,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Layers,
} from "lucide-react";

export const metadata = { title: "Understanding Order Books — CrySer Learn" };

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

// Mock order book data for the visual
const ASKS = [
  { price: "67,450.00", size: "0.324", total: "21,853.80", depth: 30 },
  { price: "67,420.00", size: "0.872", total: "58,790.64", depth: 55 },
  { price: "67,395.00", size: "1.540", total: "103,788.30", depth: 72 },
  { price: "67,380.00", size: "0.215", total: "14,486.70", depth: 18 },
  { price: "67,350.00", size: "2.100", total: "141,435.00", depth: 88 },
];
const BIDS = [
  { price: "67,310.00", size: "1.820", total: "122,504.20", depth: 85 },
  { price: "67,290.00", size: "0.560", total: "37,682.40", depth: 42 },
  { price: "67,265.00", size: "0.934", total: "62,825.51", depth: 58 },
  { price: "67,240.00", size: "0.123", total: "8,270.52", depth: 12 },
  { price: "67,200.00", size: "3.450", total: "231,840.00", depth: 100 },
];

export default function OrderBooksPage() {
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
            <Clock className="h-3 w-3" /> 6 min read
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(66,224,154,0.1)" }}
          >
            <List className="h-5 w-5" style={{ color: GREEN }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Understanding Order Books</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              The real-time record of every buyer and seller in the market
            </p>
          </div>
        </div>
        <Callout type="info">
          The order book is the live engine behind every price you see. When you
          understand it, you stop wondering "why did the price move?" and start
          seeing the actual mechanics that drive price action.
        </Callout>
      </div>

      {/* 1. What is an order book */}
      <Section
        title="What Is an Order Book?"
        icon={List}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          An{" "}
          <span className="font-semibold" style={{ color: PRIMARY }}>
            order book
          </span>{" "}
          is a real-time, continuously updated list of all open buy and sell
          orders for a trading pair on an exchange. Think of it as the
          marketplace's public ledger — every trader who has placed a limit
          order but not yet had it filled appears in the order book.
        </p>
        <p>
          The order book shows you exactly how much demand exists at each price
          level and how much supply sellers are offering. It is the most direct
          window into market sentiment — not what people say they think, but
          what they are actually putting money behind.
        </p>
        <p>
          On CrySer, the order book you see on the Exchange page streams live
          data from Binance — the world's largest crypto exchange by volume.
          This means you are looking at real institutional and retail demand and
          supply in real time.
        </p>
        <Callout type="tip">
          Spend time just watching the order book on a liquid pair like
          BTC/USDT. Notice how orders appear and disappear rapidly. This is the
          market "breathing" — constant negotiation between buyers and sellers.
        </Callout>
      </Section>

      {/* 2. Bids vs Asks */}
      <Section
        title="Bids vs Asks"
        icon={BarChart2}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          Every order in the book is either a{" "}
          <span className="font-semibold" style={{ color: GREEN }}>
            bid
          </span>{" "}
          (a buy order) or an{" "}
          <span className="font-semibold" style={{ color: RED }}>
            ask
          </span>{" "}
          (a sell order). They are always listed separately, with bids below the
          current price and asks above it.
        </p>

        {/* Mock order book visual */}
        <div className="rounded-xl border border-border overflow-hidden mt-1">
          {/* Asks (sells) — shown from lowest to highest, bottom up */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Price (USDT)
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Size (BTC)
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:block">
              Total (USDT)
            </span>
          </div>

          {/* Ask rows */}
          {[...ASKS].reverse().map((row) => (
            <div
              key={row.price}
              className="relative flex items-center justify-between px-4 py-1.5 text-xs"
            >
              <div
                className="absolute right-0 top-0 bottom-0"
                style={{
                  width: `${row.depth}%`,
                  background: "rgba(255,180,171,0.08)",
                }}
              />
              <span className="font-mono font-semibold" style={{ color: RED }}>
                {row.price}
              </span>
              <span className="font-mono text-muted-foreground">{row.size}</span>
              <span className="font-mono text-muted-foreground hidden sm:block">
                {row.total}
              </span>
            </div>
          ))}

          {/* Spread separator */}
          <div
            className="flex items-center justify-center gap-3 py-2.5 border-y border-border"
            style={{ background: "rgba(140,205,255,0.05)" }}
          >
            <span
              className="font-mono font-bold text-sm"
              style={{ color: PRIMARY }}
            >
              $67,330.00
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Last price · Spread: $40.00
            </span>
          </div>

          {/* Bid rows */}
          {BIDS.map((row) => (
            <div
              key={row.price}
              className="relative flex items-center justify-between px-4 py-1.5 text-xs"
            >
              <div
                className="absolute right-0 top-0 bottom-0"
                style={{
                  width: `${row.depth}%`,
                  background: "rgba(66,224,154,0.08)",
                }}
              />
              <span
                className="font-mono font-semibold"
                style={{ color: GREEN }}
              >
                {row.price}
              </span>
              <span className="font-mono text-muted-foreground">{row.size}</span>
              <span className="font-mono text-muted-foreground hidden sm:block">
                {row.total}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-card">
            <TrendingUp
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: GREEN }}
            />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">
                Bids (Green — Buy Orders)
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Listed below the current price from highest to lowest. The top
                bid is the best bid — the highest price any buyer is currently
                willing to pay. Your sell orders fill at or near this price.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-card">
            <TrendingDown
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: RED }}
            />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">
                Asks (Red — Sell Orders)
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Listed above the current price from lowest to highest. The
                lowest ask is the best ask — the cheapest price any seller is
                currently accepting. Your buy orders fill at or near this price.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. The Spread */}
      <Section
        title="The Spread"
        icon={BarChart2}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          The{" "}
          <span className="font-semibold" style={{ color: PRIMARY }}>
            spread
          </span>{" "}
          is the gap between the best bid (highest buy order) and the best ask
          (lowest sell order). It is the cost of immediately entering and exiting
          a position — you buy at the ask and sell at the bid, and the spread is
          the difference you pay.
        </p>
        <p>
          In the mock order book above, the spread is $40 ($67,350 ask minus
          $67,310 bid). This means if you bought BTC at the best ask and
          immediately sold at the best bid, you would lose $40 per BTC before
          any fees. On major pairs like BTC/USDT, the real spread is typically
          less than $1.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {[
            {
              label: "Tight spread (BTC, ETH)",
              color: GREEN,
              desc: "Less than 0.01% — indicates high liquidity. Many buyers and sellers are competing, keeping prices close together. Low cost to enter and exit.",
            },
            {
              label: "Wide spread (small altcoins)",
              color: RED,
              desc: "Can be 0.5%–5%+ on illiquid pairs. Far fewer participants, so buyers and sellers are far apart. High implicit cost per trade, even before fees.",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1.5"
            >
              <span className="font-semibold text-xs" style={{ color: s.color }}>
                {s.label}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <Callout type="tip">
          Always check the spread before trading a new coin. A wide spread means
          you start every trade at a loss — you need price to move in your favor
          just to break even. Stick to high-volume pairs with tight spreads.
        </Callout>
      </Section>

      {/* 4. Reading market depth */}
      <Section
        title="Reading Market Depth"
        icon={Layers}
        color={GREEN}
        bg="rgba(66,224,154,0.1)"
      >
        <p>
          Market depth refers to the total volume of orders at each price level
          and how deep you have to go into the book to fill a large order. The
          depth chart (sometimes shown as a cumulative chart) visualizes this:
          a steep curve means thin liquidity, a shallow slope means abundant
          liquidity.
        </p>
        <p>
          In the order book visual above, the background bars behind each row
          represent relative size — wider bars mean more volume at that price.
          Notice that some levels have much larger orders than others. These
          large orders act as walls — significant resistance or support levels
          that price needs more buying/selling pressure to overcome.
        </p>

        <div
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{
            background: "rgba(140,205,255,0.04)",
            borderColor: "rgba(140,205,255,0.2)",
          }}
        >
          <p className="text-xs font-semibold text-foreground">
            What to look for in market depth:
          </p>
          {[
            {
              term: "Bid wall",
              color: GREEN,
              desc: "A very large bid (buy order) significantly below the current price. Acts as a strong floor — sellers know buyers are waiting there. Can be a bullish signal.",
            },
            {
              term: "Ask wall",
              color: RED,
              desc: "A very large ask (sell order) above the current price. Significant resistance. Price often struggles to push through — it needs high buying volume to absorb the wall.",
            },
            {
              term: "Thin book",
              color: "#f97316",
              desc: "Few orders on either side. Price can move rapidly with relatively small trades. This is common in low-volume altcoins and during off-hours. High volatility risk.",
            },
          ].map((row) => (
            <div
              key={row.term}
              className="flex gap-3 pt-2 border-t border-border first:border-0 first:pt-0 text-xs"
            >
              <span
                className="font-semibold w-20 shrink-0"
                style={{ color: row.color }}
              >
                {row.term}
              </span>
              <span className="text-muted-foreground leading-relaxed">
                {row.desc}
              </span>
            </div>
          ))}
        </div>

        <Callout type="warning">
          Large orders in the order book can be removed (cancelled) instantly.
          "Order book walls" are not guaranteed support or resistance — traders
          sometimes place large fake orders to manipulate perception, then cancel
          them before price arrives. This is called "spoofing."
        </Callout>
      </Section>

      {/* 5. How limit orders fill */}
      <Section
        title="How Limit Orders Fill"
        icon={List}
        color={PRIMARY}
        bg="rgba(140,205,255,0.1)"
      >
        <p>
          Understanding how orders fill is essential for executing trades at
          the prices you want. There are two types of order execution:
        </p>

        <div className="flex flex-col gap-3 mt-1">
          {[
            {
              type: "Market Order",
              color: RED,
              desc: "Executes immediately at the best available price in the order book. Your buy fills against the lowest available ask. Your sell fills against the highest available bid. Fast, but you have no control over the exact price — especially in thin markets, you may fill at a worse price than expected (called slippage).",
              badge: "Taker",
            },
            {
              type: "Limit Order",
              color: GREEN,
              desc: "You specify the exact price you want to buy or sell at. Your order joins the order book and waits for the market to come to you. If you place a limit buy at $67,000 and BTC is trading at $67,330, your order sits in the book until price drops to $67,000 — or you cancel it. No slippage, but no guarantee of execution.",
              badge: "Maker",
            },
          ].map((order) => (
            <div
              key={order.type}
              className="flex gap-3 items-start p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex flex-col items-start gap-1.5 shrink-0">
                <span
                  className="font-bold text-sm"
                  style={{ color: order.color }}
                >
                  {order.type}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest"
                  style={{
                    color: order.color,
                    background: `${order.color}18`,
                    border: `1px solid ${order.color}40`,
                  }}
                >
                  {order.badge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {order.desc}
              </p>
            </div>
          ))}
        </div>

        <p>
          When your limit buy order is in the book and the price drops to your
          level, a market seller's order matches against yours — your order
          "fills" and you receive the asset. Large limit orders may fill
          partially across several price levels if there is not enough volume at
          exactly your price.
        </p>
        <Callout type="tip">
          For most trades on CrySer, market orders are perfectly fine — BTC and
          ETH have such deep liquidity that slippage is negligible. For smaller
          altcoins, consider limit orders to avoid paying a wide spread.
        </Callout>
      </Section>

      {/* Up Next + CTA */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
              Explore More
            </p>
            <p className="font-bold text-sm">Back to Education Hub</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse all guides — from chart reading to advanced trading
              strategies.
            </p>
          </div>
          <Link
            href="/learn"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
          >
            All Guides <ArrowRight className="h-4 w-4" />
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
              Open the live order book and watch real Binance market depth in
              action.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8ccdff, #004e7c)" }}
          >
            Open Exchange <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
