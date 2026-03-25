/**
 * Server-side data fetching functions used by Server Components.
 * All backend calls go through `backendFetch` so cookie forwarding
 * and the base URL are handled in one place.
 */

import { backendFetch } from "@/lib/api/backend";
import { Coin, Portfolio, User } from "@/app/types/coin";

export async function fetchUser(): Promise<User> {
  const res = await backendFetch("GET", "/GetUserInfo");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

/** Returns null instead of throwing — safe to use as an auth check */
export async function fetchUserSafe(): Promise<User | null> {
  try {
    const res = await backendFetch("GET", "/GetUserInfo");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchPortfolio(): Promise<Portfolio> {
  const res = await backendFetch("GET", "/Portfolio");
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

export async function fetchCoins(): Promise<Coin[]> {
  const res = await backendFetch("GET", "/coin");
  if (!res.ok) throw new Error("Failed to fetch coins");
  return res.json();
}

export type CostBasisEntry = {
  avgBuyPrice: number;
  totalCost: number;
  totalQty: number;
};

export async function fetchPortfolioAnalytics(): Promise<{ costBasis: Record<string, CostBasisEntry> }> {
  const res = await backendFetch("GET", "/portfolio/analytics");
  if (!res.ok) return { costBasis: {} };
  return res.json();
}

export async function fetchTradeHistory(): Promise<{ trades: TradeRecord[] }> {
  const res = await backendFetch("GET", "/trades");
  if (!res.ok) return { trades: [] };
  return res.json();
}

export async function fetchLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  try {
    const res = await backendFetch("GET", "/leaderboard");
    if (!res.ok) return { leaderboard: [] };
    return res.json();
  } catch {
    return { leaderboard: [] };
  }
}

export type TradeRecord = {
  _id: string;
  symbol: string;
  type: "BUY" | "SELL";
  usdAmount: string;
  coinAmount: string;
  price: string;
  createdAt: string;
};

export type LeaderboardEntry = {
  username: string;
  totalValue: number;
};
