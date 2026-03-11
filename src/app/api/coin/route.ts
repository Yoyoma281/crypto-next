import { NextResponse } from "next/server";
import { getAllTickers } from "@/lib/api/binance";
import { Coin } from "@/app/types/coin";

export async function GET() {
  const tickers = await getAllTickers() as Coin[];

  const top = tickers
    .filter((c) => c.symbol.endsWith("USDT"))
    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
    .slice(0, 10);

  return NextResponse.json(top);
}
