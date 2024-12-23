import { EventEmitter } from 'events';
import { createMockBinanceClient } from '../../services/market/mock/binanceClient.js';

const marketEvents = new EventEmitter();
let client = null;
let isRunning = false;

export function initializeMarketService() {
  // Initialize with mock client
  client = createMockBinanceClient('mock-key', 'mock-secret');
  startMarketUpdates();
}

function startMarketUpdates() {
  if (isRunning) return;
  isRunning = true;

  const UPDATE_INTERVAL = 5000; // 5 seconds

  async function updateMarketData() {
    try {
      const symbol = 'BTCUSDT';
      const [ticker, trades] = await Promise.all([
        client.prices({ symbol }),
        client.trades({ symbol, limit: 1 })
      ]);

      const data = {
        symbol,
        price: parseFloat(ticker[symbol]),
        volume: trades[0]?.quantity ? parseFloat(trades[0].quantity) : 0,
        timestamp: Date.now()
      };

      marketEvents.emit('market-update', data);
    } catch (error) {
      console.error('Market update failed:', error);
    }

    if (isRunning) {
      setTimeout(updateMarketData, UPDATE_INTERVAL);
    }
  }

  updateMarketData();
}

export function stopMarketUpdates() {
  isRunning = false;
}

export function subscribeToMarketUpdates(callback) {
  marketEvents.on('market-update', callback);
  return () => marketEvents.off('market-update', callback);
}

export function getMarketEvents() {
  return marketEvents;
}