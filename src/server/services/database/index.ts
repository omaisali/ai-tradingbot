import initSqlJs, { Database } from 'sql.js';
import { DATABASE_SCHEMA } from './schema';
import { ENV } from '../../config/environment';

let db: Database | null = null;

export async function initializeDatabase(): Promise<void> {
  if (db) return;

  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    db = new SQL.Database();
    
    // Create tables
    Object.values(DATABASE_SCHEMA).forEach(schema => {
      db!.run(schema);
    });

    // Set up periodic backup if not in memory
    if (ENV.DATABASE.FILENAME !== ':memory:') {
      setInterval(() => backupDatabase(), ENV.DATABASE.BACKUP_INTERVAL);
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

async function backupDatabase(): Promise<void> {
  if (!db || ENV.DATABASE.FILENAME === ':memory:') return;
  
  try {
    const data = db.export();
    // In a real implementation, save this to disk or cloud storage
    console.log(`Database backup completed: ${data.length} bytes`);
  } catch (error) {
    console.error('Database backup failed:', error);
  }
}