export interface BinanceClient {
  prices: (options: { symbol: string }) => Promise<Record<string, string>>;
  trades: (options: { symbol: string; limit: number }) => Promise<Array<{ quantity: string }>>;
  candles: (options: {
    symbol: string;
    interval: string;
    startTime: number;
    endTime: number;
  }) => Promise<Array<{
    openTime: number;
    close: string;
    volume: string;
  }>>;
  accountInfo: () => Promise<{ makerCommission: number }>;
}

export interface ClientConfig {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
}