import type { WebSocketMessage, WebSocketClient } from '../types';
import { getDatabase } from '../../services/database';

export async function handleMarketDataMessage(
  message: WebSocketMessage,
  client: WebSocketClient
): Promise<void> {
  const { action, symbol, timeframe } = message.data;
  const db = getDatabase();

  switch (action) {
    case 'fetch-latest':
      const result = db.exec(`
        SELECT * FROM market_data 
        WHERE symbol = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `, [symbol]);

      if (result[0]?.values?.length) {
        client.send({
          type: 'market-data-update',
          data: result[0].values[0]
        });
      }
      break;

    case 'subscribe':
      // Implementation for real-time updates subscription
      break;

    default:
      console.warn(`Unknown market data action: ${action}`);
  }
}