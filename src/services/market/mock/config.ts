// Configuration constants for mock market data service

export const MOCK_CONFIG = {
  // Default API key for development environment
  DEFAULT_API_KEY: 'development_api_key_1234567890',
  
  // Default secret key for development environment
  DEFAULT_SECRET_KEY: 'development_secret_key_1234567890',
  
  // Update interval in milliseconds
  UPDATE_INTERVAL: 5000,
  
  // Price configuration for different assets
  PRICE_CONFIG: {
    BTC_BASE_PRICE: 50000,
    ETH_BASE_PRICE: 2000,
    VOLATILITY: 100
  },
  
  // Volume configuration ranges
  VOLUME_CONFIG: {
    MIN: 10,
    MAX: 110
  }
} as const;