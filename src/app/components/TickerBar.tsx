"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
  "DOTUSDT",
  "LINKUSDT",
  "LTCUSDT",
  "UNIUSDT",
  "ATOMUSDT",
  "NEARUSDT",
  "MATICUSDT",
];

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  flash?: "up" | "down" | null;
}

function fmtPrice(p: number): string {
  if (p >= 1000)
    return p.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (p >= 1) return p.toFixed(4);
  return p.toFixed(6);
}

export default function TickerBar() {
  const [tickers, setTickers] = useState<Record<string, TickerItem>>({});
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: SYMBOLS.map((s) => `tickers.${s}`),
        }),
      );
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
        prev == null
          ? null
          : close > prev
            ? "up"
            : close < prev
              ? "down"
              : null;
      prevPrices.current[sym] = close;

      setTickers((prev) => ({
        ...prev,
        [sym]: {
          symbol: sym.replace("USDT", ""),
          price: close,
          change: changePct,
          flash,
        },
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
      style={{ height: "28px" }}
    >
      <div className="ticker-track flex items-center h-full">
        {looped.map((item, i) => {
          const isUp = item.change >= 0;
          const flashColor =
            item.flash === "up"
              ? "#4edea3"
              : item.flash === "down"
                ? "#ffb3ad"
                : undefined;
          return (
            <div
              key={i}
              className="flex items-center gap-0.5 md:gap-1.5 px-2 sm:px-3 md:px-5 shrink-0 text-[10px] md:text-xs select-none whitespace-nowrap"
            >
              <span className="font-semibold text-foreground min-w-fit">
                {item.symbol}
              </span>
              <span
                className="tabular-nums transition-colors duration-300"
                style={{ color: flashColor ?? "hsl(var(--muted-foreground))" }}
              >
                ${fmtPrice(item.price)}
              </span>
              <span
                className="flex items-center gap-0.5 font-semibold hidden sm:flex"
                style={{ color: isUp ? "#4edea3" : "#ffb3ad" }}
              >
                {isUp ? (
                  <ArrowUpRight className="h-2 md:h-3 w-2 md:w-3" />
                ) : (
                  <ArrowDownRight className="h-2 md:h-3 w-2 md:w-3" />
                )}
                {isUp ? "+" : ""}
                {item.change.toFixed(2)}%
              </span>

              <span className="text-border ml-0.5 md:ml-2 hide-on-mobile">
                ·
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
