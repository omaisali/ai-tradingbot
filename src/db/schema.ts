import type { Table } from 'dexie';

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

export interface MarketData {
  id?: number;
  timestamp: number;
  symbol: string;
  price: number;
  volume: number;
  optimizedParameters?: StrategyParameters;
}

export interface StrategyParameters {
  rsiPeriod: number;
  rsiOversoldThreshold: number;
  rsiOverboughtThreshold: number;
  macdFastPeriod: number;
  macdSlowPeriod: number;
  macdSignalPeriod: number;
  smaPeriods: [number, number];
  bollingerPeriod: number;
  bollingerStdDev: number;
}

export interface DatabaseSchema {
  trades: Table<Trade>;
  marketData: Table<MarketData>;
}

export const schema = {
  trades: '++id, timestamp, symbol, [symbol+timestamp]',
  marketData: '++id, timestamp, symbol, [symbol+timestamp]'
};