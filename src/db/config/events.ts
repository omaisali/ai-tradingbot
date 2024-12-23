import type { Connection } from 'mongoose';
import { logger } from '../../utils/logger';

export function setupConnectionEvents(connection: Connection): void {
  connection.on('error', (error) => {
    logger.error('MongoDB connection error:', error);
  });

  connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
}