import type { BinanceClient, MockConfig } from './types';
import { generateMockPrice, generateMockVolume, generateMockCandles } from './generators';
import { validateMockCredentials } from './validation';

export function createMockBinanceClient(
  apiKey: string, 
  secretKey: string,
  config: MockConfig = {}
): BinanceClient {
  validateMockCredentials(apiKey, secretKey);

  return {
    prices: async ({ symbol }) => ({
      [symbol]: generateMockPrice(symbol, config).toString()
    }),

    trades: async ({ symbol, limit }) => 
      Array(limit).fill(null).map(() => ({
        quantity: generateMockVolume(config).toString()
      })),

    candles: async ({ symbol, interval, startTime, endTime }) => 
      generateMockCandles(startTime, endTime, symbol, config),

    accountInfo: async () => ({ makerCommission: 10 })
  };
}