import type { MarketData } from '../schema/marketData';
import type { Trade } from '../schema/trade';
import { DatabaseValidationError } from '../errors/DatabaseError';

export function validateTimestamp(timestamp: unknown): number {
  if (typeof timestamp === 'number' && !isNaN(timestamp)) {
    return timestamp;
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  throw new DatabaseValidationError('Invalid timestamp: must be a number, Date, or valid date string');
}

export function validateMarketData(data: Partial<MarketData>): Omit<MarketData, 'id'> {
  if (!data) {
    throw new DatabaseValidationError('Market data cannot be null or undefined');
  }

  if (data.timestamp == null || data.symbol == null || data.price == null || data.volume == null) {
    throw new DatabaseValidationError('Missing required market data fields');
  }

  return {
    timestamp: validateTimestamp(data.timestamp),
    symbol: String(data.symbol),
    price: Number(data.price),
    volume: Number(data.volume),
    ...(data.optimizedParameters && { optimizedParameters: data.optimizedParameters })
  };
}

export function validateTrade(data: Partial<Trade>): Omit<Trade, 'id'> {
  if (!data) {
    throw new DatabaseValidationError('Trade data cannot be null or undefined');
  }

  if (data.timestamp == null || data.type == null || data.symbol == null || 
      data.price == null || data.amount == null || 
      data.aiRecommendation == null || data.successful == null) {
    throw new DatabaseValidationError('Missing required trade fields');
  }

  const type = String(data.type).toUpperCase();
  if (type !== 'BUY' && type !== 'SELL') {
    throw new DatabaseValidationError('Invalid trade type: must be BUY or SELL');
  }

  return {
    timestamp: validateTimestamp(data.timestamp),
    type: type as 'BUY' | 'SELL',
    price: Number(data.price),
    amount: Number(data.amount),
    symbol: String(data.symbol),
    aiRecommendation: String(data.aiRecommendation),
    successful: Boolean(data.successful)
  };
}