import type { Database } from 'sql.js';

export interface DatabaseConfig {
  name: string;
  version: number;
}

export interface DatabaseInstance {
  db: Database;
  isInitialized: boolean;
}