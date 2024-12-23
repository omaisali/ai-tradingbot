export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface WebSocketConfig {
  url: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
}