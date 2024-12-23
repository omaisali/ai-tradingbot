import type { AIAnalysisResponse } from './types';

export function parseAIResponse(content: string): AIAnalysisResponse {
  try {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      if (isValidAIResponse(parsed)) {
        return parsed;
      }
    } catch {} // Ignore JSON parse errors and try text parsing

    // Text-based parsing
    const recommendation = extractRecommendation(content);
    const confidence = extractConfidence(content);
    const reasoning = extractReasoning(content);
    const risks = extractRisks(content);
    const { supportLevels, resistanceLevels } = extractPriceLevels(content);

    return {
      recommendation,
      confidence,
      reasoning,
      risks,
      supportLevels,
      resistanceLevels
    };
  } catch (error) {
    console.warn('Failed to parse AI response, using default values:', error);
    return {
      recommendation: 'HOLD',
      confidence: 50,
      reasoning: content,
      risks: [],
      supportLevels: [],
      resistanceLevels: []
    };
  }
}

function isValidAIResponse(data: any): data is AIAnalysisResponse {
  return (
    data &&
    typeof data === 'object' &&
    ['BUY', 'SELL', 'HOLD'].includes(data.recommendation) &&
    typeof data.confidence === 'number' &&
    typeof data.reasoning === 'string' &&
    Array.isArray(data.risks) &&
    Array.isArray(data.supportLevels) &&
    Array.isArray(data.resistanceLevels)
  );
}

function extractRecommendation(content: string): 'BUY' | 'SELL' | 'HOLD' {
  const text = content.toUpperCase();
  if (text.includes('STRONG BUY') || text.includes('RECOMMEND BUY')) return 'BUY';
  if (text.includes('STRONG SELL') || text.includes('RECOMMEND SELL')) return 'SELL';
  return 'HOLD';
}

function extractConfidence(content: string): number {
  const confidenceMatch = content.match(/confidence[:\s]+(\d+)%/i);
  return confidenceMatch ? Math.min(100, Math.max(0, parseInt(confidenceMatch[1]))) : 50;
}

function extractReasoning(content: string): string {
  const reasoningMatch = content.match(/reasoning:?\s*([^\n]+)/i);
  return reasoningMatch ? reasoningMatch[1].trim() : content.split('\n')[0];
}

function extractRisks(content: string): string[] {
  const risks: string[] = [];
  const riskSection = content.match(/risks?:?\s*([^\n]+(\n[^\n]+)*)/i);
  
  if (riskSection) {
    const riskText = riskSection[1];
    risks.push(...riskText.split(/[•\-\n]/).map(risk => risk.trim()).filter(Boolean));
  }

  return risks;
}

function extractPriceLevels(content: string): {
  supportLevels: number[];
  resistanceLevels: number[];
} {
  const supportLevels: number[] = [];
  const resistanceLevels: number[] = [];

  // Extract support levels
  const supportMatch = content.match(/support[:\s]+([0-9,.\s]+)/i);
  if (supportMatch) {
    supportLevels.push(...supportMatch[1].split(/[,\s]+/).map(Number).filter(n => !isNaN(n)));
  }

  // Extract resistance levels
  const resistanceMatch = content.match(/resistance[:\s]+([0-9,.\s]+)/i);
  if (resistanceMatch) {
    resistanceLevels.push(...resistanceMatch[1].split(/[,\s]+/).map(Number).filter(n => !isNaN(n)));
  }

  return { supportLevels, resistanceLevels };
}