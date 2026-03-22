"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "@/app/components/table";
import { makeColumns } from "./coinColumns";
import { CoinTableRow } from "@/app/types/coin";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Props {
  favorites: Set<string>;
  toggleFavorite: (symbol: string) => void;
}

export default function FavoritesTable({ favorites, toggleFavorite }: Props) {
  const { t } = useI18n();
  const [tickers, setTickers] = useState<Record<string, CoinTableRow>>({});
  const wsRef = useRef<WebSocket | null>(null);

  // Reconnect whenever the favorites set changes
  useEffect(() => {
    if (favorites.size === 0) {
      wsRef.current?.close();
      wsRef.current = null;
      setTickers({});
      return;
    }

    const streams = [...favorites]
      .map((s) => `${s.toLowerCase()}@ticker`)
      .join("/");

    const ws = new WebSocket(
      `wss://stream.binance.com:443/stream?streams=${streams}`
    );
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const d = msg.data;
        if (!d || !d.s) return;
        setTickers((prev) => ({
          ...prev,
          [d.s]: {
            symbol: d.s,
            lastPrice: d.c,
            priceChange: d.p,
            priceChangePercent: d.P,
            weightedAvgPrice: d.w,
            prevClosePrice: d.x,
            sparkData: prev[d.s]?.sparkData ?? [],
          },
        }));
      } catch {}
    };

    return () => ws.close();
  }, [favorites]);

  const rows = useMemo(
    () => [...favorites].map((s) => tickers[s]).filter(Boolean) as CoinTableRow[],
    [favorites, tickers]
  );

  const columns = useMemo(
    () => makeColumns(t, 0, favorites, toggleFavorite),
    [favorites, toggleFavorite]
  );

  if (favorites.size === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="h-14 w-14 rounded-full flex items-center justify-center bg-muted/50">
          <Star className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">No favorites yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Click the <Star className="inline h-3.5 w-3.5 mb-0.5" /> star on any coin to add it here.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      data={rows}
      columns={columns}
      params="symbol"
      path="/coin"
      hidePagination
      initialSorting={[{ id: "lastPrice", desc: true }]}
    />
  );
}
