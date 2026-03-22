"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, TrendingUp, BarChart2, DollarSign, Globe, Twitter, Github } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface CoinGeckoData {
  id: string;
  name: string;
  symbol: string;
  description: { en: string };
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_date: { usd: string };
  };
  market_cap_rank: number;
  links: {
    homepage: string[];
    twitter_screen_name: string;
    subreddit_url: string;
    repos_url: { github: string[] };
  };
  genesis_date: string;
  hashing_algorithm: string;
}

function fmtUSD(n: number): string {
  if (!n) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtNum(n: number): string {
  if (!n) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

function PctBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span
      className="text-xs font-semibold px-1.5 py-0.5 rounded"
      style={{
        color: isUp ? "#16c784" : "#ea3943",
        background: isUp ? "rgba(22,199,132,0.1)" : "rgba(234,57,67,0.1)",
      }}
    >
      {isUp ? "+" : ""}{value?.toFixed(2) ?? "—"}%
    </span>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

// Map Binance symbols to CoinGecko IDs for common coins
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
  XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", MATIC: "matic-network",
  DOT: "polkadot", SHIB: "shiba-inu", AVAX: "avalanche-2", LINK: "chainlink",
  LTC: "litecoin", UNI: "uniswap", ATOM: "cosmos", FIL: "filecoin",
  XLM: "stellar", NEAR: "near", ALGO: "algorand", VET: "vechain",
  ICP: "internet-computer", HBAR: "hedera-hashgraph", TRX: "tron",
  BCH: "bitcoin-cash", ETC: "ethereum-classic", APE: "apecoin",
  SAND: "the-sandbox", MANA: "decentraland", FTM: "fantom",
  AAVE: "aave", CRV: "curve-dao-token", MKR: "maker",
};

export default function CoinInfoTab({ symbol }: { symbol: string }) {
  const { t } = useI18n();
  const ticker = symbol.replace("USDT", "");
  const coinId = SYMBOL_TO_ID[ticker] ?? ticker.toLowerCase();

  const [data, setData] = useState<CoinGeckoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [coinId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground animate-pulse">
        {t.coin.loading}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
        <p className="text-sm text-muted-foreground">{t.coin.couldNotLoad} <strong>{ticker}</strong>.</p>
        <p className="text-xs text-muted-foreground">{t.coin.geckoNote}</p>
      </div>
    );
  }

  const md = data.market_data;
  const description = data.description?.en?.replace(/<[^>]*>/g, "").split(". ").slice(0, 4).join(". ") + (data.description?.en ? "." : "");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Left column: identity + description ── */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Hero */}
        <div className="flex items-center gap-4">
          <Image
            src={data.image.large}
            alt={data.name}
            width={56}
            height={56}
            className="rounded-full"
            unoptimized
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{data.name}</h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md uppercase"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
              >
                {data.symbol}
              </span>
              {data.market_cap_rank && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
                >
                  {t.coin.rank}{data.market_cap_rank}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold tabular-nums">
                {fmtUSD(md.current_price.usd)}
              </span>
              <PctBadge value={md.price_change_percentage_24h} />
            </div>
          </div>
        </div>

        {/* Description */}
        {description && description.length > 5 && (
          <div
            className="rounded-xl p-4"
            style={{ background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))" }}
          >
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
              {description}
            </p>
          </div>
        )}

        {/* Price performance */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> {t.coin.pricePerformance}
            </h3>
          </div>
          <div className="px-4">
            <StatRow label={t.coin.change24h} value={<PctBadge value={md.price_change_percentage_24h} />} />
            <StatRow label={t.coin.change7d} value={<PctBadge value={md.price_change_percentage_7d} />} />
            <StatRow label={t.coin.change30d} value={<PctBadge value={md.price_change_percentage_30d} />} />
            <StatRow label={t.coin.high24h} value={fmtUSD(md.high_24h.usd)} />
            <StatRow label={t.coin.low24h} value={fmtUSD(md.low_24h.usd)} />
            <StatRow
              label={t.coin.ath}
              value={
                <span>
                  {fmtUSD(md.ath.usd)}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({new Date(md.ath_date.usd).toLocaleDateString()})
                  </span>
                </span>
              }
            />
            <StatRow
              label={t.coin.atl}
              value={
                <span>
                  {fmtUSD(md.atl.usd)}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({new Date(md.atl_date.usd).toLocaleDateString()})
                  </span>
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* ── Right column: market data + links ── */}
      <div className="flex flex-col gap-5">

        {/* Market Stats */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" /> {t.coin.marketStats}
            </h3>
          </div>
          <div className="px-4">
            <StatRow label={t.coin.marketCap} value={fmtUSD(md.market_cap.usd)} />
            <StatRow label={t.coin.volume24h} value={fmtUSD(md.total_volume.usd)} />
            <StatRow label={t.coin.circulatingSupply} value={fmtNum(md.circulating_supply)} />
            {md.total_supply && <StatRow label={t.coin.totalSupply} value={fmtNum(md.total_supply)} />}
            {md.max_supply && <StatRow label={t.coin.maxSupply} value={fmtNum(md.max_supply)} />}
            {data.genesis_date && <StatRow label={t.coin.launchDate} value={data.genesis_date} />}
            {data.hashing_algorithm && <StatRow label={t.coin.algorithm} value={data.hashing_algorithm} />}
          </div>
        </div>

        {/* Links */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> {t.coin.links}
            </h3>
          </div>
          <div className="px-4 py-2 flex flex-col gap-1">
            {data.links?.homepage?.[0] && (
              <a
                href={data.links.homepage[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{data.links.homepage[0].replace(/https?:\/\//, "")}</span>
                <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
              </a>
            )}
            {data.links?.twitter_screen_name && (
              <a
                href={`https://twitter.com/${data.links.twitter_screen_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-3.5 w-3.5 shrink-0" />
                <span>@{data.links.twitter_screen_name}</span>
                <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
              </a>
            )}
            {data.links?.repos_url?.github?.[0] && (
              <a
                href={data.links.repos_url.github[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.coin.github}</span>
                <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
              </a>
            )}
            {data.links?.subreddit_url && (
              <a
                href={data.links.subreddit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <DollarSign className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.coin.reddit}</span>
                <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
