import initSqlJs, { Database } from 'sql.js';
import { SQL_SCHEMA } from './config/constants';
import { DatabaseError } from './errors/database';

export let db: Database | null = null; // Export the db variable

// let db: Database | null = null;
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
      Object.values(SQL_SCHEMA).forEach(schema => {
        db!.run(schema);
      });

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