import { Coin, Portfolio, User } from "@/app/types/coin";
import { loginResponse } from "../types/login";
import { ExternalServerApiFetch, InternalApiFetch } from "../api/ApiFetch";

export async function Login(
  username: string,
  password: string
): Promise<{ token: string } | false> {
  try {
    const response = await InternalApiFetch.post<loginResponse>(`/login`, {
      username: username,
      password: password,
    });
    console.log("Login response:", response);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
}

export async function fetchUser(): Promise<User> {
  const res: User = await ExternalServerApiFetch.get<User>(`/GetUserInfo`);

  if (!res) throw new Error("Failed to fetch portfolio");
  console.log("User info fetched:", res);
  return res;
}

export async function fetchPortfolio(): Promise<Portfolio> {
  const res: Portfolio = await ExternalServerApiFetch.get<Portfolio>(
    `/Portfolio`
  );
  // console.log("Portfolio response:", res);

  if (!res) throw new Error("Failed to fetch portfolio");

  return res;
}

export async function fetchCoins(): Promise<Coin[]> {
  const res = await ExternalServerApiFetch.get<Coin[]>(`/coin`);
  if (!res) throw new Error("Failed to fetch coins");
  return res;
}
