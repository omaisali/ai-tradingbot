class RateLimiter {
  private lastCall: number = 0;
  private minInterval: number;

  constructor(minInterval: number) {
    this.minInterval = minInterval;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    
    this.lastCall = Date.now();
  }
}

export const rateLimiter = new RateLimiter(100); // 100ms between requests