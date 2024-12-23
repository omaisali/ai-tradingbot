import initSqlJs, { Database } from 'sql.js';
import { SQL_SCHEMA } from './config/constants';
import { DatabaseError } from './errors/database';

let db: Database | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  console.log('🔄 Starting database initialization...');
  
  if (isInitialized && db) {
    console.log('✅ Database already initialized');
    return;
  }

  if (initializationPromise) {
    console.log('⏳ Waiting for existing initialization...');
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🔄 Loading SQL.js...');
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      console.log('🔄 Creating database...');
      db = new SQL.Database();

      console.log('🔄 Creating tables...');
      // Create tables and indices
      Object.values(SQL_SCHEMA).forEach(schema => {
        db!.run(schema);
      });

      // Verify database
      await verifyDatabase();

      isInitialized = true;
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      closeDatabase();
      throw new DatabaseError('Failed to initialize database', error as Error);
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

async function verifyDatabase(): Promise<void> {
  console.log('🔍 Verifying database...');
  
  if (!db) {
    throw new DatabaseError('Database not initialized');
  }

  try {
    // Test write
    const testStmt = db.prepare(`
      INSERT INTO market_data (timestamp, symbol, price, volume)
      VALUES (?, ?, ?, ?)
    `);
    
    const testData = {
      timestamp: Date.now(),
      symbol: 'TEST',
      price: 100,
      volume: 1000
    };
    
    testStmt.run([testData.timestamp, testData.symbol, testData.price, testData.volume]);
    testStmt.free();
    
    // Test read
    const readStmt = db.prepare('SELECT * FROM market_data WHERE symbol = ?');
    readStmt.bind(['TEST']);
    
    const result = readStmt.step();
    readStmt.free();
    
    // Clean up test data
    const cleanupStmt = db.prepare('DELETE FROM market_data WHERE symbol = ?');
    cleanupStmt.run(['TEST']);
    cleanupStmt.free();
    
    if (!result) {
      throw new Error('Database verification failed');
    }
    
    console.log('✅ Database verification successful');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw new DatabaseError('Database verification failed', error as Error);
  }
}

export function getDatabase(): Database {
  if (!db || !isInitialized) {
    throw new DatabaseError('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    isInitialized = false;
    initializationPromise = null;
  }
}

export async function ensureDatabaseConnection(): Promise<void> {
  if (!isInitialized || !db) {
    await initializeDatabase();
  }
}