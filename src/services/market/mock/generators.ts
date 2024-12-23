import type { MockConfig } from './types';

const DEFAULT_CONFIG: Required<MockConfig> = {
  basePrice: 50000, // Base price for BTC
  volatility: 100,  // Price variation range
  minVolume: 10,    // Minimum trading volume
  maxVolume: 110    // Maximum trading volume
};

export function generateMockPrice(symbol: string, config: MockConfig = {}): number {
  const { basePrice, volatility } = { ...DEFAULT_CONFIG, ...config };
  const base = symbol.includes('BTC') ? basePrice : basePrice / 25;
  const variation = (Math.random() - 0.5) * volatility;
  return base + variation;
}

export function generateMockVolume(config: MockConfig = {}): number {
  const { minVolume, maxVolume } = { ...DEFAULT_CONFIG, ...config };
  return Math.random() * (maxVolume - minVolume) + minVolume;
}

export function generateMockCandles(
  startTime: number,
  endTime: number,
  symbol: string,
  config: MockConfig = {}
): Array<{ openTime: number; close: string; volume: string }> {
  const candleCount = Math.floor((endTime - startTime) / (60 * 1000));
  const candles = [];

  for (let i = 0; i < Math.min(candleCount, 1000); i++) {
    candles.push({
      openTime: startTime + i * 60 * 1000,
      close: generateMockPrice(symbol, config).toString(),
      volume: generateMockVolume(config).toString()
    });
  }

  return candles;
}