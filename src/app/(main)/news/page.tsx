"use client";

import { useEffect, useState, useCallback } from "react";
import { ExternalLink, Newspaper, TrendingUp, Flame, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ── CryptoPanic types ────────────────────────────────────────────────────────
interface CPCurrency { code: string; title: string; }
interface CPVotes { negative: number; positive: number; important: number; liked: number; }
interface CPSource { title: string; domain: string; }
interface CPPost {
  id: number;
  title: string;
  url: string;
  published_at: string;
  source: CPSource;
  currencies: CPCurrency[] | null;
  votes: CPVotes;
  kind: string;
}

interface TrendingCoin {
  item: {
    id: string; name: string; symbol: string; thumb: string;
    data?: { price_change_percentage_24h?: { usd?: number } };
  };
}

// ── Filters ──────────────────────────────────────────────────────────────────
const FILTER_KEYS = [
  { key: "",       tKey: "latest",  icon: Newspaper },
  { key: "hot",    tKey: "hot",     icon: Flame },
  { key: "rising", tKey: "rising",  icon: ArrowUpRight },
] as const;
type Filter = typeof FILTER_KEYS[number]["key"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function loadNews(filter: Filter, currency: string): Promise<CPPost[]> {
  let url = "/api/news?";
  if (filter) url += `&filter=${filter}`;
  if (currency) url += `&currency=${currency.toUpperCase()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

// ── Sentiment bar ─────────────────────────────────────────────────────────────
function SentimentBar({ votes }: { votes: CPVotes }) {
  const pos = votes.positive + votes.liked;
  const neg = votes.negative;
  const total = pos + neg;
  if (total === 0) return null;
  const posPct = Math.round((pos / total) * 100);
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="text-[10px] font-semibold" style={{ color: "#16c784" }}>{posPct}%</span>
      <div className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
        <div className="h-full rounded-full" style={{ width: `${posPct}%`, background: "#16c784" }} />
      </div>
      <span className="text-[10px] font-semibold" style={{ color: "#ea3943" }}>{100 - posPct}%</span>
    </div>
  );
}

// ── Currency pill ─────────────────────────────────────────────────────────────
function CurrencyPill({ code }: { code: string }) {
  return (
    <a
      href={`/coin/${code}USDT`}
      onClick={(e) => e.stopPropagation()}
      className="px-1.5 py-0.5 rounded text-[10px] font-semibold hover:opacity-80 transition-opacity"
      style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))" }}
    >
      {code}
    </a>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const { t } = useI18n();
  const [posts, setPosts]       = useState<CPPost[]>([]);
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>("");
  const [currency, setCurrency] = useState("");
  const [input, setInput]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [p, t] = await Promise.all([
      loadNews(filter, currency).catch(() => [] as CPPost[]),
      fetch("https://api.coingecko.com/api/v3/search/trending")
        .then((r) => r.json()).then((d) => d.coins ?? []).catch(() => []),
    ]);
    setPosts(p);
    setTrending(t.slice(0, 8));
    setLoading(false);
  }, [filter, currency]);

  useEffect(() => { load(); }, [load]);

  function applySearch() { setCurrency(input.trim()); }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t.news.title}</h1>
            <p className="text-sm text-muted-foreground">{t.news.poweredBy}</p>
          </div>
        </div>

        {/* Filter tabs + currency search */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center rounded-lg p-0.5 gap-0.5"
            style={{ background: "hsl(var(--muted))" }}
          >
            {FILTER_KEYS.map(({ key, tKey, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={
                  filter === key
                    ? { background: "hsl(var(--background))", color: "hsl(var(--foreground))", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                    : { color: "hsl(var(--muted-foreground))" }
                }
              >
                <Icon className="h-3 w-3" />
                {t.news[tKey]}
              </button>
            ))}
          </div>

          {/* Currency filter */}
          <form
            onSubmit={(e) => { e.preventDefault(); applySearch(); }}
            className="flex items-center gap-1"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.news.filterPlaceholder}
              className="px-3 py-1.5 rounded-lg text-xs border bg-muted/40 focus:bg-background focus:border-primary/50 outline-none transition-all"
              style={{ borderColor: "hsl(var(--border))", width: "160px" }}
            />
            {currency && (
              <button
                type="button"
                onClick={() => { setCurrency(""); setInput(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                ✕ {currency}
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* ── News feed ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl h-20 animate-pulse"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }} />
            ))
          ) : posts.length === 0 ? (
            <div className="rounded-xl px-6 py-12 text-center text-sm text-muted-foreground"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
              {t.news.noNews}{currency ? ` for ${currency}` : ""}. {t.news.tryDifferent}
            </div>
          ) : (
            posts.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/30 group"
                style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
              >
                {/* Title + external icon */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm leading-snug group-hover:underline line-clamp-2">
                    {post.title}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Meta row */}
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">{post.source.title}</span>
                  <span className="text-muted-foreground/40 text-[11px]">·</span>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(post.published_at)}</span>

                  {/* Currency pills */}
                  {post.currencies?.slice(0, 4).map((c) => (
                    <CurrencyPill key={c.code} code={c.code} />
                  ))}

                  {/* Vote counts */}
                  {(post.votes.positive + post.votes.negative) > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <span style={{ color: "#16c784" }}>▲</span> {post.votes.positive + post.votes.liked}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <span style={{ color: "#ea3943" }}>▼</span> {post.votes.negative}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sentiment bar */}
                <SentimentBar votes={post.votes} />
              </a>
            ))
          )}
        </div>

        {/* ── Trending sidebar ──────────────────────────────────────── */}
        <div className="lg:w-60 shrink-0">
          <div
            className="rounded-xl overflow-hidden sticky top-20"
            style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          >
            <div className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t.news.trending}
              </span>
            </div>

            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-8 rounded animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {trending.map((t, i) => {
                  const coin = t.item;
                  const pct = coin.data?.price_change_percentage_24h?.usd;
                  return (
                    <a
                      key={coin.id}
                      href={`/coin/${coin.symbol.toUpperCase()}USDT`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
                      style={i < trending.length - 1 ? { borderBottom: "1px solid hsl(var(--border))" } : {}}
                    >
                      <span className="text-[11px] text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                      {coin.thumb && <img src={coin.thumb} alt={coin.name} className="w-5 h-5 rounded-full shrink-0" />}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold truncate">{coin.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{coin.symbol}</span>
                      </div>
                      {pct != null && (
                        <span className="text-xs font-semibold shrink-0"
                          style={{ color: pct >= 0 ? "#16c784" : "#ea3943" }}>
                          {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
