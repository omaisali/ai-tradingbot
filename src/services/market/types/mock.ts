export interface MockConfig {
  basePrice?: number;
  volatility?: number;
  minVolume?: number;
  maxVolume?: number;
}

export interface MockMarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}