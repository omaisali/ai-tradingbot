import { initializeDatabase, getDatabase } from '../config/database';
import { DatabaseError } from '../errors/database';
import type { Database } from 'sql.js';

export abstract class BaseRepository {
  protected abstract tableName: string;

  protected async getDb(): Promise<Database> {
    await initializeDatabase();
    return getDatabase();
  }

  protected async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const db = await this.getDb();
      const stmt = db.prepare(sql);
      
      if (params.length > 0) {
        stmt.bind(params);
      }
      
      const results: T[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
      stmt.free();
      
      return results;
    } catch (error) {
      console.error(`Query failed on ${this.tableName}:`, error);
      throw new DatabaseError(
        `Query failed on ${this.tableName}: ${error.message}`,
        error as Error
      );
    }
  }

  protected async execute(sql: string, params: any[] = []): Promise<number> {
    try {
      const db = await this.getDb();
      const stmt = db.prepare(sql);
      
      if (params.length > 0) {
        stmt.bind(params);
      }
      
      stmt.run();
      const info = db.exec('SELECT last_insert_rowid()')[0];
      stmt.free();
      
      if (!info || !info.values || !info.values[0]) {
        throw new Error('Failed to get last insert ID');
      }
      
      return info.values[0][0] as number;
    } catch (error) {
      console.error(`Execute failed on ${this.tableName}:`, error);
      throw new DatabaseError(
        `Execute failed on ${this.tableName}: ${error.message}`,
        error as Error
      );
    }
  }
}