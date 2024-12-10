import Dexie from 'dexie';
import { DB_CONFIG } from './config';
import type { DatabaseSchema } from './types';
import { validateMarketData, validateTrade } from './utils/validators';

class TradingDatabase extends Dexie {
  trades!: DatabaseSchema['trades'];
  marketData!: DatabaseSchema['marketData'];

  constructor() {
    super(DB_CONFIG.name);
    
    this.version(DB_CONFIG.version).stores(DB_CONFIG.stores);

    // Add hooks for data validation
    this.marketData.hook('creating', (primKey, obj) => {
      return validateMarketData(obj);
    });

    this.trades.hook('creating', (primKey, obj) => {
      return validateTrade(obj);
    });
  }

  async clearAllData(): Promise<void> {
    await this.transaction('rw', [this.marketData, this.trades], async () => {
      await Promise.all([
        this.marketData.clear(),
        this.trades.clear()
      ]);
    });
  }
}

const db = new TradingDatabase();

export { db };