import { connectionManager } from '../connectionManager';
import { logger } from '../../utils/logger';
import { marketDataManager } from '../../services/marketData/manager';
import { verifyMarketData } from '../../../utils/verifyMarketData';
import type { WebSocketMessage } from '../types';

export async function handleMarketDataMessage(message: WebSocketMessage, clientId: string): Promise<void> {
  const { type } = message;

  switch (type) {
    case 'get-status':
      await handleStatusRequest(clientId);
      break;
    case 'start-collection':
      await handleStartCollection(clientId);
      break;
    case 'stop-collection':
      handleStopCollection(clientId);
      break;
    case 'ping':
      connectionManager.sendToClient(clientId, { type: 'pong' });
      break;
    default:
      logger.warn(`Unknown message type: ${type}`);
  }
}

async function handleStatusRequest(clientId: string): Promise<void> {
  try {
    const status = await verifyMarketData();
    connectionManager.sendToClient(clientId, {
      type: 'market-status',
      data: status
    });
  } catch (error) {
    logger.error('Failed to get market status:', error);
    connectionManager.sendToClient(clientId, {
      type: 'error',
      data: { message: 'Failed to get market status' }
    });
  }
}

async function handleStartCollection(clientId: string): Promise<void> {
  try {
    await marketDataManager.initialize();
    connectionManager.sendToClient(clientId, {
      type: 'collection-started',
      data: { message: 'Market data collection started' }
    });
  } catch (error) {
    logger.error('Failed to start collection:', error);
    connectionManager.sendToClient(clientId, {
      type: 'error',
      data: { message: 'Failed to start market data collection' }
    });
  }
}

function handleStopCollection(clientId: string): void {
  try {
    marketDataManager.stopCollection();
    connectionManager.sendToClient(clientId, {
      type: 'collection-stopped',
      data: { message: 'Market data collection stopped' }
    });
  } catch (error) {
    logger.error('Failed to stop collection:', error);
    connectionManager.sendToClient(clientId, {
      type: 'error',
      data: { message: 'Failed to stop market data collection' }
    });
  }
}