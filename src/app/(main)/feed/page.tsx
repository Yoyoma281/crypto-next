"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";

interface FeedTrade {
  _id: string;
  userId: string;
  username: string;
  avatar: string | null;
  symbol: string;
  type: "BUY" | "SELL";
  usdAmount: string;
  price: string;
  createdAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getInitialsColor(username: string): string {
  const colors = ["#4edea3", "#8ccdff", "#f5c842", "#ffb3ad", "#a78bfa"];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getAvatarSrc(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("/uploads/")) return `${BASE_URL}${avatar}`;
  return avatar;
}

function formatSymbol(symbol: string): string {
  return symbol.replace(/USDT$/, "") + "/USDT";
}

function formatUSD(n: string): string {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPrice(n: string): string {
  const num = Number(n);
  if (num >= 1000) return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (num >= 1) return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

function AvatarCircle({ username, avatar }: { username: string; avatar: string | null }) {
  const src = getAvatarSrc(avatar);
  const color = getInitialsColor(username);
  const initials = username.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid #2e3447",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: 900,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function FeedCard({ trade }: { trade: FeedTrade }) {
  return (
    <div
      style={{
        background: "#191f31",
        border: "1px solid #2e3447",
        borderRadius: "10px",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Avatar + username */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: "0 0 auto" }}>
        <Link href={`/u/${encodeURIComponent(trade.username)}`}>
          <AvatarCircle username={trade.username} avatar={trade.avatar} />
        </Link>
        <Link
          href={`/u/${encodeURIComponent(trade.username)}`}
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#dce1fb",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#8ccdff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#dce1fb"; }}
        >
          {trade.username}
        </Link>
      </div>

      {/* Trade info */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, flexWrap: "wrap", minWidth: 0 }}>
        <span
          style={{
            background: trade.type === "BUY" ? "rgba(78,222,163,0.15)" : "rgba(255,179,173,0.15)",
            color: trade.type === "BUY" ? "#4edea3" : "#ffb3ad",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {trade.type}
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 800,
            color: "#dce1fb",
            fontFamily: "monospace",
          }}
        >
          {formatSymbol(trade.symbol)}
        </span>
        <span style={{ fontSize: "13px", color: "#dce1fb", fontFamily: "monospace" }}>
          {formatUSD(trade.usdAmount)} USDT
        </span>
        <span style={{ fontSize: "12px", color: "#909097", fontFamily: "monospace" }}>
          @ {formatPrice(trade.price)}
        </span>
      </div>

      {/* Time ago */}
      <div
        style={{
          fontSize: "11px",
          color: "#909097",
          whiteSpace: "nowrap",
          flex: "0 0 auto",
        }}
      >
        {timeAgo(trade.createdAt)}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [trades, setTrades] = useState<FeedTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/feed", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setTrades(Array.isArray(data) ? data : data.trades ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ color: "#dce1fb", maxWidth: "720px", margin: "0 auto" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <Radio size={22} style={{ color: "#8ccdff" }} />
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "#dce1fb",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Activity Feed
        </h1>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "#191f31",
                border: "1px solid #2e3447",
                borderRadius: "10px",
                height: "62px",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          style={{
            background: "#191f31",
            border: "1px solid #2e3447",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
            color: "#909097",
            fontSize: "14px",
          }}
        >
          Failed to load feed. Please try again.
        </div>
      ) : trades.length === 0 ? (
        <div
          style={{
            background: "#191f31",
            border: "1px solid #2e3447",
            borderRadius: "12px",
            padding: "64px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Radio size={40} style={{ color: "#2e3447" }} />
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#dce1fb" }}>
            Nothing here yet
          </div>
          <div style={{ fontSize: "13px", color: "#909097" }}>
            Follow traders to see their activity here
          </div>
          <Link
            href="/leaderboard"
            style={{
              marginTop: "8px",
              padding: "8px 20px",
              border: "1px solid #4edea3",
              color: "#4edea3",
              background: "rgba(78,222,163,0.08)",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(78,222,163,0.16)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(78,222,163,0.08)"; }}
          >
            Find Traders
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {trades.map((trade) => (
            <FeedCard key={trade._id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}
