import { closeDatabase } from '../config/database';

export async function cleanupDatabase(): Promise<void> {
  try {
    console.log('🧹 Cleaning up database...');
    closeDatabase();
    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}