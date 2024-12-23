export const DB_NAME = 'TradingDatabase';
export const DB_VERSION = 1;

// Define store schemas with proper key paths and indexes
export const DB_SCHEMA = {
  marketData: {
    keyPath: 'id',
    autoIncrement: true,
    storeDefinition: '++id, timestamp, symbol, [symbol+timestamp]',
    required: ['timestamp', 'symbol', 'price', 'volume']
  },
  trades: {
    keyPath: 'id',
    autoIncrement: true,
    storeDefinition: '++id, timestamp, symbol, type, [symbol+timestamp]',
    required: ['timestamp', 'symbol', 'type', 'price', 'amount']
  }
} as const;

// Generate store definitions for Dexie
export const DB_STORES = Object.entries(DB_SCHEMA).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [key]: value.storeDefinition
  }), 
  {} as Record<string, string>
);