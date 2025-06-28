import { BinanceTrade } from "@/app/types/coin";
import { DataTable } from "@/app/components/table";
import { columns } from "./columns";
import { use } from "react";


type Props = {
  params: Promise<{ symbol: string }>;
};

export default function Home({ params }: Props) {
  const { symbol } = use(params);

  const coins: BinanceTrade[] = [
    {
      eventType: "trade",
      eventTime: 1719594551512,
      symbol: "BTCUSDT",
      tradeId: 123456789,
      price: "30000.00",
      quantity: "0.005",
      buyerOrderId: 111111,
      sellerOrderId: 222222,
      tradeTime: 1719594551501,
      isBuyerMarketMaker: true,
      ignore: true,
    },
    {
      eventType: "trade",
      eventTime: 1719594560000,
      symbol: "ETHUSDT",
      tradeId: 987654321,
      price: "2000.00",
      quantity: "0.1",
      buyerOrderId: 333333,
      sellerOrderId: 444444,
      tradeTime: 1719594559990,
      isBuyerMarketMaker: false,
      ignore: true,
    },
    {
      eventType: "trade",
      eventTime: 1719594571234,
      symbol: "BNBUSDT",
      tradeId: 192837465,
      price: "300.00",
      quantity: "2",
      buyerOrderId: 555555,
      sellerOrderId: 666666,
      tradeTime: 1719594571200,
      isBuyerMarketMaker: true,
      ignore: true,
    },
  ];


  return (
    <div className="flex flex-col gap-20">
      <h1 className="text-4xl font-bold">Market Exchange {symbol}</h1>
      <div>
        <DataTable data={coins} columns={columns}/>
      </div>
    </div>
  );
}
