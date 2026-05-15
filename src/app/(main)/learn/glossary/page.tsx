"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Search, ArrowLeft } from "lucide-react";

interface GlossaryTerm {
  term: string;
  definition: string;
}

const TERMS: GlossaryTerm[] = [
  {
    term: "Altcoin",
    definition:
      "Any cryptocurrency other than Bitcoin. The term comes from 'alternative coin' and covers thousands of projects including Ethereum, Solana, and many others. Altcoins often aim to improve on Bitcoin's limitations or serve entirely different use cases.",
  },
  {
    term: "ATH",
    definition:
      "All-Time High — the highest price a cryptocurrency has ever reached in its history. ATH is often used as a reference point to gauge how far a coin is from its peak valuation. Breaking a previous ATH is typically seen as a very bullish signal.",
  },
  {
    term: "ATL",
    definition:
      "All-Time Low — the lowest price a cryptocurrency has ever traded at. An ATL can indicate extreme fear or a failing project, but it can also mark a potential accumulation opportunity for long-term investors.",
  },
  {
    term: "Bear Market",
    definition:
      "A prolonged period of declining prices, typically defined as a 20% or more drop from recent highs. Bear markets are characterized by widespread pessimism, low trading volumes, and a general reluctance to buy. They can last months or even years.",
  },
  {
    term: "Bull Market",
    definition:
      "A sustained period of rising prices driven by strong investor confidence and demand. Bull markets attract new participants, increase trading volume, and often lead to new all-time highs across the market. FOMO tends to intensify during bull runs.",
  },
  {
    term: "Candlestick",
    definition:
      "A chart type showing the open, high, low, and close price for a given time period. The 'body' of the candle represents the open-to-close range, while 'wicks' show the price extremes. Green candles indicate the price closed higher; red candles indicate it closed lower.",
  },
  {
    term: "CEX",
    definition:
      "Centralized Exchange — a platform operated by a company that holds users' funds and facilitates trades (e.g., Binance, Coinbase). CEXes are regulated, offer high liquidity, and are beginner-friendly, but require you to trust the company with custody of your assets.",
  },
  {
    term: "DeFi",
    definition:
      "Decentralized Finance — a broad term for financial services built on blockchain networks without traditional intermediaries like banks. DeFi protocols allow lending, borrowing, trading, and earning yield using smart contracts. Anyone with a crypto wallet can participate.",
  },
  {
    term: "DEX",
    definition:
      "Decentralized Exchange — a trading platform that runs via smart contracts on a blockchain, allowing peer-to-peer trades without a central operator (e.g., Uniswap, dYdX). DEXes give you full custody of your funds but can have lower liquidity than CEXes.",
  },
  {
    term: "FOMO",
    definition:
      "Fear Of Missing Out — the anxiety that drives traders to buy an asset that is rapidly rising in price, often near the top of a rally. FOMO-driven buying typically results in purchasing at inflated prices, making it one of the most common causes of trading losses.",
  },
  {
    term: "FUD",
    definition:
      "Fear, Uncertainty, and Doubt — negative news or rumors (sometimes deliberately spread) that causes panic selling in the market. FUD can be genuine concerns or coordinated manipulation. Experienced traders learn to evaluate the source and substance behind FUD before reacting.",
  },
  {
    term: "Gas Fee",
    definition:
      "The fee paid to network validators for processing a transaction on a blockchain like Ethereum. Gas fees fluctuate based on network congestion — they rise when demand for block space is high. High gas fees can make small DeFi transactions uneconomical.",
  },
  {
    term: "Halving",
    definition:
      "An event where the reward given to miners for adding new blocks is cut in half, reducing the rate of new coin supply. Bitcoin halves approximately every four years. Halvings are widely regarded as bullish catalysts because they reduce new sell pressure from miners.",
  },
  {
    term: "HODL",
    definition:
      "Originally a typo for 'HOLD,' it became a crypto meme meaning to hold an asset long-term regardless of price fluctuations. HODLers believe in the long-term appreciation of their chosen asset and resist the urge to panic-sell during downturns.",
  },
  {
    term: "Layer 1",
    definition:
      "The base blockchain network itself — the foundation layer that processes and finalizes transactions (e.g., Bitcoin, Ethereum, Solana). Layer 1 chains are responsible for security and decentralization but often face scalability limits as usage grows.",
  },
  {
    term: "Layer 2",
    definition:
      "A secondary network built on top of a Layer 1 blockchain to improve transaction speed and reduce fees (e.g., Arbitrum, Optimism, Lightning Network). Layer 2 solutions batch or process transactions off-chain and periodically settle to the base layer.",
  },
  {
    term: "Liquidity",
    definition:
      "How easily an asset can be bought or sold at a stable price. High liquidity means there are many buyers and sellers, resulting in tight spreads and minimal slippage. Low liquidity assets can experience large price swings from relatively small trades.",
  },
  {
    term: "Market Cap",
    definition:
      "The total market value of a cryptocurrency, calculated by multiplying its current price by its circulating supply. Market cap is used to rank and compare crypto projects. A higher market cap generally indicates a more established and stable asset.",
  },
  {
    term: "NFT",
    definition:
      "Non-Fungible Token — a unique digital asset stored on a blockchain that proves ownership of a specific item, such as digital art, music, or collectibles. Unlike regular crypto tokens, each NFT is one-of-a-kind and cannot be interchanged with another on a 1:1 basis.",
  },
  {
    term: "Order Book",
    definition:
      "A real-time list of all open buy and sell orders for a trading pair, organized by price level. The order book reveals market depth — how much buying or selling pressure exists at various prices. Analyzing it helps traders understand supply and demand dynamics.",
  },
  {
    term: "PnL",
    definition:
      "Profit and Loss — the realized or unrealized gain or loss from a trade or portfolio. Unrealized PnL reflects the value if you closed your position now; realized PnL is locked in once a trade is closed. Tracking PnL is essential for evaluating trading performance.",
  },
  {
    term: "Pump and Dump",
    definition:
      "A market manipulation scheme where a group artificially inflates the price of a low-cap asset through coordinated buying and hype, then sells their holdings at the peak, leaving latecomers with losses. Pump and dump schemes are illegal in regulated markets.",
  },
  {
    term: "Satoshi",
    definition:
      "The smallest unit of Bitcoin, equal to 0.00000001 BTC (one hundred-millionth). Named after Bitcoin's pseudonymous creator, Satoshi Nakamoto. Satoshis are often used when discussing very small Bitcoin amounts or micropayments.",
  },
  {
    term: "Slippage",
    definition:
      "The difference between the expected price of a trade and the price at which it actually executes. Slippage occurs in low-liquidity markets or during large orders that move the price before fully filling. Setting a slippage tolerance protects against unfavorable fills.",
  },
  {
    term: "Spot Trading",
    definition:
      "Buying or selling a cryptocurrency for immediate delivery at the current market price. Spot trades settle 'on the spot' and give you direct ownership of the asset. It is the simplest form of crypto trading and carries no leverage risk.",
  },
  {
    term: "Stablecoin",
    definition:
      "A cryptocurrency designed to maintain a stable value, typically pegged to the US dollar (e.g., USDT, USDC, DAI). Stablecoins combine the convenience of crypto with price stability, making them useful for trading, remittances, and yield farming without volatility risk.",
  },
  {
    term: "Staking",
    definition:
      "Locking up cryptocurrency in a wallet or protocol to support network operations (e.g., validating transactions in a Proof-of-Stake system) in exchange for rewards. Staking earns passive income but typically involves a lock-up period during which you cannot sell.",
  },
  {
    term: "Stop Loss",
    definition:
      "A pre-set order that automatically sells an asset if its price drops to a specified level. Stop losses are a core risk management tool that prevent a trade from losing more than a predetermined amount. They remove emotion from exit decisions.",
  },
  {
    term: "Take Profit",
    definition:
      "A pre-set order that automatically sells an asset when it reaches a target profit price. Take profit orders lock in gains without requiring you to monitor the market constantly. They work best when combined with stop loss orders to define a clear risk/reward ratio.",
  },
  {
    term: "Volume",
    definition:
      "The total amount of an asset traded over a given time period, usually 24 hours. High volume confirms price moves and indicates genuine market interest. Low-volume price moves are less reliable and more susceptible to manipulation.",
  },
  {
    term: "Wallet",
    definition:
      "Software or hardware that stores your cryptographic keys, allowing you to send and receive cryptocurrency. Wallets do not store coins directly — they store the private keys that prove ownership on the blockchain. Keeping your private key secure is critical.",
  },
  {
    term: "Whale",
    definition:
      "An individual or entity that holds a very large amount of cryptocurrency — enough to influence market prices with their trades. Whale activity (large buy/sell orders) is closely watched by traders because it can signal upcoming price movements.",
  },
  {
    term: "Yield Farming",
    definition:
      "A DeFi strategy of moving crypto assets between protocols to maximize returns through interest, fees, and token rewards. Yield farming can generate high APY but comes with risks including smart contract bugs, impermanent loss, and rapidly changing reward rates.",
  },
];

