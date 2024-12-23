import type { DBConfig } from './types';

// Get the highest version from localStorage or default to 1
const getLatestVersion = (): number => {
  try {
    const stored = localStorage.getItem('dbVersion');
    return stored ? Math.max(Number(stored), 1) : 1;
  } catch {
    return 1;
  }
};

export const DB_CONFIG: DBConfig = {
  name: 'TradingDatabase',
  version: getLatestVersion(),
  stores: {
    marketData: '++id, timestamp, symbol, [symbol+timestamp]',
    trades: '++id, timestamp, symbol, [symbol+timestamp]'
  }
};

// Update version in localStorage
export const updateDbVersion = (version: number): void => {
  try {
    localStorage.setItem('dbVersion', String(version));
  } catch (error) {
    console.warn('Failed to update database version in localStorage:', error);
  }
};