import type { Connection } from 'mongoose';
import { logger } from '../../utils/logger';

export async function validateConnection(connection: Connection): Promise<boolean> {
  try {
    // Simple validation by checking if we can access the database
    const collections = await connection.db.listCollections().toArray();
    logger.info(`Connected to database with ${collections.length} collections`);
    return true;
  } catch (error) {
    logger.error('MongoDB validation failed:', error);
    return false;
  }
}