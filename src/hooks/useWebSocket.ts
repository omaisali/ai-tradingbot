import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

interface WebSocketHookOptions {
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export function useWebSocket(options: WebSocketHookOptions = {}) {
  const {
    reconnectAttempts = 5,
    reconnectDelay = 1000,
    heartbeatInterval = 30000
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectCount = useRef(0);
  const heartbeatTimer = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      // Use relative path for WebSocket connection
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
      
      logger.debug('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        logger.info('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
        
        // Start heartbeat
        heartbeatTimer.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, heartbeatInterval);
      };

      ws.onclose = () => {
        logger.info('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        clearInterval(heartbeatTimer.current);
        
        if (reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          setTimeout(connect, reconnectDelay * reconnectCount.current);
        }
      };

      ws.onerror = (event) => {
        logger.error('WebSocket error:', event);
        setError('Failed to connect to market data service');
      };

      setSocket(ws);
    } catch (err) {
      setError('Failed to establish WebSocket connection');
      logger.error('WebSocket connection error:', err);
    }
  }, [reconnectAttempts, reconnectDelay, heartbeatInterval]);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, data?: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      logger.warn('Cannot send message: WebSocket is not connected');
      return;
    }
    
    socket.send(JSON.stringify({ type, data }));
  }, [socket]);

  return {
    socket,
    isConnected,
    error,
    sendMessage
  };
}