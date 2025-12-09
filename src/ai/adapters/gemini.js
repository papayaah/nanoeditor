import { AIAdapter } from './base.js';

/**
 * Google Gemini Adapter
 * Supports all Gemini models: gemini-pro, gemini-1.5-pro, gemini-1.5-flash, gemini-1.5-flash-lite
 * 
 * @example
 * const adapter = new GeminiAdapter({
 *   apiKey: 'your-api-key',
 *   model: 'gemini-1.5-flash', // or 'gemini-1.5-pro', 'gemini-1.5-flash-lite'
 * });
 */
export class GeminiAdapter extends AIAdapter {
  constructor(config = {}) {
    super(config);
    if (!config.apiKey) {
      throw new Error('Gemini adapter requires an apiKey in config');
    }
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://generativelanguage.googleapis.com/v1beta';
    
    // Supported models
    const supportedModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-lite',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
    ];
    
    this.model = config.model || 'gemini-1.5-flash'; // Default to Flash (faster, cheaper)
    
    if (!supportedModels.includes(this.model)) {
      console.warn(`Model ${this.model} may not be supported. Using ${this.model} anyway.`);
    }
  }

  async isAvailable() {
    try {
      // Test API key by listing models
      const response = await fetch(`${this.baseURL}/models?key=${this.apiKey}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async generateText(options) {
    const { 
      prompt, 
      context = '', 
      tone = 'neutral', 
      length = 'short',
      temperature = 0.7,
      maxTokens = 150,
      stream = false 
    } = options;

    const systemInstruction = this._buildSystemInstruction(context, tone, length);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40,
      },
    };

    // Add system instruction if provided
    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{
          text: systemInstruction
        }]
      };
    }

    const url = `${this.baseURL}/models/${this.model}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    if (stream) {
      return this._streamResponse(response);
    } else {
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }
  }

  async rewriteText(options) {
    const { 
      text, 
      context = '', 
      tone = 'as-is', 
      length = 'as-is',
      stream = false 
    } = options;

    const systemInstruction = this._buildRewriteInstruction(context, tone, length);
    const userPrompt = `Rewrite this text: "${text}"`;

    return this.generateText({
      prompt: userPrompt,
      context: systemInstruction,
      stream: stream,
    });
  }

  _buildSystemInstruction(context, tone, length) {
    const toneMap = {
      'casual': 'Write in a casual, friendly, and conversational tone.',
      'neutral': 'Write in a neutral, balanced tone.',
      'formal': 'Write in a formal, professional tone.',
    };

    const lengthMap = {
      'short': 'Keep the response brief and concise (under 100 words).',
      'medium': 'Write a medium-length response (100-200 words).',
      'long': 'Write a longer, more detailed response (200+ words).',
    };

    return [
      'You are a helpful assistant that generates social media posts.',
      context,
      toneMap[tone] || '',
      lengthMap[length] || '',
      'Make the content engaging and appropriate for social media.',
    ].filter(Boolean).join(' ');
  }

  _buildRewriteInstruction(context, tone, length) {
    const instructions = [];
    
    if (tone !== 'as-is') {
      instructions.push(tone === 'more-casual' ? 'Make it more casual' : 'Make it more formal');
    }
    
    if (length !== 'as-is') {
      instructions.push(length === 'shorter' ? 'Make it shorter' : 'Make it longer');
    }

    return [
      'Rewrite the following text for social media.',
      context,
      ...instructions,
    ].filter(Boolean).join(' ');
  }

  async *_streamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const json = JSON.parse(data);
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield text;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
