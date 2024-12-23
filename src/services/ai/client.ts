import { AI_CONFIG } from './config';
import type { AIAnalysisRequest, AIAnalysisResponse } from './types';
import { parseAIResponse } from './parser';

let apiKey: string | null = null;

export function initializeAI(key: string): void {
  if (!key) throw new Error('OpenAI API key is required');
  apiKey = key;
}

export async function analyzeMarket(data: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const prompt = generateAnalysisPrompt(data);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: AI_CONFIG.defaultPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI analysis request failed');
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from AI service');
    }

    return parseAIResponse(content);
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw error;
  }
}

function generateAnalysisPrompt(data: AIAnalysisRequest): string {
  const { marketData, technicalIndicators } = data;
  
  return `
Current Market Data:
- Price: $${marketData.price.toLocaleString()}
- 24h Volume: $${marketData.volume.toLocaleString()}

Technical Analysis:
- RSI: ${technicalIndicators.rsi.toFixed(2)} (${getRSIInterpretation(technicalIndicators.rsi)})
- MACD: ${technicalIndicators.macd.value.toFixed(2)} (Signal: ${technicalIndicators.macd.signal.toFixed(2)})
- MACD Histogram: ${technicalIndicators.macd.histogram.toFixed(2)} (${getMACDTrend(technicalIndicators.macd.histogram)})
- Moving Averages: SMA20 ${technicalIndicators.sma.short.toFixed(2)} vs SMA50 ${technicalIndicators.sma.long.toFixed(2)}
- Bollinger Bands: Upper ${technicalIndicators.bollingerBands.upper.toFixed(2)}, Middle ${technicalIndicators.bollingerBands.middle.toFixed(2)}, Lower ${technicalIndicators.bollingerBands.lower.toFixed(2)}

Please analyze this data and provide a trading recommendation.`;
}

function getRSIInterpretation(rsi: number): string {
  if (rsi > 70) return 'Overbought';
  if (rsi < 30) return 'Oversold';
  return 'Neutral';
}

function getMACDTrend(histogram: number): string {
  return histogram > 0 ? 'Bullish' : 'Bearish';
}