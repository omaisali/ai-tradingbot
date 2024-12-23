import { db } from '../core/database';
import { InitializationError } from '../errors/database';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function cleanupDatabase(): Promise<void> {
  try {
    if (db.isOpen()) {
      await db.close();
    }
    const databases = await window.indexedDB.databases();
    await Promise.all(
      databases
        .filter(db => db.name === 'TradingDatabase')
        .map(db => new Promise<void>((resolve, reject) => {
          const request = window.indexedDB.deleteDatabase(db.name);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }))
    );
  } catch (error) {
    console.warn('Database cleanup warning:', error);
  }
}

export async function initializeDatabase(): Promise<void> {
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      await cleanupDatabase();
      await db.open();
      
      // Verify database by attempting a test write/read
      const testData = {
        timestamp: Date.now(),
        symbol: 'TEST',
        price: 100,
        volume: 1000
      };
      
      const id = await db.marketData.add(testData);
      const stored = await db.marketData.get(id);
      await db.marketData.delete(id);

      if (!stored || stored.timestamp !== testData.timestamp) {
        throw new Error('Database verification failed');
      }

      isInitialized = true;
    } catch (error) {
      isInitialized = false;
      initializationPromise = null;
      await cleanupDatabase();
      
      throw new InitializationError(
        'Failed to initialize database',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  })();

  return initializationPromise;
}

export async function ensureDatabaseConnection(): Promise<void> {
  if (!isInitialized || !db.isOpen()) {
    await initializeDatabase();
  }
}