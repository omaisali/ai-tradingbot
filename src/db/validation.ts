import type { MarketData, Trade } from './schema';

export function validateMarketData(data: Partial<MarketData>): MarketData {
  const timestamp = validateTimestamp(data.timestamp);
  
  if (!data.symbol || typeof data.symbol !== 'string') {
    throw new Error('Symbol is required and must be a string');
  }

  if (typeof data.price !== 'number' || isNaN(data.price)) {
    throw new Error('Price must be a valid number');
  }

  if (typeof data.volume !== 'number' || isNaN(data.volume)) {
    throw new Error('Volume must be a valid number');
  }

  return {
    timestamp,
    symbol: data.symbol,
    price: data.price,
    volume: data.volume,
    optimizedParameters: data.optimizedParameters
  };
}

export function validateTrade(data: Partial<Trade>): Trade {
  const timestamp = validateTimestamp(data.timestamp);

  if (!data.type || !['BUY', 'SELL'].includes(data.type)) {
    throw new Error('Trade type must be either BUY or SELL');
  }

  if (typeof data.price !== 'number' || isNaN(data.price)) {
    throw new Error('Price must be a valid number');
  }

  if (typeof data.amount !== 'number' || isNaN(data.amount)) {
    throw new Error('Amount must be a valid number');
  }

  if (!data.symbol || typeof data.symbol !== 'string') {
    throw new Error('Symbol is required and must be a string');
  }

  if (!data.aiRecommendation || typeof data.aiRecommendation !== 'string') {
    throw new Error('AI recommendation is required and must be a string');
  }

  if (typeof data.successful !== 'boolean') {
    throw new Error('Trade success status must be a boolean');
  }

  return {
    timestamp,
    type: data.type,
    price: data.price,
    amount: data.amount,
    symbol: data.symbol,
    aiRecommendation: data.aiRecommendation,
    successful: data.successful
  };
}

function validateTimestamp(timestamp: any): number {
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  
  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (isNaN(parsed)) {
      throw new Error('Invalid timestamp format');
    }
    return parsed;
  }

  throw new Error('Timestamp must be a number, Date, or valid date string');
}