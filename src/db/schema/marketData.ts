export interface MarketData {
  id?: number;
  timestamp: number;
  symbol: string;
  price: number;
  volume: number;
  optimizedParameters?: {
    rsiPeriod: number;
    rsiOversoldThreshold: number;
    rsiOverboughtThreshold: number;
    macdFastPeriod: number;
    macdSlowPeriod: number;
    macdSignalPeriod: number;
    smaPeriods: number[];
    bollingerPeriod: number;
    bollingerStdDev: number;
  };
}

export function validateMarketData(data: Partial<MarketData>): Omit<MarketData, 'id'> {
  if (!data.timestamp || !data.symbol || typeof data.price !== 'number' || typeof data.volume !== 'number') {
    throw new Error('Invalid market data: missing required fields');
  }

  return {
    timestamp: typeof data.timestamp === 'number' ? data.timestamp : new Date(data.timestamp).getTime(),
    symbol: data.symbol,
    price: data.price,
    volume: data.volume,
    ...(data.optimizedParameters && { optimizedParameters: data.optimizedParameters })
  };
}