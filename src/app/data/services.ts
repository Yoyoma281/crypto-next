import { Coin, Portfolio, User } from "@/app/types/coin";
import { ExternalServerApiFetch } from "../api/ApiFetch";

export async function login(username: string, password: string) {
  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return await res.json();
}

export async function fetchUser(): Promise<User> {
  const res: User = await ExternalServerApiFetch.get<User>(`/GetUserInfo`);

  if (!res) throw new Error("Failed to fetch user");
  console.log("User info fetched:", res);
  return res;
}

export async function fetchPortfolio(): Promise<Portfolio> {
  const res: Portfolio = await ExternalServerApiFetch.get<Portfolio>(
    `/Portfolio`
  );
  console.log("Portfolio response:", res);

  if (!res) throw new Error("Failed to fetch portfolio");

  return res;
}

export async function fetchCoins(): Promise<Coin[]> {
  const res = await ExternalServerApiFetch.get<Coin[]>(`/coin`);
  if (!res) throw new Error("Failed to fetch coins");
  return res;
}
