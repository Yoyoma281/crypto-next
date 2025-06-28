export type ticker24hrType = {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// Single kline item as a tuple
export type BinanceKline = [
  openTime: number,                 // Open time (timestamp in milliseconds)
  openPrice: string,               // Open price as string
  highPrice: string,               // High price as string
  lowPrice: string,                // Low price as string
  closePrice: string,              // Close price as string
  volume: string,                  // Volume as string
  closeTime: number,               // Close time (timestamp in milliseconds)
  quoteAssetVolume: string,        // Quote asset volume as string
  numberOfTrades: number,          // Number of trades
  takerBuyBaseAssetVolume: string, // Taker buy base asset volume as string
  takerBuyQuoteAssetVolume: string, // Taker buy quote asset volume as string
  ignore: string                   // Ignore field (usually empty)
];

