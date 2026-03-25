"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import OrderBook from "./OrderBook";
import RecentTrades from "./RecentTrades";
import TradeForm from "./TradeForm";
import Image from "next/image";

const ICON_SRCS = (ticker: string) => [
  `/Coin-icons/${ticker.toLowerCase()}.svg`,
  `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`,
  `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/${ticker.toLowerCase()}.png`,
];

function CoinIcon({ ticker }: { ticker: string }) {
  const [stage, setStage] = useState(0);
  const srcs = ICON_SRCS(ticker);
  if (stage >= srcs.length) {
    return (
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
        style={{ background: `hsl(${(ticker.charCodeAt(0) * 47) % 360}, 55%, 45%)` }}
      >
        {ticker[0]}
      </div>
    );
  }
  return (
    <Image
      key={srcs[stage]}
      src={srcs[stage]}
      alt={ticker}
      width={28}
      height={28}
      className="rounded-full shrink-0"
      onError={() => setStage((s) => s + 1)}
      unoptimized
    />
  );
}

const PriceChart = dynamic(() => import("./PriceChart"), { ssr: false });

interface Ticker {
  price: string;
  change: string;
  changePct: string;
  high: string;
  low: string;
  volume: string;
}


export default function TradingClient({
  symbol,
}: {
  symbol: string;
  hiddenHeader?: boolean;
}) {
  const ticker = symbol.replace("USDT", "");

  const [tickerData, setTickerData] = useState<Ticker | null>(null);
  const [bottomTab, setBottomTab] = useState<"orders" | "history">("orders");
  const [mobileTab, setMobileTab] = useState<"chart" | "book" | "form">("chart");
  const [holding, setHolding] = useState<{ amount: string; worth: string } | null>(null);
  const lastRef = useRef<Partial<Ticker>>({});

  // Gate.io WebSocket for ticker
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

  // Portfolio holding fetch
  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const coins: Array<{ symbol: string; amount: string; CurrentWorth: string }> =
          d?.portfolio?.Coins ?? [];
        const coin = coins.find((c) => c.symbol === symbol);
        if (coin) setHolding({ amount: coin.amount, worth: coin.CurrentWorth });
      })
      .catch(() => {});
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
    <div className="flex flex-col h-screen overflow-hidden bg-[#0c1324]">

      {/* ── A. Top bar ─────────────────────────────────────────────────────── */}
      <header className="h-12 bg-[#0b1222] border-b border-[#2e3447] flex items-center px-4 shrink-0 z-10">
        {/* Icon + pair name */}
        <div className="flex items-center gap-2 shrink-0">
          <CoinIcon ticker={ticker} />
          <div className="flex flex-col leading-none">
            <span className="text-[#dce1fb] font-black text-sm font-[family-name:var(--font-manrope)] tracking-tight">
              {ticker}<span className="text-[#909097] font-medium">/USDT</span>
            </span>
            <span className="text-[9px] text-[#909097] mt-0.5">{ticker} Price</span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#2e3447] mx-4" />

        {/* Big price */}
        <div className="flex flex-col leading-none shrink-0">
          <span
            className="text-base font-black tabular-nums font-[family-name:var(--font-manrope)]"
            style={{ color: changeColor }}
          >
            {tickerData ? fmtPrice(tickerData.price) : "—"}
          </span>
          <span className="text-[9px] text-[#909097] mt-0.5 tabular-nums font-mono">
            {tickerData ? `$${fmtPrice(tickerData.price)}` : "—"}
          </span>
        </div>

        <div className="h-6 w-px bg-[#2e3447] mx-4 hidden md:block" />

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-[#909097] mb-0.5">24h Chg</span>
            <span className="text-[11px] font-bold tabular-nums font-mono" style={{ color: changeColor }}>
              {tickerData ? `${isUp ? "+" : ""}${parseFloat(tickerData.changePct).toFixed(2)}%` : "—"}
            </span>
          </div>
          {tickerData && (
            <>
              <div className="hidden lg:flex flex-col leading-none">
                <span className="text-[9px] text-[#909097] mb-0.5">24h High</span>
                <span className="text-[11px] text-[#dce1fb] font-mono tabular-nums">{fmtPrice(tickerData.high)}</span>
              </div>
              <div className="hidden lg:flex flex-col leading-none">
                <span className="text-[9px] text-[#909097] mb-0.5">24h Low</span>
                <span className="text-[11px] text-[#dce1fb] font-mono tabular-nums">{fmtPrice(tickerData.low)}</span>
              </div>
              <div className="hidden xl:flex flex-col leading-none">
                <span className="text-[9px] text-[#909097] mb-0.5">24h Vol</span>
                <span className="text-[11px] text-[#4edea3] font-mono tabular-nums">{fmtVol(tickerData.volume)}</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Mobile tab bar ─────────────────────────────────────────────────── */}
      <div className="md:hidden flex border-b border-[#2e3447] shrink-0 bg-[#0b1222]">
        {(["chart", "book", "form"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 text-[11px] font-bold transition-colors uppercase tracking-wider ${
              mobileTab === tab
                ? "text-[#4edea3] border-b-2 border-[#4edea3]"
                : "text-[#909097] hover:text-[#dce1fb]"
            }`}
          >
            {tab === "chart" ? "Chart" : tab === "book" ? "Book" : "Trade"}
          </button>
        ))}
      </div>

      {/* ── Mobile layout ──────────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        {mobileTab === "chart" && (
          <div className="flex-1 bg-[#070d1f]">
            <PriceChart symbol={symbol} />
          </div>
        )}
        {mobileTab === "book" && (
          <div className="flex-1 overflow-hidden">
            <OrderBook symbol={symbol} />
          </div>
        )}
        {mobileTab === "form" && (
          <div className="flex-1 overflow-y-auto bg-[#0b1222]">
            {holding && parseFloat(holding.amount) > 0 && (
              <div className="px-4 py-2 text-[10px] border-b border-[#2e3447] bg-[#191f31]">
                <span className="text-[#909097]">Your {ticker}: </span>
                <span className="font-bold text-[#dce1fb]">
                  {parseFloat(holding.amount).toFixed(6)}
                </span>
                <span className="text-[#909097]"> ~ ${parseFloat(holding.worth).toFixed(2)}</span>
              </div>
            )}
            <TradeForm symbol={symbol} livePrice={tickerData?.price ?? null} />
          </div>
        )}
      </div>

      {/* ── B. Desktop body ────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 overflow-hidden">

{/* B2. Main workspace — 12-col grid */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">

          {/* LEFT col-span-2: Order Book */}
          <div className="col-span-2 flex flex-col bg-[#0c1324] border-r border-[#2e3447] overflow-hidden">
            <div className="h-9 px-3 flex items-center border-b border-[#2e3447] shrink-0">
              <span className="text-[10px] font-bold text-[#909097] uppercase tracking-widest">
                Order Book
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <OrderBook symbol={symbol} />
            </div>
          </div>

          {/* CENTER col-span-7: Chart + bottom panel */}
          <div className="col-span-7 flex flex-col bg-[#070d1f] border-r border-[#2e3447] overflow-hidden">

            {/* Chart area */}
            <div className="flex-1 overflow-hidden">
              <PriceChart symbol={symbol} />
            </div>

            {/* Bottom panel */}
            <div className="h-56 border-t border-[#2e3447] bg-[#0b1222] flex flex-col shrink-0">
              {/* Tab bar */}
              <div className="flex items-center gap-6 px-4 border-b border-[#2e3447] h-9 bg-[#0b1222] shrink-0">
                {[
                  { key: "orders"  as const, label: "Open Orders"   },
                  { key: "history" as const, label: "Trade History" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setBottomTab(tab.key)}
                    className={`h-full text-[11px] font-bold transition-colors whitespace-nowrap ${
                      bottomTab === tab.key
                        ? "text-[#4edea3] border-b-2 border-[#4edea3]"
                        : "text-[#909097] hover:text-[#dce1fb]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {bottomTab === "orders" ? (
                  <OpenOrdersPanel />
                ) : (
                  <TradeHistoryPanel symbol={symbol} />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT col-span-3: Recent trades + Trade form */}
          <div className="col-span-3 flex flex-col bg-[#0b1222] overflow-hidden">

            {/* Top: Recent trades */}
            <div className="border-b border-[#2e3447] shrink-0 overflow-hidden flex flex-col" style={{ height: "25%" }}>
              <div className="px-3 py-2 border-b border-[#2e3447] shrink-0">
                <span className="text-[10px] font-bold text-[#909097] uppercase tracking-widest">
                  Market Trades
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <RecentTrades symbol={symbol} />
              </div>
            </div>

            {/* Bottom: Trade form */}
            <div className="flex-1 overflow-y-auto">
              {holding && parseFloat(holding.amount) > 0 && (
                <div className="px-4 pt-3 pb-0 text-[10px]">
                  <div className="bg-[#191f31] border border-[#2e3447] px-3 py-2 flex items-center justify-between">
                    <span className="text-[#909097]">Your {ticker}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#dce1fb]">
                        {parseFloat(holding.amount).toFixed(6)}
                      </span>
                      <span className="text-[#45464d]">~</span>
                      <span className="font-mono text-[#4edea3]">
                        ${parseFloat(holding.worth).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <TradeForm symbol={symbol} livePrice={tickerData?.price ?? null} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Open Orders panel ──────────────────────────────────────────────────────────
function OpenOrdersPanel() {
  const [orders, setOrders] = useState<
    Array<{
      _id: string;
      symbol: string;
      type: string;
      orderType: string;
      triggerPrice: string;
      paymentAmount: string;
      createdAt: string;
    }>
  >([]);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.orders) setOrders(d.orders); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 15000);
    return () => clearInterval(id);
  }, []);

  const cancelOrder = async (orderId: string) => {
    setCancelling(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) fetchOrders();
    } catch {
      // silent
    }
    setCancelling(null);
  };

  const ORDER_TYPE_LABELS: Record<string, string> = {
    LIMIT:        "Limit",
    STOP_LOSS:    "Stop Loss",
    TAKE_PROFIT:  "Take Profit",
  };

  if (orders.length === 0) {
    return (
      <p className="text-[10px] p-4 text-[#909097]">No open orders.</p>
    );
  }

  return (
    <table className="w-full text-left">
      <thead className="sticky top-0 bg-[#0b1222]">
        <tr className="text-[9px] uppercase tracking-widest font-bold border-b border-[#2e3447] text-[#909097]">
          <th className="px-3 py-2">Type</th>
          <th className="px-3 py-2">Pair</th>
          <th className="px-3 py-2 text-right">Trigger</th>
          <th className="px-3 py-2 text-right">Amount</th>
          <th className="px-3 py-2 text-right hidden xl:table-cell">Placed</th>
          <th className="px-3 py-2 text-center">Cancel</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => {
          const triggerFmt = parseFloat(o.triggerPrice).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          });
          const amountFmt = parseFloat(o.paymentAmount).toFixed(2);
          const timeFmt = new Date(o.createdAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });
          const isCancelling = cancelling === o._id;
          return (
            <tr
              key={o._id}
              className="border-b border-[#2e3447]/60 hover:bg-[#191f31] transition-colors"
            >
              <td className="px-3 py-1.5">
                <div className="flex flex-col gap-0.5">
                  <span
                    className="font-bold text-[10px] uppercase"
                    style={{ color: o.type === "BUY" ? "#4edea3" : "#ffb3ad" }}
                  >
                    {o.type}
                  </span>
                  <span className="text-[9px] text-[#909097]">
                    {ORDER_TYPE_LABELS[o.orderType] ?? o.orderType}
                  </span>
                </div>
              </td>
              <td className="px-3 py-1.5 text-[10px] font-bold text-[#dce1fb]">
                {o.symbol.replace("USDT", "/USDT")}
              </td>
              <td className="px-3 py-1.5 text-right font-mono text-[10px] text-[#dce1fb]">
                ${triggerFmt}
              </td>
              <td className="px-3 py-1.5 text-right font-mono text-[10px] text-[#dce1fb]">
                ${amountFmt}
              </td>
              <td className="px-3 py-1.5 text-right text-[10px] text-[#909097] hidden xl:table-cell">
                {timeFmt}
              </td>
              <td className="px-3 py-1.5 text-center">
                <button
                  onClick={() => cancelOrder(o._id)}
                  disabled={isCancelling}
                  className="px-2.5 py-1 rounded-none text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-40 border border-[#ffb3ad]/35 bg-[#ffb3ad]/10 text-[#ffb3ad] hover:bg-[#ffb3ad]/20"
                >
                  {isCancelling ? "..." : "Cancel"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Trade History panel ────────────────────────────────────────────────────────
function TradeHistoryPanel({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<
    Array<{ symbol: string; type: string; usdAmount: string; coinAmount: string; price: string; createdAt: string }>
  >([]);
  const [sideFilter, setSideFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    setPage(1);
  }, [symbol, sideFilter]);

  useEffect(() => {
    const params = new URLSearchParams({ symbol, page: String(page), limit: String(LIMIT) });
    if (sideFilter !== "ALL") params.set("type", sideFilter);
    fetch(`/api/trades?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.trades) {
          setTrades(d.trades);
          setPages(d.pages ?? 1);
        }
      })
      .catch(() => {});
  }, [symbol, sideFilter, page]);

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#2e3447] shrink-0">
        {(["ALL", "BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSideFilter(s)}
            className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors"
            style={{
              color: sideFilter === s ? (s === "BUY" ? "#4edea3" : s === "SELL" ? "#ffb3ad" : "#dce1fb") : "#909097",
              borderBottom: sideFilter === s ? `1px solid ${s === "BUY" ? "#4edea3" : s === "SELL" ? "#ffb3ad" : "#dce1fb"}` : "1px solid transparent",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {trades.length === 0 ? (
          <p className="text-[10px] p-4 text-[#909097]">No trades found.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0b1222]">
              <tr className="text-[9px] uppercase tracking-widest font-bold border-b border-[#2e3447] text-[#909097]">
                <th className="px-3 py-2">Side</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right hidden lg:table-cell">Total</th>
                <th className="px-3 py-2 text-right hidden xl:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((tr, i) => {
                const priceFmt = parseFloat(tr.price).toLocaleString("en-US", { maximumFractionDigits: 6 });
                const timeFmt = new Date(tr.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                return (
                  <tr key={i} className="border-b border-[#2e3447]/60 hover:bg-[#191f31] transition-colors">
                    <td className="px-3 py-1.5">
                      <span className="font-bold text-[10px] uppercase" style={{ color: tr.type === "BUY" ? "#4edea3" : "#ffb3ad" }}>
                        {tr.type}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-[10px] text-[#dce1fb]">${priceFmt}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-[10px] text-[#dce1fb]">{parseFloat(tr.coinAmount).toFixed(6)}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-[10px] text-[#dce1fb] hidden lg:table-cell">${parseFloat(tr.usdAmount).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right text-[10px] text-[#909097] hidden xl:table-cell">{timeFmt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#2e3447] shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[9px] font-black uppercase tracking-wider text-[#909097] hover:text-[#dce1fb] disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-[9px] text-[#909097] font-mono">{page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="text-[9px] font-black uppercase tracking-wider text-[#909097] hover:text-[#dce1fb] disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
