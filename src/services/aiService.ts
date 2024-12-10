export interface AIAnalysisResponse {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
}

export const analyzeMarketData = async (
  symbol: string,
  price: number,
  volume: number
): Promise<AIAnalysisResponse> => {
  // Simulated AI analysis
  // In production, replace with actual ChatGPT API calls
  const random = Math.random();
  return {
    recommendation: random > 0.6 ? 'BUY' : random > 0.3 ? 'SELL' : 'HOLD',
    confidence: Math.random() * 100,
    reasoning: 'Based on current market trends and analysis'
  };
};