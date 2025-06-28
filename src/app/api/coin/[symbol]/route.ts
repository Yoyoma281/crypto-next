    import { NextResponse } from 'next/server';
    import axios from 'axios';
    import { BinanceKline } from '@/app/types'; // You must define this type

    export async function GET(
    req: Request,
    context: { params: { symbol: string } }
    ) {
    const { symbol } = await Promise.resolve(context.params); // Await symbol as per new Next.js convention

    const url = new URL(req.url);
    const interval = url.searchParams.get('interval') || '1m';

    try {
        const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
        params: {
            symbol: symbol.toUpperCase(),
            interval,
            limit: 100,
        },
        });

        const rawData = response.data as BinanceKline[];

        // const formattedData = rawData.map((kline: BinanceKline) => ({
        // time: new Date(kline[0]).toISOString(),
        // price: parseFloat(kline[4]), // Close price
        // }));

        return NextResponse.json({ data: rawData }, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch klines:', error);
        return NextResponse.json(
        { error: 'Failed to fetch klines' },
        { status: 500 }
        );
    }
    }
