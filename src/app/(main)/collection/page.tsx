"use client";

import { useEffect, useState } from "react";
import { Gem } from "lucide-react";

type Rarity = "common" | "rare" | "epic";

interface CollectionEntry {
  symbol: string;
  rarity: Rarity;
  collectedAt: string;
}

interface CollectionStats {
  total: number;
  common: number;
  rare: number;
  epic: number;
  completionPct: number;
}

const RARITY_CONFIG: Record<
  Rarity,
  {
    label: string;
    border: string;
    glow: string;
    badge: string;
    badgeText: string;
    badgeBg: string;
  }
> = {
  common: {
    label: "COMMON",
    border: "1px solid #3a3f52",
    glow: "none",
    badge: "#909097",
    badgeText: "#909097",
    badgeBg: "rgba(144,144,151,0.12)",
  },
  rare: {
    label: "RARE",
    border: "1px solid #8ccdff55",
    glow: "0 0 14px 2px rgba(140,205,255,0.18)",
    badge: "#8ccdff",
    badgeText: "#8ccdff",
    badgeBg: "rgba(140,205,255,0.10)",
  },
  epic: {
    label: "EPIC",
    border: "1px solid #a78bfa66",
    glow: "0 0 18px 4px rgba(167,139,250,0.22)",
    badge: "#a78bfa",
    badgeText: "#a78bfa",
    badgeBg: "rgba(167,139,250,0.12)",
  },
};

function getBaseCoin(symbol: string): string {
  // "BTC_USDT" → "btc", "BTCUSDT" → try stripping _USDT or USDT
  const withUnderscore = symbol.split("_")[0];
  return withUnderscore.toLowerCase();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function CoinIcon({ symbol }: { symbol: string }) {
  const base = getBaseCoin(symbol);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "rgba(78,222,163,0.1)",
          border: "1px solid rgba(78,222,163,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: 900,
          color: "#4edea3",
          fontFamily: "monospace",
          flexShrink: 0,
        }}
      >
        {base.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${base}.svg`}
      alt={base}
      width={52}
      height={52}
      style={{ borderRadius: "50%", flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}

function CoinCard({ entry }: { entry: CollectionEntry }) {
  const cfg = RARITY_CONFIG[entry.rarity];
  const base = getBaseCoin(entry.symbol);

  return (
    <div
      style={{
        background:
          entry.rarity === "epic"
            ? "linear-gradient(145deg, #1a1530 0%, #191f31 100%)"
            : "#191f31",
        border: cfg.border,
        borderRadius: "14px",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        boxShadow: cfg.glow,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        cursor: "default",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        if (entry.rarity !== "common") {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            entry.rarity === "epic"
              ? "0 0 28px 6px rgba(167,139,250,0.32)"
              : "0 0 22px 4px rgba(140,205,255,0.28)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = cfg.glow;
      }}
    >
      <CoinIcon symbol={entry.symbol} />

      <div
        style={{
          fontSize: "15px",
          fontWeight: 900,
          color: "#dce1fb",
          fontFamily: "monospace",
          letterSpacing: "0.04em",
        }}
      >
        {base.toUpperCase()}
      </div>

      {/* Rarity badge */}
      <div
        style={{
          padding: "2px 10px",
          borderRadius: "20px",
          background: cfg.badgeBg,
          border: `1px solid ${cfg.badge}44`,
          fontSize: "9px",
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: cfg.badgeText,
          textTransform: "uppercase",
        }}
      >
        {cfg.label}
      </div>

      <div style={{ fontSize: "10px", color: "#5a6075", marginTop: "2px" }}>
        {formatDate(entry.collectedAt)}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      {/* Stats skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              background: "#191f31",
              border: "1px solid #2e3447",
              borderRadius: "12px",
              height: "80px",
            }}
          />
        ))}
      </div>
      {/* Cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: "14px",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              background: "#191f31",
              border: "1px solid #2e3447",
              borderRadius: "14px",
              height: "160px",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

    Promise.all([
      fetch(`${BASE}/collection`, { credentials: "include" }).then((r) =>
        r.ok ? r.json() : { collection: [] }
      ),
      fetch(`${BASE}/collection/stats`, { credentials: "include" }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([colData, statsData]) => {
        if (Array.isArray(colData?.collection)) {
          setCollection(colData.collection as CollectionEntry[]);
        }
        if (statsData) {
          setStats(statsData as CollectionStats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards: Array<{ label: string; value: string | number; color: string }> = stats
    ? [
        { label: "Total", value: stats.total, color: "#4edea3" },
        { label: "Common", value: stats.common, color: "#909097" },
        { label: "Rare", value: stats.rare, color: "#8ccdff" },
        { label: "Epic", value: stats.epic, color: "#a78bfa" },
        {
          label: "Completion",
          value: `${Math.round(stats.completionPct)}%`,
          color: "#f5c842",
        },
      ]
    : [];

  return (
    <div style={{ color: "#dce1fb", minHeight: "100vh" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <Gem size={22} style={{ color: "#a78bfa" }} />
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 900,
            color: "#dce1fb",
            letterSpacing: "0.02em",
            margin: 0,
          }}
        >
          Coin Collection
        </h1>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats bar */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              {statCards.map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    background: "#191f31",
                    border: "1px solid #2e3447",
                    borderRadius: "12px",
                    padding: "16px 12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color,
                      fontFamily: "monospace",
                      marginBottom: "4px",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#909097",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {collection.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "280px",
                gap: "12px",
                background: "#191f31",
                border: "1px solid #2e3447",
                borderRadius: "16px",
              }}
            >
              <Gem size={40} style={{ color: "#3a3f52" }} />
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#dce1fb",
                }}
              >
                No coins yet
              </div>
              <div style={{ fontSize: "13px", color: "#909097", textAlign: "center", maxWidth: "280px" }}>
                Make your first trade to start collecting!
              </div>
            </div>
          ) : (
            /* Coin grid */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "14px",
              }}
            >
              {collection.map((entry) => (
                <CoinCard key={`${entry.symbol}-${entry.collectedAt}`} entry={entry} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
