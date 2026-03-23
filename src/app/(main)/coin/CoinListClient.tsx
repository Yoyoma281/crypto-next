"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/app/components/table";
import { makeColumns } from "./coinColumns";
import { CoinTableRow } from "@/app/types/coin";
import { useFavorites } from "@/hooks/useFavorites";
import FavoritesTable from "./FavoritesTable";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const LIMIT = 10;

interface StreamFrame {
  coins: CoinTableRow[];
  total: number;
  totalPages: number;
  page: number;
}

/** Fixed-height skeleton shown while the new page loads — prevents layout collapse */
function TableSkeleton({ rows = LIMIT }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
        {[40, 180, 100, 110, 80, 100, 100, 110].map((w, i) => (
          <div key={i} className="h-3 rounded bg-muted animate-pulse" style={{ width: w, flexShrink: 0 }} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 border-b border-border" style={{ height: 64 }}>
          <div className="h-3 w-8 rounded bg-muted/60 animate-pulse flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-muted/60 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-12 rounded bg-muted/60 animate-pulse" />
              <div className="h-2 w-16 rounded bg-muted/40 animate-pulse" />
            </div>
          </div>
          {[80, 90, 70, 80, 80, 100].map((w, i) => (
            <div key={i} className="h-3 rounded bg-muted/50 animate-pulse" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

type Tab = "all" | "favorites";

export default function CoinListClient() {
  const [coins, setCoins] = useState<CoinTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [tab, setTab] = useState<Tab>("all");
  const { favorites, toggle } = useFavorites();
  const { t } = useI18n();

  // Reconnect SSE every time `page` changes
  useEffect(() => {
    setStatus("connecting");
    setLoading(true);

    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_BASE_URL}/coins/stream?page=${page}&limit=${LIMIT}`,
      { withCredentials: true }
    );

    es.onopen = () => setStatus("live");

    es.onmessage = (e) => {
      try {
        const frame = JSON.parse(e.data) as StreamFrame;
        setCoins(frame.coins);
        setTotalPages(frame.totalPages);
        setTotal(frame.total);
        setStatus("live");
        setLoading(false);
      } catch {
        // ignore malformed frames
      }
    };

    es.onerror = () => setStatus("error");

    return () => es.close();
  }, [page]);

  // Columns with correct global offset so rank shows #11, #12 … on page 2
  const columns = useMemo(
    () => makeColumns(t, (page - 1) * LIMIT, favorites, toggle),
    [t, page, favorites, toggle]
  );

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {(["all", "favorites"] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === tabKey
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabKey === "favorites" && (
              <Star
                className="h-3.5 w-3.5"
                style={tab === "favorites" ? { fill: "#4edea3", color: "#4edea3" } : {}}
              />
            )}
            {tabKey === "all" ? t.markets.allCoins : t.markets.favorites}
            {tabKey === "favorites" && favorites.size > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                style={{ background: "rgba(78,222,163,0.15)", color: "#4edea3" }}
              >
                {favorites.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Favorites view */}
      {tab === "favorites" && (
        <FavoritesTable favorites={favorites} toggleFavorite={toggle} />
      )}

      {/* All coins view */}
      {tab === "all" && <>
      {/* Status + page info bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {status === "live" && (
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ color: "#4edea3", background: "rgba(78,222,163,0.1)" }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "#4edea3" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "#4edea3" }}
                />
              </span>
              {t.markets.live}
            </span>
          )}
          {status === "connecting" && (
            <span className="text-xs text-muted-foreground animate-pulse">{t.markets.connecting}</span>
          )}
          {status === "error" && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ color: "#ffb3ad", background: "rgba(255,179,173,0.1)" }}
            >
              {t.markets.disconnected}
            </span>
          )}
        </div>

        {total > 0 && (
          <span className="text-xs text-muted-foreground">
            {t.markets.showing}{" "}
            <span className="text-foreground font-medium">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}
            </span>{" "}
            {t.markets.of} <span className="text-foreground font-medium">{total}</span> {t.markets.coins}
          </span>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={LIMIT} />
      ) : (
        <DataTable
          data={coins}
          columns={columns}
          params="symbol"
          path="/coin"
          hidePagination
          initialSorting={[{ id: "lastPrice", desc: true }]}
        />
      )}

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <span className="text-xs text-muted-foreground">
          {t.markets.page} <span className="text-foreground font-semibold">{page}</span> of{" "}
          <span className="text-foreground font-semibold">{totalPages}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            {t.markets.prev}
          </button>

          {/* Page number pills */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors"
                style={
                  p === page
                    ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderColor: "transparent" }
                    : { borderColor: "hsl(var(--border))" }
                }
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            {t.markets.next}
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            »
          </button>
        </div>
      </div>
      </>}
    </>
  );
}
