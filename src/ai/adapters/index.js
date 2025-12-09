/**
 * AI Adapters
 * 
 * Export all available AI adapters
 */

export { AIAdapter } from './base.js';
export { ChromeAIAdapter } from './chrome.js';
export { OpenAIAdapter } from './openai.js';
export { GeminiAdapter } from './gemini.js';

/**
 * Create a default adapter (Chrome AI if available, otherwise throws)
 */
export function createDefaultAdapter() {
  return new ChromeAIAdapter();
}

/**
 * Create an adapter from config
 * 
 * @param {Object} config
 * @param {string} [config.type] - 'chrome' | 'openai' | 'gemini'
 * @param {string} [config.apiKey] - API key (required for openai/gemini)
 * @param {string} [config.model] - Model name (e.g., 'gpt-4', 'gemini-1.5-flash')
 */
export function createAdapter(config = {}) {
  const type = config.type || (config.apiKey ? 'openai' : 'chrome');
  
  switch (type) {
    case 'openai':
      return new OpenAIAdapter(config);
    case 'gemini':
      return new GeminiAdapter(config);
    case 'chrome':
    default:
      return new ChromeAIAdapter();
  }
}
