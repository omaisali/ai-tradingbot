export class WebSocketError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'WebSocketError';
  }
}