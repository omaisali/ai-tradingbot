export interface MarketServiceState {
  isInitialized: boolean;
  currentSymbol: string | null;
  initializationProgress: number;
}

export interface MarketServiceConfig {
  updateInterval?: number;
  batchSize?: number;
  retryAttempts?: number;
}