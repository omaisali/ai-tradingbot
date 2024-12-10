import type { MarketData, Trade } from '../types';

export function validateTimestamp(timestamp: any): number {
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
  throw new Error('Invalid timestamp: must be a number, Date, or valid date string');
}

export function validateNumber(value: any, fieldName: string): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }
  return num;
}

export function validateString(value: any, fieldName: string): string {
  const str = String(value).trim();
  if (!str) {
    throw new Error(`Invalid ${fieldName}: cannot be empty`);
  }
  return str;
}

export function validateMarketData(data: Partial<MarketData>): MarketData {
  if (!data) {
    throw new Error('Market data cannot be null or undefined');
  }

  return {
    timestamp: validateTimestamp(data.timestamp),
    symbol: validateString(data.symbol, 'symbol'),
    price: validateNumber(data.price, 'price'),
    volume: validateNumber(data.volume, 'volume'),
    optimizedParameters: data.optimizedParameters,
    ...(data.id ? { id: data.id } : {})
  };
}

export function validateTrade(data: Partial<Trade>): Trade {
  if (!data) {
    throw new Error('Trade data cannot be null or undefined');
  }

  if (!['BUY', 'SELL'].includes(String(data.type))) {
    throw new Error('Invalid trade type: must be BUY or SELL');
  }

  return {
    timestamp: validateTimestamp(data.timestamp),
    type: data.type as 'BUY' | 'SELL',
    price: validateNumber(data.price, 'price'),
    amount: validateNumber(data.amount, 'amount'),
    symbol: validateString(data.symbol, 'symbol'),
    aiRecommendation: validateString(data.aiRecommendation, 'AI recommendation'),
    successful: Boolean(data.successful),
    ...(data.id ? { id: data.id } : {})
  };
}