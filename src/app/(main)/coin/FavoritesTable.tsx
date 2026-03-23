"use client";

import { useMemo } from "react";
import { DataTable } from "@/app/components/table";
import { makeColumns } from "./coinColumns";
import { CoinTableRow } from "@/app/types/coin";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useFavoritesCtx } from "@/components/favorites-context";

interface Props {
  favorites: Set<string>;
  toggleFavorite: (symbol: string) => void;
}

export default function FavoritesTable({ favorites, toggleFavorite }: Props) {
  const { t } = useI18n();
  const { tickers } = useFavoritesCtx();

  const rows = useMemo(
    () => [...favorites].map(s => tickers[s]).filter(Boolean) as CoinTableRow[],
    [favorites, tickers]
  );

  const columns = useMemo(
    () => makeColumns(t, 0, favorites, toggleFavorite),
    [favorites, toggleFavorite, t]
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
