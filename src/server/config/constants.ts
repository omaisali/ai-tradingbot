export const SERVER_CONFIG = {
  PORT: 3000,
  WS_PATH: '/ws',
  CORS_OPTIONS: {
    origin: '*', // In production, restrict this to your frontend domain
    methods: ['GET', 'POST']
  },
  RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 1200,
    RETRY_DELAY: 1000,
    MAX_RETRIES: 3
  }
} as const;

export const DATABASE_CONFIG = {
  FILENAME: ':memory:', // In-memory SQLite database
  BACKUP_INTERVAL: 300000 // 5 minutes
} as const;