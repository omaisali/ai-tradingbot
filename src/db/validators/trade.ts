import type { TradeDocument } from '../types/trade';

export function validateTrade(data: Partial<TradeDocument>): Omit<TradeDocument, '_id'> {
  if (!data.timestamp || !data.type || !data.symbol || 
      typeof data.price !== 'number' || typeof data.amount !== 'number') {
    throw new Error('Invalid trade data: missing or invalid required fields');
  }

  if (!['BUY', 'SELL'].includes(data.type)) {
    throw new Error('Invalid trade type: must be BUY or SELL');
  }

  return {
    timestamp: typeof data.timestamp === 'number' ? data.timestamp : new Date(data.timestamp).getTime(),
    type: data.type,
    symbol: data.symbol.toUpperCase(),
    price: data.price,
    amount: data.amount,
    aiRecommendation: data.aiRecommendation || '',
    successful: Boolean(data.successful)
  };
}