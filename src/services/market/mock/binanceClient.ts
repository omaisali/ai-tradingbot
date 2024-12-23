import type { BinanceClient } from './types';
import { MOCK_CONFIG } from './config';

function generateMockPrice(basePrice: number): number {
  const variation = (Math.random() - 0.5) * (basePrice * 0.002); // 0.2% variation
  return basePrice + variation;
}

function generateMockVolume(): number {
  return Math.random() * 100 + 10; // 10-110 BTC
}

let lastPrice = 50000; // Initial BTC price

export function createMockBinanceClient(apiKey: string, secretKey: string): BinanceClient {
  if (!apiKey || !secretKey) {
    throw new Error('API key and secret key are required');
  }

  return {
    prices: async ({ symbol }) => {
      // Generate new price with realistic movement
      const priceChange = (Math.random() - 0.5) * (lastPrice * 0.001); // 0.1% max change
      lastPrice += priceChange;
      
      return {
        [symbol]: lastPrice.toString()
      };
    },

    trades: async ({ symbol, limit }) => {
      return Array(limit).fill(null).map(() => ({
        quantity: generateMockVolume().toString()
      }));
    },

    candles: async ({ symbol, interval, startTime, endTime }) => {
      const candleCount = Math.floor((endTime - startTime) / (60 * 1000)); // 1-minute intervals
      const candles = [];
      let currentPrice = lastPrice;

      for (let i = 0; i < Math.min(candleCount, 1000); i++) {
        // Generate realistic price movement
        currentPrice = generateMockPrice(currentPrice);
        
        candles.push({
          openTime: startTime + i * 60 * 1000,
          close: currentPrice.toString(),
          volume: generateMockVolume().toString()
        });
      }

      return candles;
    },

    accountInfo: async () => {
      return { makerCommission: 10 };
    }
  };
}