"use client";

import { useState, useEffect } from "react";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import FavoritesTable from "@/app/(main)/coin/FavoritesTable";
import { useFavorites } from "@/hooks/useFavorites";
import AuthRequired from "@/components/auth-required";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

export default function WatchlistPage() {
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
        title="Sign in to view your watchlist"
        description="Star coins to track them here with live prices."
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
            <h1 className="text-2xl font-bold">Watchlist</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your starred coins — live prices updated in real time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {synced && (
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ color: "#16c784", background: "rgba(22,199,132,0.1)" }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "#16c784" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "#16c784" }}
                />
              </span>
              Synced
            </span>
          )}
          <Link
            href="/coin"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Browse Markets <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      {favorites.size > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span>
            {favorites.size} coin{favorites.size !== 1 ? "s" : ""} watched
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
          Star coins on the{" "}
          <Link href="/coin" className="underline hover:text-foreground">
            Markets
          </Link>{" "}
          or{" "}
          <Link href="/coin/BTCUSDT?tab=trade" className="underline hover:text-foreground">
            Exchange
          </Link>{" "}
          page to add them here.
        </p>
      )}
    </div>
  );
}
