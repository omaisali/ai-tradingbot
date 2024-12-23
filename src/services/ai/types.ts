export interface AIAnalysisRequest {
  marketData: {
    price: number;
    volume: number;
    timestamp: number;
    historicalPrices?: number[];
  };
  technicalIndicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    sma: {
      short: number;
      long: number;
    };
    bollingerBands?: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
}

export interface AIAnalysisResponse {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  risks: string[];
  supportLevels: number[];
  resistanceLevels: number[];
  performance: {
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    successfulTrades: number;
  };
}