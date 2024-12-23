export const BINANCE_CONFIG = {
  API_BASE: 'https://api.binance.com/api/v3',
  RATE_LIMIT: {
    DEFAULT_INTERVAL: 100, // ms between requests
    RETRY_DELAY: 1000,     // ms before retry
    MAX_RETRIES: 3
  },
  DEFAULT_SYMBOL: 'BTCUSDT',
  UPDATE_INTERVAL: 5000,   // ms between market data updates
  HISTORICAL_YEARS: 5      // years of historical data to fetch
};