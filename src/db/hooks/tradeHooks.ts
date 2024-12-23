import type { Dexie } from 'dexie';
import { validateTrade } from '../validators/trade';

export function setupTradeHooks(db: Dexie): void {
  db.table('trades').hook('creating', (primKey, obj) => {
    try {
      const validated = validateTrade(obj);
      return {
        ...validated,
        id: undefined // Let Dexie handle auto-increment
      };
    } catch (error) {
      console.error('Error in trades creating hook:', error);
      throw error;
    }
  });
}