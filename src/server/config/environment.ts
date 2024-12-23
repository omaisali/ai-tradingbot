// Environment configuration
export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BINANCE_API: {
    BASE_URL: 'https://api.binance.com/api/v3',
    RATE_LIMIT: {
      MAX_REQUESTS_PER_MINUTE: 1200,
      RETRY_DELAY: 1000,
      MAX_RETRIES: 3
    }
  },
  OPENAI_API: {
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4',
    MAX_TOKENS: 1000
  },
  DATABASE: {
    FILENAME: ':memory:', // In-memory SQLite database
    BACKUP_INTERVAL: 300000 // 5 minutes
  }
} as const;