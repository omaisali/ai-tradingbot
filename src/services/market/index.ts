export * from './service';
export * from './client';
export * from './errors';
export * from './analysis';
export type * from './types';

// Export specific functions that should be available at the top level
export { initializeClient } from './client';
export { processMarketTrends } from './analysis';
export { startMarketService, stopMarketService } from './service';