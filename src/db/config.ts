import type { DBConfig } from './types';

export const DB_CONFIG: DBConfig = {
  name: 'TradingDatabase',
  version: 11,
  stores: {
    trades: '++id, timestamp, symbol, [symbol+timestamp]',
    marketData: '++id, timestamp, symbol, [symbol+timestamp]'
  }
};