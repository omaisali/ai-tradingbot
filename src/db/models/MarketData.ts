import { Schema } from 'mongoose';
import { createModel } from './base';
import type { MarketDataDocument } from '../types/marketData';
import { COLLECTIONS, INDEXES } from '../config/constants';

const marketDataSchema = new Schema<MarketDataDocument>({
  timestamp: { type: Number, required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  volume: { type: Number, required: true },
  optimizedParameters: {
    rsiPeriod: Number,
    rsiOversoldThreshold: Number,
    rsiOverboughtThreshold: Number,
    macdFastPeriod: Number,
    macdSlowPeriod: Number,
    macdSignalPeriod: Number,
    smaPeriods: [Number],
    bollingerPeriod: Number,
    bollingerStdDev: Number
  }
}, {
  timestamps: true,
  collection: COLLECTIONS.MARKET_DATA,
  autoIndex: true
});

// Create compound index for timestamp and symbol
marketDataSchema.index(INDEXES.MARKET_DATA.TIMESTAMP_SYMBOL);

// Create the model
const MarketData = createModel<MarketDataDocument>(
  'MarketData',
  marketDataSchema,
  COLLECTIONS.MARKET_DATA
);

export { MarketData };