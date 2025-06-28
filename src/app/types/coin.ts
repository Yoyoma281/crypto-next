export type Coin = {
  symbol: string; 
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  bidQty: string
  askPrice: string
  askQty: string
  openPrice: string
  highPrice: string
  lowPrice: string  
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
};

export type CoinTableRow = Pick<
  Coin,
  | "symbol"
  | "lastPrice"
  | "priceChange"
  | "priceChangePercent"
  | "weightedAvgPrice"
  | "prevClosePrice"
>;

export type CoinPortfolioData = {
  symbol: string;
  amount: number;
  totalValue: number;
  change: number;
  changePercent: number;
  lastPrice: number;
  priceChange: number;
};


