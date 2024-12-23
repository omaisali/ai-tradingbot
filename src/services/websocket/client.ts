import { WebSocketError } from './errors';
import type { WebSocketMessage, WebSocketConfig } from './types';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;

  constructor(private readonly config: WebSocketConfig) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.config.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.config.onMessage?.(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          this.config.onError?.(new WebSocketError('WebSocket error', error));
          this.handleReconnect();
        };

        this.ws.onclose = () => {
          this.config.onDisconnect?.();
          this.handleReconnect();
        };
      } catch (error) {
        reject(new WebSocketError('Failed to connect to WebSocket', error));
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.config.onError?.(new WebSocketError('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketError('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
  }
}