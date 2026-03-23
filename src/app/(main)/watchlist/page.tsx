"use client";

import { useState, useEffect } from "react";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import FavoritesTable from "@/app/(main)/coin/FavoritesTable";
import { useFavorites } from "@/hooks/useFavorites";
import AuthRequired from "@/components/auth-required";
import { useI18n } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

export default function WatchlistPage() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { favorites, toggle, synced } = useFavorites();

  useEffect(() => {
    fetch(`${BASE}/GetUserInfo`, { credentials: "include" })
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null;
  if (authed === false) {
    return (
      <AuthRequired
        title={t.watchlist.signIn}
        description={t.watchlist.signInSubtitle}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <h1 className="text-2xl font-bold">{t.watchlist.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t.watchlist.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {synced && (
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
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
              {t.watchlist.synced}
            </span>
          )}
          <Link
            href="/coin"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            {t.watchlist.browseMarkets} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      {favorites.size > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span>
            {favorites.size} {favorites.size !== 1 ? t.watchlist.coinPlural : t.watchlist.coinSingular} {t.watchlist.watched}
          </span>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
      >
        <FavoritesTable favorites={favorites} toggleFavorite={toggle} />
      </div>

      {favorites.size === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          {t.watchlist.starCoins}{" "}
          <Link href="/coin" className="underline hover:text-foreground">
            {t.watchlist.markets}
          </Link>{" "}
          {t.watchlist.or}{" "}
          <Link href="/coin/BTCUSDT?tab=trade" className="underline hover:text-foreground">
            {t.watchlist.exchange}
          </Link>{" "}
          {t.watchlist.addThem}
        </p>
      )}
    </div>
  );
}
