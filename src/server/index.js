import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { initializeMarketService } from './services/marketService.js';
import { setupWebSocketHandlers } from './websocket/handlers.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize market service
initializeMarketService();

// Set up WebSocket handlers
setupWebSocketHandlers(wss);

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});