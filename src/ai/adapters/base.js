/**
 * Base AI Adapter Interface
 * 
 * All AI adapters must implement this interface to work with the post creator.
 */

/**
 * @typedef {Object} GenerateTextOptions
 * @property {string} prompt - The text prompt to generate from
 * @property {string} [context] - Additional context for generation
 * @property {'casual'|'neutral'|'formal'} [tone] - Tone of the generated text
 * @property {'plain-text'|'markdown'} [format] - Output format
 * @property {'short'|'medium'|'long'} [length] - Desired length
 * @property {number} [temperature] - Temperature (0-1 or 0-2 depending on provider)
 * @property {number} [topP] - Top P sampling
 * @property {number} [maxTokens] - Maximum tokens to generate
 * @property {boolean} [stream] - Whether to stream the response
 * @property {boolean} [stripEmojis] - Whether to strip emojis from output
 */

/**
 * @typedef {Object} RewriteTextOptions
 * @property {string} text - The text to rewrite
 * @property {string} [context] - Additional context
 * @property {'more-casual'|'as-is'|'more-formal'} [tone] - Tone adjustment
 * @property {'as-is'|'markdown'|'plain-text'} [format] - Output format
 * @property {'shorter'|'as-is'|'longer'} [length] - Length adjustment
 * @property {boolean} [stream] - Whether to stream the response
 * @property {boolean} [stripEmojis] - Whether to strip emojis from output
 */

/**
 * AI Adapter Interface
 * 
 * @interface AIAdapter
 */
export class AIAdapter {
  /**
   * @param {Object} config - Adapter configuration
   * @param {string} [config.apiKey] - API key for the service
   * @param {string} [config.baseURL] - Base URL for the API
   * @param {string} [config.model] - Model name to use
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Get the adapter name
   * @returns {string}
   */
  getName() {
    return this.constructor.name.toLowerCase().replace('adapter', '');
  }

  /**
   * Check if the AI service is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('isAvailable() must be implemented by adapter');
  }

  /**
   * Generate text from a prompt
   * @param {GenerateTextOptions} options
   * @returns {Promise<string|AsyncIterable<string>>}
   */
  async generateText(options) {
    throw new Error('generateText() must be implemented by adapter');
  }

  /**
   * Rewrite existing text
   * @param {RewriteTextOptions} options
   * @returns {Promise<string|AsyncIterable<string>>}
   */
  async rewriteText(options) {
    throw new Error('rewriteText() must be implemented by adapter');
  }

  /**
   * Update adapter configuration
   * @param {Object} config
   */
  configure(config) {
    this.config = { ...this.config, ...config };
  }
}
