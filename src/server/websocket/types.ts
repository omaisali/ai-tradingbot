import { WebSocket } from 'ws';

export interface WebSocketClient {
  ws: WebSocket;
  id: string;
  isAlive: boolean;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
}