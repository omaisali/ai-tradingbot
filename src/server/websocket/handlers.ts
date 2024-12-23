import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type { WebSocketMessage, WebSocketClient } from './types';
import { handleMarketDataMessage } from './messageHandlers/marketData';
import { handleCollectionMessage } from './messageHandlers/collection';

const clients = new Map<string, WebSocketClient>();

export function setupWebSocketHandlers(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket) => {
    const clientId = uuidv4();
    
    // Add client to connected clients
    clients.set(clientId, {
      id: clientId,
      send: (message: WebSocketMessage) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    });

    console.log(`Client connected: ${clientId}`);

    // Handle incoming messages
    ws.on('message', async (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        const client = clients.get(clientId);

        if (!client) {
          console.error(`Client ${clientId} not found`);
          return;
        }

        switch (message.type) {
          case 'market-data':
            await handleMarketDataMessage(message, client);
            break;
          case 'collection':
            await handleCollectionMessage(message, client);
            break;
          default:
            console.warn(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Failed to process message' }
        }));
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });

    // Send initial connection success message
    ws.send(JSON.stringify({
      type: 'connection-established',
      data: { clientId }
    }));
  });
}

export function broadcastMessage(message: WebSocketMessage): void {
  clients.forEach(client => {
    client.send(message);
  });
}

export function sendToClient(clientId: string, message: WebSocketMessage): void {
  const client = clients.get(clientId);
  if (client) {
    client.send(message);
  }
}