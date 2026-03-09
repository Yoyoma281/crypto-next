'use client';

import { useEffect, useRef, useState } from 'react';

interface Trade {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

export default function RecentTrades({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let alive = true;

    fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=30`)
      .then((r) => r.json())
      .then((data: Trade[]) => {
        if (!alive) return;
        setTrades([...data].reverse());
      })
      .catch(() => {});

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );
    wsRef.current = ws;
    ws.onmessage = (e) => {
      if (!alive) return;
      const d = JSON.parse(e.data);
      setTrades((prev) =>
        [
          {
            id: d.t,
            price: d.p,
            qty: d.q,
            time: d.T,
            isBuyerMaker: d.m,
          },
          ...prev,
        ].slice(0, 30)
      );
    };

    return () => {
      alive = false;
      ws.close();
    };
  }, [symbol]);

  return (
    <div className="flex flex-col overflow-hidden text-[12px]">
      <p className="text-xs font-semibold px-3 py-2 border-b border-border">
        Recent Trades
      </p>

      {/* Headers */}
      <div className="flex justify-between text-muted-foreground px-3 py-1 text-[11px]">
        <span>Price (USDT)</span>
        <span>Amount</span>
        <span>Time</span>
      </div>

      <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 260 }}>
        {trades.map((t) => (
          <div key={t.id} className="flex justify-between px-3 py-[3px]">
            <span
              className="font-mono tabular-nums"
              style={{ color: t.isBuyerMaker ? '#ea3943' : '#16c784' }}
            >
              {parseFloat(t.price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-foreground tabular-nums">
              {parseFloat(t.qty).toFixed(4)}
            </span>
            <span className="text-muted-foreground">
              {new Date(t.time).toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
