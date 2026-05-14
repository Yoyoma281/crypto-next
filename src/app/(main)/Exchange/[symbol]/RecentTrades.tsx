"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

interface Trade {
  id: string;
  price: string;
  qty: string;
  time: number;
  isBuy: boolean;
}

const GATEIO_WS   = "wss://api.gateio.ws/ws/v4/";
const GATEIO_REST = "https://api.gateio.ws/api/v4";

export default function RecentTrades({ symbol }: { symbol: string }) {
  const { t } = useI18n();
  const [trades, setTrades] = useState<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let alive = true;
    const pair = symbol.replace("USDT", "_USDT");

    // REST snapshot
    fetch(`${GATEIO_REST}/spot/trades?currency_pair=${pair}&limit=30`)
      .then((r) => r.json())
      .then((list: Array<{ id: string; create_time_ms: string; price: string; amount: string; side: string }>) => {
        if (!alive) return;
        setTrades(
          list.map((item) => ({
            id:    item.id,
            price: item.price,
            qty:   item.amount,
            time:  parseInt(item.create_time_ms),
            isBuy: item.side === "buy",
          })),
        );
      })
      .catch(() => {});

    // WS live stream
    const ws = new WebSocket(GATEIO_WS);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        time:    Math.floor(Date.now() / 1000),
        channel: "spot.trades",
        event:   "subscribe",
        payload: [pair],
      }));
    };

    ws.onmessage = (e) => {
      if (!alive) return;
      try {
        const msg = JSON.parse(e.data);
        if (msg.channel !== "spot.trades" || msg.event !== "update") return;
        const items: Array<{ id: string; create_time_ms: number; price: string; amount: string; side: string }> =
          Array.isArray(msg.result) ? msg.result : [msg.result];
        setTrades((prev) =>
          [
            ...items.map((d) => ({
              id:    String(d.id),
              price: d.price,
              qty:   d.amount,
              time:  d.create_time_ms,
              isBuy: d.side === "buy",
            })),
            ...prev,
          ].slice(0, 30),
        );
      } catch { /* ignore */ }
    };

    return () => {
      alive = false;
      ws.close();
    };
  }, [symbol]);

  return (
    <div className="flex flex-col overflow-hidden text-[12px]" style={{ background: "#0c1322" }}>
      <p className="text-xs font-semibold px-3 py-2" style={{ borderBottomColor: "#2e3545", borderBottomWidth: "1px", color: "#dce2f7" }}>
        {t.trading.recentTrades}
      </p>

      <div className="flex justify-between px-3 py-1 text-[11px]" style={{ color: "#bec8d2" }}>
        <span>{t.trading.priceUsdt}</span>
        <span>{t.trading.amount}</span>
        <span>{t.trading.time}</span>
      </div>

      <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 260 }}>
        {trades.map((trade) => (
          <div key={trade.id} className="flex justify-between px-3 py-[3px]">
            <span
              className="font-mono tabular-nums"
              style={{ color: trade.isBuy ? "#42e09a" : "#ffb4ab" }}
            >
              {parseFloat(trade.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </span>
            <span className="tabular-nums" style={{ color: "#bec8d2" }}>
              {parseFloat(trade.qty).toFixed(4)}
            </span>
            <span style={{ color: "#bec8d2" }}>
              {new Date(trade.time).toLocaleTimeString("en-US", {
                hour12: false,
                hour:   "2-digit",
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
