import mongoose from 'mongoose';
import { DB_CONFIG } from './constants';
import { logger } from '../../utils/logger';
import { setupConnectionEvents } from './events';
import { validateConnection } from './validation';
import { createConnection } from './connection';
import { initializeModels } from '../models';

let isInitialized = false;

export async function initializeDatabase(): Promise<void> {
  if (isInitialized) {
    logger.info('Database already initialized');
    return;
  }

  try {
    const uri = import.meta.env.VITE_MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not configured');
    }

    // Configure mongoose
    mongoose.set('strictQuery', false);
    mongoose.set('debug', DB_CONFIG.DEBUG);

    // Create connection
    const connection = await createConnection(uri);
    
    // Setup event handlers
    setupConnectionEvents(connection.connection);
    
    // Initialize models
    await initializeModels();
    
    // Validate connection
    const isValid = await validateConnection(connection.connection);
    if (!isValid) {
      throw new Error('Database validation failed');
    }

    isInitialized = true;
    logger.info('Database initialized successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Database initialization failed:', { error: message });
    throw error;
  }
}