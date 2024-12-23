import { Schema } from 'mongoose';
import { createModel } from './base';
import type { TradeDocument } from '../types/trade';
import { COLLECTIONS, INDEXES } from '../config/constants';

const tradeSchema = new Schema<TradeDocument>({
  timestamp: { type: Number, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  aiRecommendation: String,
  successful: { type: Boolean, default: false }
}, {
  timestamps: true,
  collection: COLLECTIONS.TRADES,
  autoIndex: true
});

// Create compound index for timestamp and symbol
tradeSchema.index(INDEXES.TRADES.TIMESTAMP_SYMBOL);

// Create the model
const Trade = createModel<TradeDocument>(
  'Trade',
  tradeSchema,
  COLLECTIONS.TRADES
);

export { Trade };