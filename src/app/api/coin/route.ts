import { NextResponse } from 'next/server';
import axios from 'axios';
import { Coin } from '@/app/types/coin';

export async function GET(
  req: Request,
  context: { params?: { symbol?: string } } // params is optional
) {
  const symbol = context?.params?.symbol;
  try {
    if (symbol) {
      const res = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr`,
        {
          params: { symbol: symbol.toUpperCase() },
        }
      );

      const data = res.data;
      if (!data) {
        return NextResponse.json({ error: 'No data found' }, { status: 404 });
      }

      return NextResponse.json(data as Coin, { status: 200 });
    } else {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`);
      const allCoins = res.data as Coin[];

      // Sort by quoteVolume descending and take top 10
      const topCoins = allCoins
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 10);

      return NextResponse.json(topCoins, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching data from Binance API:', error);

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json({ error: error.response.data }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
