// src/app/(main)/coin/[symbol]/page.tsx

import { InternalApiFetch } from "@/app/api/ApiFetch";
import CoinOverviewClient from "./components/chart/chart";
import { BinanceKline } from "@/app/types";

type PageProps = {
  params: Promise<{
    symbol: string;
  }>;
  searchParams?: Promise<{
    interval?: string;
  }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { symbol } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const interval = resolvedSearchParams?.interval ?? "1m";

  console.log("SYMBOOOL:", symbol);

  const res = (await InternalApiFetch.get(
    `/coin/${symbol}?interval=${interval}`,
  )) as { data: BinanceKline[] };

  return (
    <CoinOverviewClient
      symbol={symbol}
      interval={interval}
      chartData={res.data}
    />
  );
}
