import type { Document } from 'mongoose';

export interface TradeDocument extends Document {
  timestamp: number;
  type: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  amount: number;
  aiRecommendation?: string;
  successful: boolean;
}