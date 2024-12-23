import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { connectDatabase } from '../db/config/mongodb';
import { setupWebSocketHandlers } from './websocket';
import { logger } from '../utils/logger';
import { initializeModels } from '../db/models';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Basic middleware
    app.use(cors());
    app.use(express.json());

    // Initialize database
    logger.info('Connecting to database...');
    await connectDatabase();
    await initializeModels();
    logger.info('Database connection established');

    // Setup routes
    setupRoutes(app);

    // Error handling middleware
    app.use(errorHandler);

    // Create HTTP server
    const server = createServer(app);

    // Setup WebSocket
    const wss = new WebSocketServer({ server, path: '/ws' });
    setupWebSocketHandlers(wss);

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
      logger.info('WebSocket server running at ws://localhost:${PORT}/ws');
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('HTTP server closed');
      });
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});