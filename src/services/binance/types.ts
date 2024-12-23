export interface BinanceCredentials {
  apiKey: string;
  secretKey: string;
}

export interface BinancePrice {
  symbol: string;
  price: string;
}

export interface Binance24hrTicker {
  symbol: string;
  volume: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
}

export interface BinanceError {
  code: number;
  msg: string;
}