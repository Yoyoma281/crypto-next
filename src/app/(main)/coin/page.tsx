
import { LocalApiAxios } from "@/lib/axios";
import { columns } from "./coinColumns";
import { Coin } from "@/app/types/coin";
import NewsCard from "@/app/components/newsCard";
import { DataTable } from "@/app/components/table";

export default async function Home() {
  // LocalApiAxios('/')
  //   .then((res) => console.log(res))

  // const coins: CoinTableRow[] = [
  //   {
  //     symbol: "BTCUSDT",
  //     lastPrice: "30000.00",
  //     priceChange: "-150.00",
  //     priceChangePercent: "-0.50",
  //     weightedAvgPrice: "30100.00",
  //     prevClosePrice: "30150.00",
  //   },
  //   {
  //     symbol: "ETHUSDT",
  //     lastPrice: "2000.00",
  //     priceChange: "25.00",
  //     priceChangePercent: "1.27",
  //     weightedAvgPrice: "1987.00",
  //     prevClosePrice: "1975.00",
  //   },
  //   {
  //     symbol: "BNBUSDT",
  //     lastPrice: "300.00",
  //     priceChange: "-2.00",
  //     priceChangePercent: "-0.66",
  //     weightedAvgPrice: "301.00",
  //     prevClosePrice: "302.00",
  //   },
  //   {
  //     symbol: "ADAUSDT",
  //     lastPrice: "1.10",
  //     priceChange: "0.02",
  //     priceChangePercent: "1.85",
  //     weightedAvgPrice: "1.08",
  //     prevClosePrice: "1.08",
  //   },
  //   {
  //     symbol: "XRPUSDT",
  //     lastPrice: "0.70",
  //     priceChange: "-0.01",
  //     priceChangePercent: "-1.41",
  //     weightedAvgPrice: "0.71",
  //     prevClosePrice: "0.71",
  //   },
  //   {
  //     symbol: "SOLUSDT",
  //     lastPrice: "35.00",
  //     priceChange: "0.50",
  //     priceChangePercent: "1.45",
  //     weightedAvgPrice: "34.50",
  //     prevClosePrice: "34.50",
  //   },
  //   {
  //     symbol: "DOGEUSDT",
  //     lastPrice: "0.06",
  //     priceChange: "0.002",
  //     priceChangePercent: "3.45",
  //     weightedAvgPrice: "0.058",
  //     prevClosePrice: "0.058",
  //   },
  //   {
  //     symbol: "DOTUSDT",
  //     lastPrice: "6.50",
  //     priceChange: "-0.10",
  //     priceChangePercent: "-1.52",
  //     weightedAvgPrice: "6.60",
  //     prevClosePrice: "6.60",
  //   },
  //   {
  //     symbol: "AVAXUSDT",
  //     lastPrice: "18.00",
  //     priceChange: "0.20",
  //     priceChangePercent: "1.12",
  //     weightedAvgPrice: "17.80",
  //     prevClosePrice: "17.80",
  //   },
  //   {
  //     symbol: "MATICUSDT",
  //     lastPrice: "1.20",
  //     priceChange: "0.01",
  //     priceChangePercent: "0.84",
  //     weightedAvgPrice: "1.19",
  //     prevClosePrice: "1.19",
  //   },
  //   {
  //     symbol: "LTCUSDT",
  //     lastPrice: "100.00",
  //     priceChange: "-1.00",
  //     priceChangePercent: "-0.99",
  //     weightedAvgPrice: "101.00",
  //     prevClosePrice: "101.00",
  //   },
  //   {
  //     symbol: "LINKUSDT",
  //     lastPrice: "7.50",
  //     priceChange: "0.05",
  //     priceChangePercent: "0.67",
  //     weightedAvgPrice: "7.45",
  //     prevClosePrice: "7.45",
  //   },
  //   {
  //     symbol: "UNIUSDT",
  //     lastPrice: "6.00",
  //     priceChange: "-0.08",
  //     priceChangePercent: "-1.32",
  //     weightedAvgPrice: "6.08",
  //     prevClosePrice: "6.08",
  //   }
  // ];
  const coins: Coin[] = await LocalApiAxios('/coin');

  return (
  <div className="flex flex-col gap-4">
      <div className="flex justify-center gap-28">
        <NewsCard
          title="Bitcoin Surges Past $30,000"
          description="Bitcoin jumped above $30,000 today amid increasing institutional interest..."
          url=""
          source="CoinDesk"
          publishedAt="2025-05-21T12:34:00Z"
          image=""
        />  
        <NewsCard
          title="Bitcoin Surges Past $30,000"
          description="Bitcoin jumped above $30,000 today amid increasing institutional interest..."
          url=""
          source="CoinDesk"
          publishedAt="2025-05-21T12:34:00Z"
          image=""

        />
        <NewsCard
          title="Bitcoin Surges Past $30,000"
          description="Bitcoin jumped above $30,000 today amid increasing institutional interest..."
          url=""
          source="CoinDesk"
          publishedAt="2025-05-21T12:34:00Z"
          image=""

        />
      </div>
      <div>
        <DataTable data={coins} columns={columns} params="symbol" />
      </div>
    </div>
  );
}
