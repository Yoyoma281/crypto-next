'use client';

import { useEffect, useRef, useState } from 'react';

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
        background: isAsk ? 'rgba(234,57,67,0.12)' : 'rgba(22,199,132,0.12)',
      }}
    />
  );
}

export default function OrderBook({ symbol }: { symbol: string }) {
  const [book, setBook] = useState<BookState>({ bids: [], asks: [] });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let alive = true;

    fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=14`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setBook({
          bids: d.bids.slice(0, 14),
          asks: d.asks.slice(0, 14),
        });
      })
      .catch(() => {});

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@500ms`
    );
    wsRef.current = ws;
    ws.onmessage = (e) => {
      if (!alive) return;
      const d = JSON.parse(e.data);
      setBook({ bids: d.bids.slice(0, 14), asks: d.asks.slice(0, 14) });
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
    bestAsk != null && bestBid != null
      ? (bestAsk - bestBid).toFixed(2)
      : '—';

  const fmt = (n: string, decimals = 2) =>
    parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="flex flex-col h-full overflow-hidden text-[12px]">
      <p className="text-xs font-semibold px-3 py-2 border-b border-border">Order Book</p>

      {/* Column headers */}
      <div className="flex justify-between text-muted-foreground px-3 py-1 text-[11px]">
        <span>Price (USDT)</span>
        <span>Qty</span>
      </div>

      {/* Asks — red, highest first */}
      <div className="flex flex-col">
        {displayAsks.map(([price, qty], i) => (
          <div key={i} className="relative flex justify-between px-3 py-[2px]">
            <Bar pct={(parseFloat(qty) / maxQty) * 100} isAsk />
            <span className="relative font-mono" style={{ color: '#ea3943' }}>
              {fmt(price)}
            </span>
            <span className="relative text-foreground">{fmt(qty, 4)}</span>
          </div>
        ))}
      </div>

      {/* Spread row */}
      <div className="flex items-center justify-center gap-2 py-1.5 border-y border-border bg-muted/20 text-[11px]">
        <span className="text-muted-foreground">Spread</span>
        <span className="font-medium text-foreground">{spread}</span>
      </div>

      {/* Bids — green */}
      <div className="flex flex-col">
        {book.bids.map(([price, qty], i) => (
          <div key={i} className="relative flex justify-between px-3 py-[2px]">
            <Bar pct={(parseFloat(qty) / maxQty) * 100} isAsk={false} />
            <span className="relative font-mono" style={{ color: '#16c784' }}>
              {fmt(price)}
            </span>
            <span className="relative text-foreground">{fmt(qty, 4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
