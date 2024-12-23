import { WebSocket } from 'ws';
import { logger } from '../utils/logger';
import type { WebSocketClient } from './types';

const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 35000;

export class ConnectionManager {
  private clients = new Map<string, WebSocketClient>();
  private heartbeatInterval: NodeJS.Timeout;

  constructor() {
    this.heartbeatInterval = setInterval(() => {
      this.checkConnections();
    }, HEARTBEAT_INTERVAL);
  }

  addClient(client: WebSocketClient): void {
    this.clients.set(client.id, client);
    this.setupHeartbeat(client);

    logger.info(`Client connected: ${client.id}`);
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      clearTimeout(client.heartbeatTimeout);
      this.clients.delete(clientId);
      logger.info(`Client disconnected: ${clientId}`);
    }
  }

  private setupHeartbeat(client: WebSocketClient): void {
    client.isAlive = true;
    client.heartbeatTimeout = setTimeout(() => {
      if (!client.isAlive) {
        logger.warn(`Client ${client.id} timed out`);
        client.ws.terminate();
        this.removeClient(client.id);
      }
    }, HEARTBEAT_TIMEOUT);

    client.ws.on('pong', () => {
      client.isAlive = true;
    });

    client.ws.on('ping', () => {
      client.ws.pong();
    });
  }

  private checkConnections(): void {
    this.clients.forEach(client => {
      if (!client.isAlive) {
        client.ws.terminate();
        this.removeClient(client.id);
        return;
      }

      client.isAlive = false;
      client.ws.ping();
    });
  }

  broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  cleanup(): void {
    clearInterval(this.heartbeatInterval);
    this.clients.forEach(client => {
      client.ws.terminate();
    });
    this.clients.clear();
  }
}

export const connectionManager = new ConnectionManager();