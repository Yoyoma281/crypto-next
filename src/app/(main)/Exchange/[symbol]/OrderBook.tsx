"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Level = [string, string]; // [price, qty]

interface BookState {
  bids: Level[];
  asks: Level[]; // stored asks[0] = lowest ask
}

function Bar({ pct, isAsk }: { pct: number; isAsk: boolean }) {
  return (
    <div
      className="absolute inset-y-0 right-0"
      style={{
        width: `${pct}%`,
        background: isAsk ? "rgba(234,57,67,0.12)" : "rgba(22,199,132,0.12)",
      }}
    />
  );
}

export default function OrderBook({ symbol }: { symbol: string }) {
  const { t } = useI18n();
  const [book, setBook] = useState<BookState>({ bids: [], asks: [] });
  const wsRef = useRef<WebSocket | null>(null);
  // Maintain a mutable copy for delta merging
  const bookRef = useRef<{
    bids: Map<string, string>;
    asks: Map<string, string>;
  }>({
    bids: new Map(),
    asks: new Map(),
  });

  useEffect(() => {
    let alive = true;

    // REST snapshot
    fetch(
      `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=20`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const bidsMap = new Map<string, string>(
          (d.result?.b ?? []).map((l: string[]) => [l[0], l[1]]),
        );
        const asksMap = new Map<string, string>(
          (d.result?.a ?? []).map((l: string[]) => [l[0], l[1]]),
        );
        bookRef.current = { bids: bidsMap, asks: asksMap };
        applyBook();
      })
      .catch(() => {});

    function applyBook() {
      const ROWS = 10;
      const bids = [...bookRef.current.bids.entries()]
        .filter(([, qty]) => parseFloat(qty) > 0)
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
        .slice(0, ROWS) as Level[];
      const asks = [...bookRef.current.asks.entries()]
        .filter(([, qty]) => parseFloat(qty) > 0)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        .slice(0, ROWS) as Level[];
      const count = Math.min(bids.length, asks.length);
      setBook({ bids: bids.slice(0, count), asks: asks.slice(0, count) });
    }

    // WebSocket live updates
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({ op: "subscribe", args: [`orderbook.20.${symbol}`] }),
      );
    };

    ws.onmessage = (e) => {
      if (!alive) return;
      const msg = JSON.parse(e.data);
      if (!msg.topic || !msg.topic.startsWith("orderbook")) return;

      const data = msg.data;
      if (msg.type === "snapshot") {
        bookRef.current.bids = new Map(
          (data.b ?? []).map((l: string[]) => [l[0], l[1]]),
        );
        bookRef.current.asks = new Map(
          (data.a ?? []).map((l: string[]) => [l[0], l[1]]),
        );
      } else {
        // delta — merge updates (size=0 means remove)
        for (const [p, q] of data.b ?? []) bookRef.current.bids.set(p, q);
        for (const [p, q] of data.a ?? []) bookRef.current.asks.set(p, q);
      }
      applyBook();
    };

    return () => {
      alive = false;
      ws.close();
    };
  }, [symbol]);

  // asks displayed in reverse (highest ask at top, lowest near spread)
  const displayAsks = [...book.asks].reverse();

  const allQtys = [
    ...book.bids.map((b) => parseFloat(b[1])),
    ...book.asks.map((a) => parseFloat(a[1])),
  ];
  const maxQty = Math.max(...allQtys, 1);

  const bestAsk = book.asks[0] ? parseFloat(book.asks[0][0]) : null;
  const bestBid = book.bids[0] ? parseFloat(book.bids[0][0]) : null;
  const spread =
    bestAsk != null && bestBid != null ? (bestAsk - bestBid).toFixed(2) : "—";

  const fmt = (n: string, decimals = 2) =>
    parseFloat(n).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const fmtTotal = (price: string, qty: string) =>
    (parseFloat(price) * parseFloat(qty)).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="flex flex-col h-full overflow-hidden text-[11px]" style={{ background: "#0c1322" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(62,72,80,0.3)", background: "rgba(20,27,43,0.5)" }}>
        <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: "#bec8d2" }}>
          {t.trading.orderBook}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-4 py-2 text-[10px] uppercase font-bold border-b" style={{ color: "rgba(190,200,210,0.6)", borderColor: "rgba(62,72,80,0.2)" }}>
        <span>{t.trading.priceUsdt}</span>
        <span className="text-right">{t.trading.qty}</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks — red, highest first */}
      <div className="flex flex-col">
        {displayAsks.map(([price, qty], i) => (
          <div key={i} className="relative grid grid-cols-3 px-4 py-1.5 font-mono cursor-pointer transition-colors hover:bg-white/5">
            <div className="absolute right-0 top-0 h-full pointer-events-none" style={{ width: `${(parseFloat(qty) / maxQty) * 100}%`, background: "rgba(255,180,171,0.08)" }} />
            <span className="relative font-bold" style={{ color: "#ffb4ab" }}>{fmt(price)}</span>
            <span className="relative text-right" style={{ color: "#dce2f7" }}>{fmt(qty, 4)}</span>
            <span className="relative text-right" style={{ color: "rgba(190,200,210,0.5)" }}>{fmtTotal(price, qty)}</span>
          </div>
        ))}
      </div>

      {/* Spread row */}
      <div className="flex items-center justify-center gap-4 py-2.5 border-y" style={{ borderColor: "rgba(62,72,80,0.3)", background: "rgba(20,27,43,0.8)" }}>
        <span className="text-lg font-black tracking-tighter" style={{ color: "#dce2f7" }}>
          {bestAsk != null ? fmt(book.asks[0][0]) : "—"}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#42e09a" }} />
          <span className="text-[10px] font-bold font-mono" style={{ color: "#bec8d2" }}>
            SPREAD {spread}
          </span>
        </div>
      </div>

      {/* Bids — green */}
      <div className="flex flex-col">
        {book.bids.map(([price, qty], i) => (
          <div key={i} className="relative grid grid-cols-3 px-4 py-1.5 font-mono cursor-pointer transition-colors hover:bg-white/5">
            <div className="absolute right-0 top-0 h-full pointer-events-none" style={{ width: `${(parseFloat(qty) / maxQty) * 100}%`, background: "rgba(66,224,154,0.08)" }} />
            <span className="relative font-bold" style={{ color: "#42e09a" }}>{fmt(price)}</span>
            <span className="relative text-right" style={{ color: "#dce2f7" }}>{fmt(qty, 4)}</span>
            <span className="relative text-right" style={{ color: "rgba(190,200,210,0.5)" }}>{fmtTotal(price, qty)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
