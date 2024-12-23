import { WebSocketServer } from 'ws';
import { logger } from '../utils/logger';
import { handleMarketDataMessage } from './handlers/marketData';
import { connectionManager } from './connectionManager';
import type { WebSocketMessage } from './types';

export function setupWebSocketHandlers(wss: WebSocketServer): void {
  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(7);
    
    // Add client to connection manager
    connectionManager.addClient({
      id: clientId,
      ws,
      isAlive: true
    });

    // Send initial connection success
    ws.send(JSON.stringify({
      type: 'connection-established',
      data: { clientId }
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString()) as WebSocketMessage;
        await handleMarketDataMessage(data, clientId);
      } catch (error) {
        logger.error('Failed to handle WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Failed to process message' }
        }));
      }
    });

    ws.on('close', () => {
      connectionManager.removeClient(clientId);
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
      connectionManager.removeClient(clientId);
    });
  });

  // Cleanup on server shutdown
  process.on('SIGTERM', () => {
    logger.info('Server shutting down, cleaning up WebSocket connections...');
    connectionManager.cleanup();
  });
}

export function broadcastMarketUpdate(data: any): void {
  connectionManager.broadcast({
    type: 'market-update',
    data
  });
}