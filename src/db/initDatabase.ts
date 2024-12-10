import Dexie from 'dexie';
import { db } from './database';
import { validateMarketData } from './utils/validators';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function verifyDatabase(): Promise<void> {
  try {
    const testData = validateMarketData({
      timestamp: Date.now(),
      symbol: 'TEST',
      price: 100,
      volume: 1000
    });

    // Test write
    const id = await db.marketData.add(testData);
    
    // Test read
    const storedData = await db.marketData.get(id);
    if (!storedData || storedData.timestamp !== testData.timestamp) {
      throw new Error('Database verification failed');
    }

    // Clean up test data
    await db.marketData.where('symbol').equals('TEST').delete();
  } catch (error) {
    console.error('Database verification failed:', error);
    throw error;
  }
}

export async function initializeDatabase(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Close any existing connections
      if (db.isOpen()) {
        await db.close();
      }

      // Delete existing database if it exists
      await Dexie.delete('TradingDatabase');

      // Open database with schema
      await db.open();

      // Verify database
      await verifyDatabase();

      isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      isInitialized = false;
      initializationPromise = null;

      // Try to recover by deleting and recreating the database
      try {
        await Dexie.delete('TradingDatabase');
        await db.open();
        await verifyDatabase();
        isInitialized = true;
      } catch (retryError) {
        console.error('Database recovery failed:', retryError);
        throw retryError;
      }
    }
  })();

  return initializationPromise;
}

export async function isDatabaseReady(): Promise<boolean> {
  try {
    if (!isInitialized) {
      await initializeDatabase();
    }
    return db.isOpen();
  } catch (error) {
    console.error('Database readiness check failed:', error);
    return false;
  }
}

export async function ensureDatabaseConnection(): Promise<void> {
  if (!isInitialized || !db.isOpen()) {
    await initializeDatabase();
  }
}