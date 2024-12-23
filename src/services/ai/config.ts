export const AI_CONFIG = {
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.7,
  baseUrl: 'https://api.openai.com',
  defaultPrompt: `You are an expert cryptocurrency trading analyst. Analyze the provided market data and technical indicators to generate trading recommendations.

Please provide your analysis in the following format:
- Recommendation: [BUY/SELL/HOLD]
- Confidence: [0-100]%
- Reasoning: Brief explanation of your recommendation
- Risks: List key risks
- Support Levels: List important support price levels
- Resistance Levels: List important resistance price levels

Base your analysis on:
1. Technical indicators (RSI, MACD, Moving Averages)
2. Price action and volume
3. Market trends and momentum
4. Risk/reward ratio

Keep your response concise and actionable.`
} as const;