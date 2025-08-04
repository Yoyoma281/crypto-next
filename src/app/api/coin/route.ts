import { NextResponse } from 'next/server';
import axios from 'axios';
import { Coin } from '@/app/types/coin';

export async function GET() {
  try {
    const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`);
    const allCoins = res.data as Coin[];

    const topCoins = allCoins
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 10);

    return NextResponse.json(topCoins, { status: 200 });
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
