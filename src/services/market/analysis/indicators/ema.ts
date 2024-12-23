import type { IndicatorParams } from './types';

export function calculateEMA({ prices, period }: IndicatorParams): number {
  if (!period || prices.length < period) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}