export interface MarketDataResponse {
  symbol: string;
  price: number;
  volume: number;
  timestamp?: number;
}

export interface HistoricalDataProgress {
  year: number;
  month: number;
  progress: number;
}

export interface AnalysisResult {
  indicators: TechnicalIndicators;
  performance: {
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    successfulTrades: number;
  };
}

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}