import { MarketDataService } from './marketDataService';
import { MarketUpdateEmitter } from './marketUpdateEmitter';

const marketDataService = new MarketDataService();
const marketUpdateEmitter = new MarketUpdateEmitter();

export async function initializeMarketService(): Promise<void> {
  await marketDataService.initialize();
  marketUpdateEmitter.startUpdates();
}

export function getMarketService() {
  return marketDataService;
}

export function getMarketEmitter() {
  return marketUpdateEmitter;
}