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
