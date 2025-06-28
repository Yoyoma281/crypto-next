'use client';

import * as React from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
} from "@/components/ui/chart";
import { BinanceKline } from "../types";
import { formatPrice } from "@/lib/utils";

type PriceLineChartProps = {
    data: BinanceKline[]; // Replace [] with the actual expected type
    xIndex: number;
    yIndex: number;
    intervalOptions: string[];
    selectedInterval: string;
    onIntervalChange: (interval: string) => void;
    coinName?: string;
    loading?: boolean;
    className?: string;
};

const LOCAL_STORAGE_KEY = "priceLineChartData";

export function PriceLineChart({
    data,
    xIndex,
    yIndex,
    intervalOptions,
    selectedInterval,
    onIntervalChange,
    loading = false,
    className
}: PriceLineChartProps) {
    // cachedData state and localStorage logic (unchanged)
    const [cachedData, setCachedData] = React.useState<{ x: number; y: string }[]>([]);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                try {
                    setCachedData(JSON.parse(stored));
                } catch {
                    setCachedData([]);
                }
            }
        }
    }, []);

    React.useEffect(() => {
        if (!data || data.length === 0) {
            setCachedData([]);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return;
        }
        const transformed = data.map((item) => ({
            x: Number(item[xIndex]), // instead of String
            y: String(item[yIndex]),
        }));


        setCachedData(transformed);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transformed));
    }, [data, xIndex, yIndex]);

    // Calculate price change using original BinanceKline data (open of first, close of last)
    let priceChangeInfo = null;
    if (data.length > 1) {
        const firstOpen = Number(data[0][1]); // open price of first candle
        const lastClose = Number(data[data.length - 1][4]); // close price of last candle

        const priceChange = lastClose - firstOpen;
        const percentageChange = (priceChange / firstOpen) * 100;
        const isPositive = priceChange >= 0;

        priceChangeInfo = { priceChange, percentageChange, isPositive };
    }

    if (cachedData.length > 1) {
        return (
            <Card className={`${className}`}>
                <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                        <CardTitle className="flex gap-2">
                            {/* {coinName} Price Char */}
                            {!loading && priceChangeInfo && (
                                <span className={priceChangeInfo.isPositive ? "text-green-500" : "text-red-500"}>
                                    {priceChangeInfo.percentageChange.toFixed(2)}%
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription>Interval: {selectedInterval}</CardDescription>
                    </div>
                    <div className="flex">
                        {intervalOptions.map((option) => (
                            <button
                                key={option}
                                data-active={selectedInterval === option}
                                className="flex flex-col justify-center border-t px-6 py-4 text-sm even:border-l
                                        sm:border-l sm:border-t sm:px-4 sm:py-6
                                        data-[active=true]:bg-gray-100 data-[active=true]:text-gray-800"
                                onClick={() => onIntervalChange(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="px-2 sm:p-6">
                    {loading ? (
                        <div className="flex h-[250px] w-full items-center justify-center">
                            <span className="text-muted-foreground text-sm">Loading...</span>
                        </div>
                    ) : (
                        <ChartContainer
                            config={{
                                views: { label: "Price" },
                                desktop: { label: "Price", color: "hsl(var(--chart-1))" },
                            }}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <LineChart data={cachedData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="x"
                                    tickFormatter={(value) =>
                                        new Date(value).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                    }
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    domain={["auto", "auto"]}
                                    tickFormatter={(value) => formatPrice(value)}
                                />
                                <Tooltip
                                    labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
                                    formatter={(value: string | number) => {
                                        const num = typeof value === "string" ? parseFloat(value) : value;
                                        return [`$${num.toFixed(2)}`, "Price"];
                                    }}
                                />

                                <Line dataKey="y" type="monotone" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        );
    }

    return null;
}

