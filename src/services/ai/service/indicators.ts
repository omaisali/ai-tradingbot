import type { TechnicalIndicators } from '../types';
import { calculateIndicators } from '../../market/analysis';
import type { MarketData } from '../../../db/types/marketData';

export function prepareIndicators(marketData: MarketData[]): TechnicalIndicators {
  return calculateIndicators(marketData);
}

export function analyzeIndicators(indicators: TechnicalIndicators): {
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
} {
  const { rsi, macd, sma20, sma50 } = indicators;
  
  let bullishSignals = 0;
  let bearishSignals = 0;

  // RSI analysis
  if (rsi < 30) bullishSignals++;
  if (rsi > 70) bearishSignals++;

  // MACD analysis
  if (macd.histogram > 0) bullishSignals++;
  if (macd.histogram < 0) bearishSignals++;

  // Moving average analysis
  if (sma20 > sma50) bullishSignals++;
  if (sma20 < sma50) bearishSignals++;

  const totalSignals = 3; // Number of indicators checked
  const strength = Math.max(bullishSignals, bearishSignals) / totalSignals * 100;

  return {
    trend: bullishSignals > bearishSignals ? 'bullish' : 
           bearishSignals > bullishSignals ? 'bearish' : 'neutral',
    strength
  };
}