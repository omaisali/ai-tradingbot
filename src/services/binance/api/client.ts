import { BINANCE_CONFIG } from '../config';
import { rateLimiter } from './rateLimiter';
import type { BinanceError } from '../types';

export class BinanceApiError extends Error {
  constructor(
    message: string,
    public code?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'BinanceApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json() as BinanceError;
    throw new BinanceApiError(error.msg, error.code, response);
  }
  return response.json();
}

export async function fetchBinanceApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = BINANCE_CONFIG.RATE_LIMIT.MAX_RETRIES
): Promise<T> {
  try {
    await rateLimiter.wait();
    
    const url = `${BINANCE_CONFIG.API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    });

    return handleResponse<T>(response);
  } catch (error) {
    if (retries > 0 && error instanceof BinanceApiError) {
      await new Promise(resolve => 
        setTimeout(resolve, BINANCE_CONFIG.RATE_LIMIT.RETRY_DELAY)
      );
      return fetchBinanceApi<T>(endpoint, options, retries - 1);
    }
    throw error;
  }
}