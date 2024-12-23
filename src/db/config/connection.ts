import mongoose from 'mongoose';
import { DB_CONFIG } from './constants';
import { logger } from '../../utils/logger';

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: DB_CONFIG.CONNECTION_TIMEOUT,
  socketTimeoutMS: DB_CONFIG.SOCKET_TIMEOUT,
  family: 4,
  retryWrites: DB_CONFIG.RETRY_WRITES,
  w: DB_CONFIG.WRITE_CONCERN,
  dbName: DB_CONFIG.DEFAULT_DB_NAME,
  maxPoolSize: DB_CONFIG.POOL_SIZE,
  keepAlive: DB_CONFIG.KEEP_ALIVE,
  keepAliveInitialDelay: DB_CONFIG.KEEP_ALIVE_MS,
  autoIndex: true,
  autoCreate: true,
  authSource: 'admin'
};

export async function createConnection(uri: string): Promise<typeof mongoose> {
  let retryAttempts = 0;

  while (retryAttempts < DB_CONFIG.RETRY_ATTEMPTS) {
    try {
      logger.info('Establishing MongoDB connection...');
      return await mongoose.connect(uri, MONGO_OPTIONS);
    } catch (error) {
      retryAttempts++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Connection attempt ${retryAttempts} failed:`, { error: errorMessage });
      
      if (retryAttempts === DB_CONFIG.RETRY_ATTEMPTS) {
        throw error;
      }

      logger.info(`Retrying in ${DB_CONFIG.RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, DB_CONFIG.RETRY_DELAY));
    }
  }

  throw new Error('Failed to connect after maximum retry attempts');
}