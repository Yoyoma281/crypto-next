"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import dynamic from "next/dynamic";
import OrderBook from "./OrderBook";
import RecentTrades from "./RecentTrades";
import TradeForm from "./TradeForm";

const PriceChart = dynamic(() => import("./PriceChart"), { ssr: false });

interface Ticker {
  price: string;
  change: string;
  changePct: string;
  high: string;
  low: string;
  volume: string;
}

function CoinImage({ ticker }: { ticker: string }) {
  const [stage, setStage] = useState(0);
  if (stage === 2) {
    return (
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
        style={{ background: `hsl(${(ticker.charCodeAt(0) * 47) % 360}, 55%, 45%)` }}
      >
        {ticker[0]}
      </div>
    );
  }
  const src =
    stage === 0
      ? `/Coin-icons/${ticker.toLowerCase()}.svg`
      : `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/${ticker.toLowerCase()}.png`;
  return (
    <Image
      key={src}
      src={src}
      alt={ticker}
      width={36}
      height={36}
      className="rounded-full"
      onError={() => setStage((s) => s + 1)}
      unoptimized
    />
  );
}

export default function TradingClient({
  symbol,
  hiddenHeader,
}: {
  symbol: string;
  hiddenHeader?: boolean;
}) {
  const ticker = symbol.replace("USDT", "");
  const { t } = useI18n();
  const [tickerData, setTickerData] = useState<Ticker | null>(null);
  const [bottomTab, setBottomTab] = useState<"trades" | "history">("trades");
  const [mobileTab, setMobileTab] = useState<"chart" | "book" | "form">("chart");
  const lastRef = useRef<Partial<Ticker>>({});

  useEffect(() => {
    const pair = symbol.replace("USDT", "_USDT");
    const ws = new WebSocket("wss://api.gateio.ws/ws/v4/");
    ws.onopen = () => {
      ws.send(JSON.stringify({
        time: Math.floor(Date.now() / 1000),
        channel: "spot.tickers",
        event: "subscribe",
        payload: [pair],
      }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.channel !== "spot.tickers" || msg.event !== "update") return;
      const d = msg.result;
      if (!d) return;
      if (d.last) lastRef.current.price = d.last;
      if (d.high_24h) lastRef.current.high = d.high_24h;
      if (d.low_24h) lastRef.current.low = d.low_24h;
      if (d.quote_volume) lastRef.current.volume = d.quote_volume;
      if (d.change_percentage !== undefined)
        lastRef.current.changePct = parseFloat(d.change_percentage).toFixed(2);
      if (d.change_utc0 !== undefined)
        lastRef.current.change = parseFloat(d.change_utc0).toFixed(8);
      const cur = lastRef.current;
      if (cur.price) {
        setTickerData({
          price: cur.price,
          change: cur.change ?? "0",
          changePct: cur.changePct ?? "0",
          high: cur.high ?? "0",
          low: cur.low ?? "0",
          volume: cur.volume ?? "0",
        });
      }
    };
    return () => ws.close();
  }, [symbol]);

  const isUp = tickerData ? parseFloat(tickerData.changePct) >= 0 : true;
  const changeColor = isUp ? "#4edea3" : "#ffb3ad";

  const fmtPrice = (v: string) =>
    parseFloat(v).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });

  const fmtVol = (v: string) => {
    const n = parseFloat(v);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col gap-0 min-h-0 bg-[#0c1324]">

      {/* ── Ticker Header ──────────────────────────────────────── */}
      {!hiddenHeader && (
        <div
          className="flex flex-wrap items-center gap-6 px-6 py-5 border-b"
          style={{ background: "#151b2d", borderColor: "#2e3447" }}
        >
          {/* Pair identity */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              <div className="w-10 h-10 rounded-full z-10 ring-2 ring-[#151b2d] overflow-hidden flex items-center justify-center" style={{ background: "#2e3447" }}>
                <CoinImage ticker={ticker} />
              </div>
              <div
                className="w-10 h-10 rounded-full z-0 flex items-center justify-center text-[11px] font-black text-[#c6c6cd]"
                style={{ background: "#2e3447", border: "2px solid #151b2d" }}
              >
                ₮
              </div>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-tight text-[#dce1fb]">
                {ticker} <span className="text-[#c6c6cd] font-medium">/ USDT</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#909097]">
                {symbol}
              </p>
            </div>
          </div>

          <div className="h-8 w-px hidden sm:block" style={{ background: "#2e3447" }} />

          {/* Price */}
          <div className="flex flex-col leading-tight">
            <span
              className="text-2xl font-black tabular-nums tracking-tighter"
              style={{ color: changeColor }}
            >
              {tickerData ? fmtPrice(tickerData.price) : "—"}
            </span>
            <span
              className="text-[11px] font-bold tabular-nums flex items-center gap-1"
              style={{ color: changeColor }}
            >
              {isUp ? "↑" : "↓"}
              {tickerData
                ? `${isUp ? "+" : ""}${parseFloat(tickerData.change).toFixed(2)} (${parseFloat(tickerData.changePct).toFixed(2)}%)`
                : "—"}
            </span>
          </div>

          {/* Stats */}
          {tickerData && (
            <div className="hidden lg:flex gap-8 flex-wrap">
              {[
                { label: t.trading.high24h,   value: fmtPrice(tickerData.high),   accent: false },
                { label: t.trading.low24h,    value: fmtPrice(tickerData.low),    accent: false },
                { label: t.trading.volume24h, value: fmtVol(tickerData.volume),   accent: true  },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#909097]">
                    {s.label}
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums mt-1"
                    style={s.accent ? { color: "#4edea3" } : { color: "#dce1fb" }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mobile tab bar ─────────────────────────────────────── */}
      <div className="md:hidden flex border-b shrink-0" style={{ background: "#151b2d", borderColor: "#2e3447" }}>
        {(["chart", "book", "form"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              mobileTab === tab
                ? "border-b-2 text-[#4edea3]"
                : "text-[#909097] hover:text-[#c6c6cd]"
            }`}
            style={mobileTab === tab ? { borderColor: "#4edea3" } : undefined}
          >
            {tab === "chart" ? "Chart" : tab === "book" ? "Order Book" : "Trade"}
          </button>
        ))}
      </div>

      {/* ── Mobile layout ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col">
        {mobileTab === "chart" && (
          <div className="h-72 sm:h-80" style={{ background: "#0c1324", borderBottom: "1px solid #2e3447" }}>
            <PriceChart symbol={symbol} />
          </div>
        )}
        {mobileTab === "book" && <OrderBook symbol={symbol} />}
        {mobileTab === "form" && (
          <div style={{ background: "#0c1324" }}>
            <TradeForm symbol={symbol} livePrice={tickerData?.price ?? null} />
          </div>
        )}
      </div>

      {/* ── Desktop layout — 12-col grid ────────────────────────── */}
      <div className="hidden md:grid grid-cols-12 flex-1 min-h-0" style={{ background: "#0c1324", borderColor: "#2e3447" }}>

        {/* LEFT 9 cols: Chart + bottom panel */}
        <div className="col-span-9 flex flex-col" style={{ borderRight: "1px solid #2e3447" }}>

          {/* Chart */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 480, background: "#151b2d", borderBottom: "1px solid #2e3447" }}>
            <PriceChart symbol={symbol} />
          </div>

          {/* Bottom panel */}
          <div
            className="flex flex-col shrink-0"
            style={{ height: 220, background: "#151b2d" }}
          >
            {/* Tabs */}
            <div
              className="flex border-b shrink-0 px-6"
              style={{ background: "#151b2d", borderColor: "#2e3447" }}
            >
              {[
                { key: "trades"  as const, label: "Recent Trades" },
                { key: "history" as const, label: "Trade History" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setBottomTab(tab.key)}
                  className={`px-5 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
                    bottomTab === tab.key
                      ? "text-[#4edea3] border-b-2"
                      : "text-[#909097] hover:text-[#c6c6cd]"
                  }`}
                  style={bottomTab === tab.key ? { borderColor: "#4edea3" } : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto">
              {bottomTab === "trades" ? (
                <RecentTrades symbol={symbol} />
              ) : (
                <TradeHistoryPanel />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 3 cols: Trade form + Order book */}
        <div className="col-span-3 flex flex-col overflow-y-auto" style={{ background: "#0c1324" }}>
          <div style={{ background: "#151b2d", borderBottom: "1px solid #2e3447" }} className="shrink-0">
            <TradeForm symbol={symbol} livePrice={tickerData?.price ?? null} />
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background: "#151b2d" }}>
            <OrderBook symbol={symbol} />
          </div>
        </div>

      </div>
    </div>
  );
}

function TradeHistoryPanel() {
  const [trades, setTrades] = useState<
    Array<{
      symbol: string;
      type: string;
      usdAmount: string;
      coinAmount: string;
      price: string;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/trades")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.trades) setTrades(d.trades.slice(0, 30)); })
      .catch(() => {});
  }, []);

  if (trades.length === 0) {
    return (
      <p className="text-xs text-muted-foreground p-4">No trade history yet.</p>
    );
  }

  return (
    <table className="w-full text-left text-xs">
      <thead className="sticky top-0" style={{ background: "hsl(var(--card))" }}>
        <tr
          className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b border-border"
        >
          <th className="px-4 py-2">Pair</th>
          <th className="px-4 py-2">Side</th>
          <th className="px-4 py-2 text-right">Price</th>
          <th className="px-4 py-2 text-right">Amount</th>
          <th className="px-4 py-2 text-right hidden lg:table-cell">Total</th>
          <th className="px-4 py-2 text-right hidden xl:table-cell">Time</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t, i) => {
          const priceFmt = parseFloat(t.price).toLocaleString("en-US", {
            maximumFractionDigits: 6,
          });
          const timeFmt = new Date(t.createdAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <tr
              key={i}
              className="border-b border-border/40 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-2 font-bold">
                {t.symbol.replace("USDT", "/USDT")}
              </td>
              <td className="px-4 py-2">
                <span
                  className="font-bold text-[10px] uppercase"
                  style={{ color: t.type === "BUY" ? "#4edea3" : "#ffb3ad" }}
                >
                  {t.type}
                </span>
              </td>
              <td className="px-4 py-2 text-right font-mono">${priceFmt}</td>
              <td className="px-4 py-2 text-right font-mono">
                {parseFloat(t.coinAmount).toFixed(6)}
              </td>
              <td className="px-4 py-2 text-right font-mono hidden lg:table-cell">
                ${parseFloat(t.usdAmount).toFixed(2)}
              </td>
              <td className="px-4 py-2 text-right text-muted-foreground hidden xl:table-cell">
                {timeFmt}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
