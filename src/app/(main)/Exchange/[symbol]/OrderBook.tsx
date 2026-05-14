"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Level = [string, string]; // [price, qty]

interface BookState {
  bids: Level[];
  asks: Level[];
}

const GATEIO_WS  = "wss://api.gateio.ws/ws/v4/";
const GATEIO_REST = "https://api.gateio.ws/api/v4";

export default function OrderBook({ symbol }: { symbol: string }) {
  const { t } = useI18n();
  const [book, setBook] = useState<BookState>({ bids: [], asks: [] });
  const bookRef = useRef<{ bids: Map<string, string>; asks: Map<string, string> }>({
    bids: new Map(),
    asks: new Map(),
  });

  useEffect(() => {
    let alive = true;
    const pair = symbol.replace("USDT", "_USDT");

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

    // REST snapshot
    fetch(`${GATEIO_REST}/spot/order_book?currency_pair=${pair}&limit=20&with_id=true`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        bookRef.current.bids = new Map((d.bids ?? []).map((l: string[]) => [l[0], l[1]]));
        bookRef.current.asks = new Map((d.asks ?? []).map((l: string[]) => [l[0], l[1]]));
        applyBook();
      })
      .catch(() => {});

    // WS live updates
    const ws = new WebSocket(GATEIO_WS);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        time:    Math.floor(Date.now() / 1000),
        channel: "spot.order_book",
        event:   "subscribe",
        payload: [pair, "20", "1000ms"],
      }));
    };

    ws.onmessage = (e) => {
      if (!alive) return;
      try {
        const msg = JSON.parse(e.data);
        if (msg.channel !== "spot.order_book" || msg.event !== "update") return;
        const data = msg.result;
        if (!data) return;
        // Gate.io sends full snapshots on each update for the order_book channel
        bookRef.current.bids = new Map((data.bids ?? []).map((l: string[]) => [l[0], l[1]]));
        bookRef.current.asks = new Map((data.asks ?? []).map((l: string[]) => [l[0], l[1]]));
        applyBook();
      } catch { /* ignore */ }
    };

    return () => {
      alive = false;
      ws.close();
    };
  }, [symbol]);

  const displayAsks = [...book.asks].reverse();

  const allQtys = [
    ...book.bids.map((b) => parseFloat(b[1])),
    ...book.asks.map((a) => parseFloat(a[1])),
  ];
  const maxQty = Math.max(...allQtys, 1);

  const bestAsk = book.asks[0] ? parseFloat(book.asks[0][0]) : null;
  const bestBid = book.bids[0] ? parseFloat(book.bids[0][0]) : null;
  const spread  = bestAsk != null && bestBid != null ? (bestAsk - bestBid).toFixed(2) : "—";

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
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(62,72,80,0.3)", background: "rgba(20,27,43,0.5)" }}>
        <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: "#bec8d2" }}>
          {t.trading.orderBook}
        </span>
      </div>

      <div className="grid grid-cols-3 px-4 py-2 text-[10px] uppercase font-bold border-b" style={{ color: "rgba(190,200,210,0.6)", borderColor: "rgba(62,72,80,0.2)" }}>
        <span>{t.trading.priceUsdt}</span>
        <span className="text-right">{t.trading.qty}</span>
        <span className="text-right">Total</span>
      </div>

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
