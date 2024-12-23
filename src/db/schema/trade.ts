export interface Trade {
  id?: number;
  timestamp: number;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  symbol: string;
  aiRecommendation: string;
  successful: boolean;
}

export function createTrade(data: Omit<Trade, 'id'>): Omit<Trade, 'id'> {
  return {
    timestamp: data.timestamp,
    type: data.type,
    price: data.price,
    amount: data.amount,
    symbol: data.symbol,
    aiRecommendation: data.aiRecommendation,
    successful: data.successful
  };
}