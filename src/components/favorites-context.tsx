"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CoinTableRow } from "@/app/types/coin";

const FAV_API   = "/api/favorites";
const STORE_KEY = "cryser_favorites";

function readLocal(): Set<string> {
  try { const r = localStorage.getItem(STORE_KEY); if (r) return new Set(JSON.parse(r)); } catch {}
  return new Set();
}
function writeLocal(s: Set<string>) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...s])); } catch {}
}
function syncServer(s: Set<string>) {
  fetch(FAV_API, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorites: [...s] }), keepalive: true }).catch(() => {});
}

interface FavCtx {
  favorites: Set<string>;
  tickers:   Record<string, CoinTableRow>;
  synced:    boolean;
  toggle:    (symbol: string) => void;
}

const Ctx = createContext<FavCtx>({ favorites: new Set(), tickers: {}, synced: false, toggle: () => {} });

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(() =>
    typeof window === "undefined" ? new Set() : readLocal()
  );
  const [tickers, setTickers] = useState<Record<string, CoinTableRow>>({});
  const [synced, setSynced]   = useState(false);

  const dirtyRef = useRef(false);
  const favRef   = useRef(favorites);
  favRef.current = favorites;

  // ── Server sync on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(FAV_API, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: { favorites: string[] }) => {
        const s = new Set<string>(d.favorites);
        setFavorites(s);
        writeLocal(s);
        setSynced(true);
      })
      .catch(() => setSynced(false));
  }, []);

  // ── Flush on tab close / SPA navigation ──────────────────────────────────
  useEffect(() => {
    const flush = () => { if (dirtyRef.current && synced) syncServer(favRef.current); };
    window.addEventListener("beforeunload", flush);
    return () => { flush(); window.removeEventListener("beforeunload", flush); };
  }, [synced]);

  // ── Bybit WebSocket for live ticker data ─────────────────────────────────
  const rawRef = useRef<Record<string, Record<string, string>>>({});
  const wsRef  = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current?.close();
    wsRef.current = null;

    if (favorites.size === 0) { setTickers({}); return; }

    const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ op: "subscribe", args: [...favorites].map(s => `tickers.${s}`) }));

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (!msg.topic?.startsWith("tickers.")) return;
        const d = msg.data;
        if (!d?.symbol) return;
        const sym = d.symbol as string;
        rawRef.current[sym] = { ...(rawRef.current[sym] ?? {}), ...d };
        const r = rawRef.current[sym];
        if (!r.lastPrice) return;
        const last = parseFloat(r.lastPrice);
        const prev = parseFloat(r.prevPrice24h ?? r.lastPrice);
        setTickers(t => ({
          ...t,
          [sym]: {
            symbol: sym,
            lastPrice: r.lastPrice,
            priceChange: (last - prev).toFixed(8),
            priceChangePercent: (parseFloat(r.price24hPcnt ?? "0") * 100).toFixed(2),
            weightedAvgPrice: r.lastPrice,
            prevClosePrice: r.prevPrice24h ?? r.lastPrice,
            sparkData: t[sym]?.sparkData ?? [],
          },
        }));
      } catch {}
    };

    return () => ws.close();
  }, [favorites]);

  const toggle = useCallback((symbol: string) => {
    const up = symbol.toUpperCase();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(up)) next.delete(up); else next.add(up);
      writeLocal(next);
      dirtyRef.current = true;
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ favorites, tickers, synced, toggle }}>{children}</Ctx.Provider>;
}

export function useFavoritesCtx() { return useContext(Ctx); }
