// app/.../[symbol]/page.tsx
import { InternalApiFetch } from "@/app/api/ApiFetch";
import CoinOverviewClient from "./components/chart/chart";
import { BinanceKline } from "@/app/types";

export default async function Page({
  params,
  searchParams,
}: {
  params: { symbol: string };
  searchParams?: { interval?: string };
}) {
  const symbol = params.symbol;
  const interval = searchParams?.interval ?? "1m";
  console.log("SYMBOOOL: ", symbol);

  const res = await InternalApiFetch.get(
    `/coin/${symbol}?interval=${interval}`
  ) as { data: BinanceKline[] };

  return (
    <CoinOverviewClient
      symbol={symbol}
      interval={interval}
      chartData={res.data}
    />
  );
}
