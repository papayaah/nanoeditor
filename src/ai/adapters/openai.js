import { AIAdapter } from './base.js';

/**
 * OpenAI Adapter
 * Uses OpenAI API with your own API key
 */
export class OpenAIAdapter extends AIAdapter {
  constructor(config = {}) {
    super(config);
    if (!config.apiKey) {
      throw new Error('OpenAI adapter requires an apiKey in config');
    }
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-3.5-turbo';
  }

  async isAvailable() {
    // Check if API key is valid by making a test request
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
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

    const systemPrompt = this._buildSystemPrompt(context, tone, length);
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        stream: stream,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    if (stream) {
      return this._streamResponse(response);
    } else {
      const data = await response.json();
      return data.choices[0].message.content;
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

    const systemPrompt = this._buildRewritePrompt(context, tone, length);
    const userPrompt = `Rewrite this text: "${text}"`;

    return this.generateText({
      prompt: userPrompt,
      context: systemPrompt,
      stream: stream,
    });
  }

  _buildSystemPrompt(context, tone, length) {
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

  _buildRewritePrompt(context, tone, length) {
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
              const content = json.choices[0]?.delta?.content;
              if (content) {
                yield content;
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
