// Database configuration constants
export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 30000,
  SOCKET_TIMEOUT: 45000,
  RETRY_WRITES: true,
  WRITE_CONCERN: 'majority',
  DEFAULT_DB_NAME: 'trading-bot',
  POOL_SIZE: 10,
  KEEP_ALIVE: true,
  KEEP_ALIVE_MS: 30000,
  DEBUG: process.env.NODE_ENV === 'development',
  RETRY_ATTEMPTS: 5,
  RETRY_DELAY: 3000
} as const;

export const COLLECTIONS = {
  MARKET_DATA: 'market_data',
  TRADES: 'trades',
  ANALYSIS: 'analysis'
} as const;

export const INDEXES = {
  MARKET_DATA: {
    TIMESTAMP_SYMBOL: { timestamp: 1, symbol: 1 },
    SYMBOL: { symbol: 1 }
  },
  TRADES: {
    TIMESTAMP_SYMBOL: { timestamp: 1, symbol: 1 },
    SYMBOL: { symbol: 1 }
  }
} as const;