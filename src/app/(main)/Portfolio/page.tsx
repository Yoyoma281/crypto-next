import { DataTable } from "@/app/components/table";
import { CoinPortfolioData } from "@/app/types/coin";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";

export default function Page() {
    const coins: CoinPortfolioData[] = [
        {
            symbol: 'BTC',
            amount: 5,
            lastPrice: 65000,
            totalValue: 0.5 * 65000,
            change: 500,
            changePercent: (500 / (65000 - 500)) * 100,
            priceChange: 500,
        }
    ]

    return (
        <>
            <div className="flex flex-col gap-10 items-start h-screen">
                <h1 className="text-4xl font-bold">My portfolio</h1>
                <Button className="font-mono">Add Coin</Button>
                <DataTable data={coins} columns={columns} params="symbol" />
            </div>

        </>
    );

}
