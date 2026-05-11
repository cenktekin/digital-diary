import { DiaryEntry, OverallAnalysis } from '../types';

export type AIProvider = 'gemini' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface AIProviderService {
  analyzeBrowsingHistory(history: string, lang: 'tr' | 'en'): Promise<DiaryEntry[]>;
  analyzeOverallHabits(entries: DiaryEntry[], lang: 'tr' | 'en'): Promise<OverallAnalysis>;
}

let providerInstance: AIProviderService | null = null;

const getProviderConfig = (): AIConfig => {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'gemini';
  
  if (provider === 'openrouter') {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
    if (!apiKey) throw new Error('OPENROUTER_API_KEY environment variable not set');
    return { provider: 'openrouter', apiKey, model };
  }
  
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!apiKey) throw new Error('API_KEY (or GEMINI_API_KEY) environment variable not set');
  return { provider: 'gemini', apiKey, model };
};

export const getAIProvider = (): AIProviderService => {
  if (providerInstance) return providerInstance;
  
  const config = getProviderConfig();
  
  switch (config.provider) {
    case 'openrouter':
      const { OpenRouterProvider } = require('./openrouterProvider');
      providerInstance = new OpenRouterProvider(config.apiKey, config.model);
      break;
    case 'gemini':
    default:
      const { GeminiProvider } = require('./geminiProvider');
      providerInstance = new GeminiProvider(config.apiKey, config.model);
      break;
  }
  
  return providerInstance;
};

export const resetProvider = () => {
  providerInstance = null;
};
