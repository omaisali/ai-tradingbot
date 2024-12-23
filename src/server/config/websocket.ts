import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { wsManager } from '../websocket/manager';
import { ENV } from './env';
import { logger } from '../utils/logger';

export function setupWebSocket(server: Server): void {
  try {
    const wss = new WebSocketServer({ server, path: ENV.WS_PATH });
    wsManager.initialize(wss);
    logger.info('WebSocket server initialized');
  } catch (error) {
    logger.error('Failed to setup WebSocket server:', error);
    throw error;
  }
}