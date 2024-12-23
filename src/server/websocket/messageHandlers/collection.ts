import type { WebSocketMessage, WebSocketClient } from '../types';
import { DataCollectionManager } from '../../services/dataCollection/manager';

const collectionManagers = new Map<string, DataCollectionManager>();

export async function handleCollectionMessage(
  message: WebSocketMessage,
  client: WebSocketClient
): Promise<void> {
  const { action, symbol, apiKey, secretKey } = message.data;

  switch (action) {
    case 'start':
      if (!collectionManagers.has(client.id)) {
        const manager = new DataCollectionManager(apiKey, secretKey);
        
        // Set up progress updates
        manager.on('progress', (progress) => {
          client.send({
            type: 'collection-progress',
            data: progress
          });
        });

        manager.on('complete', () => {
          client.send({
            type: 'collection-complete',
            data: { symbol }
          });
        });

        manager.on('error', (error) => {
          client.send({
            type: 'collection-error',
            data: { message: error.message }
          });
        });

        collectionManagers.set(client.id, manager);
      }

      const manager = collectionManagers.get(client.id);
      await manager?.startCollection(symbol);
      break;

    case 'pause':
      collectionManagers.get(client.id)?.pauseCollection();
      break;

    default:
      console.warn(`Unknown collection action: ${action}`);
  }
}