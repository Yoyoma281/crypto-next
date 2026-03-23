"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

interface Trade {
  id: string;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

export default function RecentTrades({ symbol }: { symbol: string }) {
  const { t } = useI18n();
  const [trades, setTrades] = useState<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let alive = true;

    // REST snapshot — Bybit recent trades
    fetch(
      `https://api.bybit.com/v5/market/recent-trade?category=spot&symbol=${symbol}&limit=30`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const list = (d.result?.list ?? []) as Array<{
          execId: string;
          price: string;
          size: string;
          side: string;
          time: string;
        }>;
        setTrades(
          list.map((item) => ({
            id: item.execId,
            price: item.price,
            qty: item.size,
            time: parseInt(item.time),
            // In Bybit: side="Buy" means taker bought → maker was seller → isBuyerMaker=false
            isBuyerMaker: item.side === "Sell",
          })),
        );
      })
      .catch(() => {});

    // WebSocket live stream
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({ op: "subscribe", args: [`publicTrade.${symbol}`] }),
      );
    };

    ws.onmessage = (e) => {
      if (!alive) return;
      const msg = JSON.parse(e.data);
      if (!msg.topic || !msg.topic.startsWith("publicTrade")) return;

      const items = msg.data as Array<{
        i: string;
        p: string;
        v: string;
        S: string;
        T: number;
      }>;
      setTrades((prev) =>
        [
          ...items.map((d) => ({
            id: d.i,
            price: d.p,
            qty: d.v,
            time: d.T,
            isBuyerMaker: d.S === "Sell",
          })),
          ...prev,
        ].slice(0, 30),
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
        {t.trading.recentTrades}
      </p>

      {/* Headers */}
      <div className="flex justify-between text-muted-foreground px-3 py-1 text-[11px]">
        <span>{t.trading.priceUsdt}</span>
        <span>{t.trading.amount}</span>
        <span>{t.trading.time}</span>
      </div>

      <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 260 }}>
        {trades.map((t) => (
          <div key={t.id} className="flex justify-between px-3 py-[3px]">
            <span
              className="font-mono tabular-nums"
              style={{ color: t.isBuyerMaker ? "#ffb3ad" : "#4edea3" }}
            >
              {parseFloat(t.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-foreground tabular-nums">
              {parseFloat(t.qty).toFixed(4)}
            </span>
            <span className="text-muted-foreground">
              {new Date(t.time).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
