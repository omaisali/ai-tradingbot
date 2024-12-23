import { getDatabase } from './config/database';
import { cleanupDatabase } from './utils/cleanup';
import { InitializationError } from './errors/database';
import { TABLES } from './config/constants';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  console.log('🔄 Starting database initialization...');
  
  if (isInitialized) {
    console.log('✅ Database already initialized');
    return;
  }

  if (initializationPromise) {
    console.log('⏳ Waiting for existing initialization...');
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Initialize database connection
      console.log('🔑 Getting database connection...');
      const db = getDatabase();
      
      // Verify database by attempting a test write/read
      console.log('🔍 Verifying database operations...');
      
      const testData = {
        timestamp: Date.now(),
        symbol: 'TEST',
        price: 100,
        volume: 1000
      };

      // Test write
      const insertStmt = db.prepare(`
        INSERT INTO ${TABLES.MARKET_DATA} (timestamp, symbol, price, volume)
        VALUES (@timestamp, @symbol, @price, @volume)
      `);
      
      const result = insertStmt.run(testData);
      console.log('✅ Test write successful');

      // Test read
      const selectStmt = db.prepare(`
        SELECT * FROM ${TABLES.MARKET_DATA} WHERE id = ?
      `);
      
      const verify = selectStmt.get(result.lastInsertRowid);
      
      if (!verify || verify.timestamp !== testData.timestamp) {
        throw new Error('Database verification failed: Read data mismatch');
      }
      console.log('✅ Test read successful');
      
      // Clean up test data
      const deleteStmt = db.prepare(`
        DELETE FROM ${TABLES.MARKET_DATA} WHERE id = ?
      `);
      
      deleteStmt.run(result.lastInsertRowid);
      console.log('✅ Test cleanup successful');

      isInitialized = true;
      console.log('🎉 Database initialization successful');

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      isInitialized = false;
      initializationPromise = null;

      // Cleanup on failure
      try {
        await cleanupDatabase();
      } catch (cleanupError) {
        console.error('❌ Cleanup after failure failed:', cleanupError);
      }

      throw new InitializationError(
        'Database initialization failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  })();

  return initializationPromise;
}

export async function ensureDatabaseConnection(): Promise<void> {
  if (!isInitialized) {
    await initializeDatabase();
  }
}