import type { MarketDataDocument } from '../types/marketData';

export function validateMarketData(data: Partial<MarketDataDocument>): Omit<MarketDataDocument, '_id'> {
  if (!data.timestamp || !data.symbol || data.price == null || data.volume == null) {
    throw new Error('Missing required fields');
  }

  return {
    timestamp: typeof data.timestamp === 'number' ? data.timestamp : new Date(data.timestamp).getTime(),
    symbol: data.symbol.toUpperCase(),
    price: Number(data.price),
    volume: Number(data.volume),
    ...(data.optimizedParameters && { optimizedParameters: data.optimizedParameters })
  };
}