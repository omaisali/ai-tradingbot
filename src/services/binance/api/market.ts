import { fetchBinanceApi } from './client';
import type { BinancePrice, Binance24hrTicker } from '../types';

export async function fetchPrice(symbol: string): Promise<number> {
  const data = await fetchBinanceApi<BinancePrice>(`/ticker/price?symbol=${symbol}`);
  return parseFloat(data.price);
}

export async function fetch24hrStats(symbol: string): Promise<Binance24hrTicker> {
  return fetchBinanceApi<Binance24hrTicker>(`/ticker/24hr?symbol=${symbol}`);
}

export async function fetchMarketData(symbol: string) {
  const [price, stats] = await Promise.all([
    fetchPrice(symbol),
    fetch24hrStats(symbol)
  ]);

  return {
    symbol,
    price,
    volume: parseFloat(stats.volume),
    priceChange: parseFloat(stats.priceChange),
    priceChangePercent: parseFloat(stats.priceChangePercent)
  };
}