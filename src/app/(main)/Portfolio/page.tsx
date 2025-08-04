'use client';

import { DataTable } from "@/app/components/table";
import { Portfolio } from "@/app/types/coin";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { fetchPortfolio } from "@/app/data/services";

import React, { useEffect, useState } from "react";

export default function Page() {
    const [portfolioCoins, setPortfolioCoins] = useState<Portfolio | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPortfolio()
            .then((res) => {
                setPortfolioCoins(res);
            })
            .catch((error) => {
                console.error("Error fetching portfolio:", error);
                setError("Failed to fetch portfolio.");
            });
    }, []);

    return (
        <>
            <div className="flex flex-col gap-10 items-start h-screen">
                <h1 className="text-4xl font-bold">My portfolio</h1>
                <Button className="font-mono">Add Coin</Button>
                {error && <div className="text-red-500">{error}</div>}
                {portfolioCoins ? (
                    <DataTable data={portfolioCoins.Coins} columns={columns} params="symbol" />
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </>
    );
}
