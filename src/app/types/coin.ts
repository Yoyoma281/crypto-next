
export type Coin = {
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

export type User = {
  _id: string;
  username: string;
  portfolio: string;
  online: boolean;
}

 export type portfolioCoin = {
  symbol: string;
  amount: string;
  CurrentWorth: string;
  _id: string;
};

export type Portfolio = {
  _id: string;
  User: User;
  AvailableBalance: number;
  Coins: portfolioCoin[];
};


export type BinanceTrade = {
  eventType: "trade"; // 'e' renamed to eventType
  eventTime: number; // 'E' renamed to eventTime (ms timestamp)
  symbol: string; // 's'
  tradeId: number; // 't'
  price: string; // 'p'
  quantity: string; // 'q'
  buyerOrderId: number; // 'b'
  sellerOrderId: number; // 'a'
  tradeTime: number; // 'T'
  isBuyerMarketMaker: boolean; // 'm'
  ignore: boolean; // 'M'
};
