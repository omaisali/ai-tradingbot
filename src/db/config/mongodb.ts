import mongoose from 'mongoose';
import { DB_CONFIG } from './constants';
import { logger } from '../../utils/logger';
import { setupConnectionEvents } from './events';

let isInitialized = false;

export async function connectDatabase(): Promise<void> {
  if (isInitialized) {
    logger.info('MongoDB already connected');
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not configured');
    }

    // Configure mongoose
    mongoose.set('strictQuery', true);

    // Connect to MongoDB
    await mongoose.connect(uri, {
      dbName: DB_CONFIG.DEFAULT_DB_NAME,
      maxPoolSize: DB_CONFIG.POOL_SIZE,
      socketTimeoutMS: DB_CONFIG.SOCKET_TIMEOUT,
      serverSelectionTimeoutMS: DB_CONFIG.CONNECTION_TIMEOUT,
      retryWrites: DB_CONFIG.RETRY_WRITES,
      w: DB_CONFIG.WRITE_CONCERN
    });

    // Setup connection events
    setupConnectionEvents(mongoose.connection);

    isInitialized = true;
    logger.info('Connected to MongoDB');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('MongoDB connection failed:', { error: message });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isInitialized) return;

  try {
    await mongoose.disconnect();
    isInitialized = false;
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('MongoDB disconnect failed:', error);
    throw error;
  }
}