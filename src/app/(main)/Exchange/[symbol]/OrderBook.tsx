'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();
  const [book, setBook] = useState<BookState>({ bids: [], asks: [] });
  const wsRef = useRef<WebSocket | null>(null);
  // Maintain a mutable copy for delta merging
  const bookRef = useRef<{ bids: Map<string, string>; asks: Map<string, string> }>({
    bids: new Map(),
    asks: new Map(),
  });

  useEffect(() => {
    let alive = true;

    // REST snapshot
    fetch(`https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const bidsMap = new Map<string, string>((d.result?.b ?? []).map((l: string[]) => [l[0], l[1]]));
        const asksMap = new Map<string, string>((d.result?.a ?? []).map((l: string[]) => [l[0], l[1]]));
        bookRef.current = { bids: bidsMap, asks: asksMap };
        applyBook();
      })
      .catch(() => {});

    function applyBook() {
      const bids = [...bookRef.current.bids.entries()]
        .filter(([, qty]) => parseFloat(qty) > 0)
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
        .slice(0, 14) as Level[];
      const asks = [...bookRef.current.asks.entries()]
        .filter(([, qty]) => parseFloat(qty) > 0)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        .slice(0, 14) as Level[];
      setBook({ bids, asks });
    }

    // WebSocket live updates
    const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ op: 'subscribe', args: [`orderbook.20.${symbol}`] }));
    };

    ws.onmessage = (e) => {
      if (!alive) return;
      const msg = JSON.parse(e.data);
      if (!msg.topic || !msg.topic.startsWith('orderbook')) return;

      const data = msg.data;
      if (msg.type === 'snapshot') {
        bookRef.current.bids = new Map((data.b ?? []).map((l: string[]) => [l[0], l[1]]));
        bookRef.current.asks = new Map((data.a ?? []).map((l: string[]) => [l[0], l[1]]));
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
    bestAsk != null && bestBid != null
      ? (bestAsk - bestBid).toFixed(2)
      : '—';

  const fmt = (n: string, decimals = 2) =>
    parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="flex flex-col h-full overflow-hidden text-[12px]">
      <p className="text-xs font-semibold px-3 py-2 border-b border-border">{t.trading.orderBook}</p>

      {/* Column headers */}
      <div className="flex justify-between text-muted-foreground px-3 py-1 text-[11px]">
        <span>{t.trading.priceUsdt}</span>
        <span>{t.trading.qty}</span>
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
        <span className="text-muted-foreground">{t.trading.spread}</span>
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
