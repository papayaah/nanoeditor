# AI Adapters - Bring Your Own Key (BYOK)

This package supports using your own AI API keys instead of Chrome's built-in AI.

## Quick Start

```jsx
import { usePostCreator } from '@buzzer/writer';
import { OpenAIAdapter } from '@buzzer/writer/ai/adapters/openai';

// Create adapter with your API key
const adapter = new OpenAIAdapter({
  apiKey: 'sk-your-key-here',
  model: 'gpt-3.5-turbo',
});

// Use it in the hook
const { inputText, setInputText, handleSubmit } = usePostCreator({
  currentEntryId: entryId,
  aiAdapter: adapter, // Pass your adapter
});
```

## Available Adapters

### Chrome AI (Default)
- No API key needed
- Free, but requires Chrome Canary

```jsx
import { ChromeAIAdapter } from '@buzzer/writer/ai/adapters/chrome';
const adapter = new ChromeAIAdapter();
```

### OpenAI
- Requires API key from https://platform.openai.com
- Supports GPT-3.5-turbo and GPT-4

```jsx
import { OpenAIAdapter } from '@buzzer/writer/ai/adapters/openai';
const adapter = new OpenAIAdapter({
  apiKey: 'sk-...',
  model: 'gpt-3.5-turbo', // or 'gpt-4'
});
```

## Creating Custom Adapters

Extend the `AIAdapter` base class:

```jsx
import { AIAdapter } from '@buzzer/writer/ai/adapters/base';

class MyCustomAdapter extends AIAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
  }

  async isAvailable() {
    // Check if your service is available
    return true;
  }

  async generateText(options) {
    const { prompt, context, tone, length, stream } = options;
    
    // Call your AI service
    const response = await fetch('https://your-ai-service.com/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context, tone, length }),
    });

    if (stream) {
      // Return async iterable for streaming
      return this._streamResponse(response);
    } else {
      const data = await response.json();
      return data.text;
    }
  }

  async rewriteText(options) {
    // Similar to generateText but for rewriting
  }
}
```

## Adapter Interface

All adapters must implement:

- `isAvailable()` - Check if service is available
- `generateText(options)` - Generate text from prompt
- `rewriteText(options)` - Rewrite existing text

Both `generateText` and `rewriteText` should support:
- Streaming responses (return `AsyncIterable<string>`)
- Non-streaming responses (return `Promise<string>`)

See `adapters/base.js` for the full interface.
