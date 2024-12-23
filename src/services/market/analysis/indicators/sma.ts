import type { IndicatorParams } from './types';

export function calculateSMA({ prices, period }: IndicatorParams): number {
  if (!period || prices.length < period) return 0;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}