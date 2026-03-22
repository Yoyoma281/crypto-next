"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT",
  "LTCUSDT", "UNIUSDT", "ATOMUSDT", "NEARUSDT", "MATICUSDT",
];

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  flash?: "up" | "down" | null;
}

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return p.toFixed(4);
  return p.toFixed(6);
}

export default function TickerBar() {
  const [tickers, setTickers] = useState<Record<string, TickerItem>>({});
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");

    ws.onopen = () => {
      ws.send(JSON.stringify({
        op: "subscribe",
        args: SYMBOLS.map((s) => `tickers.${s}`),
      }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (!msg.topic || !msg.topic.startsWith("tickers.")) return;
      const d = msg.data;
      if (!d || !d.symbol || !d.lastPrice) return;

      const sym = d.symbol as string;
      if (!SYMBOLS.includes(sym)) return;

      const close = parseFloat(d.lastPrice);
      // price24hPcnt is a decimal fraction (e.g. "0.0234" = +2.34%)
      const changePct = parseFloat(d.price24hPcnt ?? "0") * 100;

      const prev = prevPrices.current[sym];
      const flash: "up" | "down" | null =
        prev == null ? null : close > prev ? "up" : close < prev ? "down" : null;
      prevPrices.current[sym] = close;

      setTickers((prev) => ({
        ...prev,
        [sym]: { symbol: sym.replace("USDT", ""), price: close, change: changePct, flash },
      }));

      // Clear flash after 600ms
      if (flash) {
        setTimeout(() => {
          setTickers((prev) => ({
            ...prev,
            [sym]: { ...prev[sym], flash: null },
          }));
        }, 600);
      }
    };

    return () => ws.close();
  }, []);

  const items = SYMBOLS.filter((s) => tickers[s]).map((s) => tickers[s]);

  if (items.length === 0) return null;

  const looped = [...items, ...items];

  return (
    <div
      className="w-full border-b border-border bg-background/80 overflow-hidden"
      style={{ height: "30px" }}
    >
      <div className="ticker-track flex items-center h-full">
        {looped.map((item, i) => {
          const isUp = item.change >= 0;
          const flashColor =
            item.flash === "up" ? "#16c784" :
            item.flash === "down" ? "#ea3943" :
            undefined;
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 px-5 shrink-0 text-xs select-none"
            >
              <span className="font-semibold text-foreground">{item.symbol}</span>
              <span
                className="tabular-nums transition-colors duration-300"
                style={{ color: flashColor ?? "hsl(var(--muted-foreground))" }}
              >
                ${fmtPrice(item.price)}
              </span>
              <span
                className="flex items-center gap-0.5 font-semibold"
                style={{ color: isUp ? "#16c784" : "#ea3943" }}
              >
                {isUp
                  ? <ArrowUpRight className="h-3 w-3" />
                  : <ArrowDownRight className="h-3 w-3" />}
                {isUp ? "+" : ""}{item.change.toFixed(2)}%
              </span>

              <span className="text-border ml-2">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
