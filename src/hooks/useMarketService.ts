import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import type { MarketDataResponse } from '../services/market/types';

export function useMarketService() {
  const { socket, isConnected, error: wsError, sendMessage } = useWebSocket({
    reconnectAttempts: 10,
    reconnectDelay: 2000,
    heartbeatInterval: 15000
  });
  
  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [collectionStatus, setCollectionStatus] = useState<{
    isCollecting: boolean;
    progress: number;
    currentDate?: Date;
  }>({
    isCollecting: false,
    progress: 0
  });
  const [error, setError] = useState<string | null>(wsError);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const { type, data } = JSON.parse(event.data);
        
        switch (type) {
          case 'market-status':
            setCollectionStatus(prev => ({
              ...prev,
              isCollecting: !data?.isComplete
            }));
            break;
          case 'collection-progress':
            setCollectionStatus({
              isCollecting: true,
              progress: data.progress,
              currentDate: new Date(data.date)
            });
            break;
          case 'collection-complete':
            setCollectionStatus({
              isCollecting: false,
              progress: 100
            });
            break;
          case 'error':
            setError(data.message);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
        setError('Failed to process market data');
      }
    };

    socket.addEventListener('message', handleMessage);
    
    // Request initial status
    if (socket.readyState === WebSocket.OPEN) {
      sendMessage('get-status');
    }

    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, sendMessage]);

  return {
    marketData,
    collectionStatus,
    error,
    isConnected
  };
}