import { calculateSMA } from './sma';

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
}

export function calculateBollingerBands(prices: number[], period: number = 20): BollingerBands {
  const sma = calculateSMA(prices, period);
  const standardDeviation = Math.sqrt(
    prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
  );

  return {
    upper: sma + standardDeviation * 2,
    middle: sma,
    lower: sma - standardDeviation * 2
  };
}