// Group terms by first letter
function groupByLetter(terms: GlossaryTerm[]) {
  const map: Record<string, GlossaryTerm[]> = {};
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    if (!map[letter]) map[letter] = [];
    map[letter].push(t);
  }
  return map;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const BG = "#0b1222";
const PANEL = "#191f31";
const BORDER = "#2e3447";
const TEXT = "#dce1fb";
const MUTED = "#909097";
const GREEN = "#4edea3";
const BLUE = "#8ccdff";

export default function GlossaryPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return TERMS;
    return TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);
  const activeLetters = Object.keys(grouped).sort();

  function scrollToLetter(letter: string) {
    const el = document.getElementById(`letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "2.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Back link */}
        <Link
          href="/learn/how-to-trade"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.78rem",
            color: MUTED,
            textDecoration: "none",
            alignSelf: "flex-start",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = BLUE)}
          onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
        >
          <ArrowLeft style={{ width: 13, height: 13 }} />
          Back to Learn
        </Link>

        {/* Header */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                background: "rgba(140,205,255,0.1)",
                border: `1px solid rgba(140,205,255,0.25)`,
                borderRadius: 10,
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen style={{ width: 20, height: 20, color: BLUE }} />
            </div>
            <h1
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: TEXT,
                margin: 0,
              }}
            >
              Crypto Glossary
            </h1>
          </div>
          <p style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
            {TERMS.length} terms — plain English definitions for every concept
            you&apos;ll encounter trading crypto.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              width: 16,
              height: 16,
              color: MUTED,
              pointerEvents: "none",
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms or definitions..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: PANEL,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "0.8rem 1rem 0.8rem 2.75rem",
              fontSize: "0.9rem",
              color: TEXT,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = BLUE)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
          />
          {query && (
            <span
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.72rem",
                color: MUTED,
              }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Alphabet jump bar */}
        {!query && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.25rem",
            }}
          >
            {ALPHABET.map((letter) => {
              const hasTerms = !!grouped[letter];
              return (
                <button
                  key={letter}
                  onClick={() => hasTerms && scrollToLetter(letter)}
                  disabled={!hasTerms}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    border: `1px solid ${hasTerms ? BORDER : "transparent"}`,
                    background: hasTerms ? "rgba(255,255,255,0.03)" : "transparent",
                    color: hasTerms ? BLUE : MUTED,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: hasTerms ? "pointer" : "default",
                    opacity: hasTerms ? 1 : 0.3,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (hasTerms) {
                      e.currentTarget.style.background = "rgba(140,205,255,0.1)";
                      e.currentTarget.style.borderColor = `rgba(140,205,255,0.4)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasTerms) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = BORDER;
                    }
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}

        {/* Terms grouped by letter */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: MUTED,
              fontSize: "0.9rem",
            }}
          >
            No terms match &quot;{query}&quot;
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {activeLetters.map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                {/* Letter heading */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.875rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 900,
                      color: GREEN,
                      lineHeight: 1,
                      minWidth: 24,
                    }}
                  >
                    {letter}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: BORDER,
                    }}
                  />
                </div>

                {/* Terms in this letter group */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {grouped[letter].map((item) => (
                    <div
                      key={item.term}
                      style={{
                        background: PANEL,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 14,
                        padding: "1.1rem 1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "rgba(78,222,163,0.35)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = BORDER)
                      }
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          color: GREEN,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {item.term}
                      </span>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: MUTED,
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                      >
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
