import { subscribeToMarketUpdates } from '../services/marketService.js';

export function setupWebSocketHandlers(wss) {
  wss.on('connection', (ws) => {
    console.log('Client connected');

    // Subscribe to market updates
    const unsubscribe = subscribeToMarketUpdates((data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'market-update',
          data
        }));
      }
    });

    ws.on('message', (message) => {
      try {
        const { type, data } = JSON.parse(message);
        handleWebSocketMessage(ws, type, data);
      } catch (error) {
        console.error('WebSocket message handling error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      unsubscribe();
    });
  });
}

function handleWebSocketMessage(ws, type, data) {
  switch (type) {
    case 'subscribe':
      // Handle subscription requests
      break;
    case 'unsubscribe':
      // Handle unsubscription requests
      break;
    default:
      console.warn('Unknown message type:', type);
  }
}