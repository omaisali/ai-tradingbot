import { logger } from '../../utils/logger';
import { MarketData } from './MarketData';
import { Trade } from './Trade';

let initialized = false;

export async function initializeModels(): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    logger.info('Initializing database models...');
    
    // Models are initialized when imported
    initialized = true;
    logger.info('Database models initialized successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to initialize models:', { error: message });
    throw error;
  }
}

// Export models
export { MarketData, Trade };