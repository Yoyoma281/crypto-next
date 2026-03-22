import { NextRequest, NextResponse } from "next/server";

// In-memory cache keyed by request params
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes

// Normalise CryptoCompare article into a shape the frontend already knows
function normalise(article: Record<string, unknown>) {
  return {
    id:           article.id,
    title:        article.title,
    url:          article.url,
    published_at: new Date((article.published_on as number) * 1000).toISOString(),
    imageurl:     article.imageurl,
    body:         article.body,
    source: {
      title:  (article.source_info as Record<string, string>)?.name ?? article.source,
      domain: article.source,
    },
    currencies: String(article.categories ?? "")
      .split("|")
      .filter(Boolean)
      .map((c: string) => ({ code: c })),
    votes: {
      positive:  parseInt(String(article.upvotes   ?? 0), 10),
      negative:  parseInt(String(article.downvotes ?? 0), 10),
      important: 0,
      liked:     0,
    },
  };
}

async function fetchFromCryptoCompare(currency: string, filter: string) {
  let url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest";
  if (currency) url += `&categories=${currency.toUpperCase()}`;
  if (filter === "hot" || filter === "rising") url = url.replace("sortOrder=latest", "sortOrder=popular");

  const res = await fetch(url, {
    headers: { "User-Agent": "CrySer/1.0" },
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;
  const raw = await res.json();
  return (raw.Data ?? []) as Record<string, unknown>[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter   = searchParams.get("filter")   ?? "";
  const currency = searchParams.get("currency") ?? "";

  const key = `${filter}|${currency}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  try {
    let articles = await fetchFromCryptoCompare(currency, filter);

    // If coin-specific query returned nothing, fall back to general news
    if (articles === null) {
      return NextResponse.json(cached?.data ?? { results: [] }, { status: 200 });
    }

    if (articles.length === 0 && currency) {
      articles = (await fetchFromCryptoCompare("", filter)) ?? [];
    }

    const results = articles.map(normalise);
    const data = { results };

    // Only cache non-empty results
    if (results.length > 0) {
      cache.set(key, { data, ts: Date.now() });
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json(cached?.data ?? { results: [] }, { status: 200 });
  }
}
