import { getClient, initializeClient, validateClientCredentials } from './client';
import type { MarketDataResponse } from './types';
import { MarketError } from './errors';

export { initializeClient };

export async function validateApiCredentials(apiKey: string, secretKey: string): Promise<boolean> {
  return validateClientCredentials(apiKey, secretKey);
}

export async function fetchMarketData(symbol: string): Promise<MarketDataResponse> {
  try {
    const client = getClient();

    const [ticker, trades] = await Promise.all([
      client.prices({ symbol }),
      client.trades({ symbol, limit: 1 })
    ]);

    return {
      symbol,
      price: parseFloat(ticker[symbol]),
      volume: trades[0]?.quantity ? parseFloat(trades[0].quantity) : 0
    };
  } catch (error) {
    if (error instanceof MarketError) {
      throw error;
    }
    throw new MarketError('Failed to fetch market data', error as Error);
  }
}