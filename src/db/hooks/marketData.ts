import type { Dexie } from 'dexie';
import { validateMarketData } from '../validators/marketData';
import { STORE_CONFIG } from '../core/constants';

export function setupMarketDataHooks(db: Dexie): void {
  db.table('marketData').hook('creating', (primKey, obj) => {
    try {
      const validated = validateMarketData(obj);
      return {
        ...validated,
        id: undefined // Let Dexie handle auto-increment
      };
    } catch (error) {
      console.error('Error in marketData creating hook:', error);
      throw error;
    }
  });
}