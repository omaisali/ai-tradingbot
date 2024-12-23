import type { Document } from 'mongoose';

export interface MarketDataDocument extends Document {
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