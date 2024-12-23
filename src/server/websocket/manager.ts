import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../utils/logger';

class WebSocketManager {
  private clients = new Map<string, WebSocket>();

  initialize(wss: WebSocketServer) {
    wss.on('connection', (ws) => {
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, ws);
      
      logger.info(`Client connected: ${clientId}`);

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  broadcast(message: any) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export const wsManager = new WebSocketManager();