import { calculateEMA } from './ema';

export interface MACD {
  macd: number;
  signal: number;
  histogram: number;
}

export function calculateMACD(prices: number[]): MACD {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([...prices.slice(0, -1), macd], 9);
  const histogram = macd - signal;

  return { macd, signal, histogram };
}