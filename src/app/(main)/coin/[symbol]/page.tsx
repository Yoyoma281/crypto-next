"use client";

import { use, useEffect, useState } from "react";
import { PriceLineChart } from "@/app/components/priceChart";
import { LocalApiAxios } from "@/lib/axios";
import { BinanceKline } from "@/app/types";
// import NewsCard from "@/app/components/newsCard";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Router from "next/navigation";

type Props = {
  params: Promise<{ symbol: string }>;
};

export type ApiResponse = {
  data: [];
};

export default function Page({ params }: Props) {
  const { symbol } = use(params);
  const [chartData, setChartData] = useState<BinanceKline[]>([]);
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, BinanceKline[]>>({});
  const intervalOptions = ["1m", "5m", "15m", "1h", "1d"];
  const router = Router.useRouter();

  useEffect(() => {
    if (cache[selectedInterval]) {
      setChartData(cache[selectedInterval]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    LocalApiAxios.get(`/coin/${symbol}?interval=${selectedInterval}`)
      .then((res) => {
        const response = res as ApiResponse;
        setChartData(response.data);
        setLoading(false);
        setCache((prevCache) => ({
          ...prevCache,
          [selectedInterval]: response.data,
        }));
      })
      .catch((err) => {
        setError(err.message || "Error fetching data");
        setLoading(false);
      });
  }, [symbol, selectedInterval, cache]);

  const RedirectExchange = () => {
    router.push(`/Exchange/${symbol}`);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div className="flex flex-row w-full gap-4 h-[32rem]"> {/* Parent has fixed height */}
        <Card className="h-full w-[80rem] p-4 flex flex-col justify-between">
          <div className="flex gap-3 text-xl font-semibold mb-4">
            <Image
              src={`../Coin-icons/${(symbol).replace("USDT", "").toLowerCase()}.svg`}
              alt={symbol}
              width={30}
              height={30}
            />
            {symbol} Overview
          </div>
          <div>
            Bitcoin is the first and most widely used cryptocurrency, designed as a decentralized digital currency. It enables peer-to-peer transactions
            on a secure, transparent blockchain network and is often seen as a hedge against inflation and a store of value.
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={RedirectExchange} className="font-mono">Exchange</Button>
            <Button className="font-mono">Add to portfolio</Button>
    
          </div>

          {chartData.length > 0 ? (() => {
            const openPrice = parseFloat(chartData[0][1]);
            const closePrice = parseFloat(chartData[chartData.length - 1][4]);
            const priceChange = closePrice - openPrice;
            const priceChangePercent = (priceChange / openPrice) * 100;
            const priceWentDown = priceChange < 0;



            return (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span>{symbol}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Price:</span>
                  <span>{closePrice.toFixed(6)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Change (Interval):</span>
                  <span className={priceWentDown ? "text-red-600" : "text-green-600"}>
                    {priceChange.toFixed(2)}$({priceChangePercent.toFixed(2)}%)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Highest Price:</span>
                  <span>{Math.max(...chartData.map(d => parseFloat(d[2]))).toFixed(6)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lowest Price:</span>
                  <span>{Math.min(...chartData.map(d => parseFloat(d[3]))).toFixed(6)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume:</span>
                  <span>{parseFloat(chartData[chartData.length - 1][5]).toFixed(2)}</span>
                </div>
              </div>
            );
          })() : (
            <p>Loading data...</p>
          )}
        </Card>

        <PriceLineChart
          coinName={symbol}
          loading={loading}
          data={chartData}
          xIndex={0}
          yIndex={1}
          intervalOptions={intervalOptions}
          selectedInterval={selectedInterval}
          onIntervalChange={setSelectedInterval}
          className="h-full w-full"
        />
      </div>

    </div>
  );
}
