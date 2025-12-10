import { useState, useEffect } from 'react';
import { ChromeAIAdapter, OpenAIAdapter, GeminiAdapter, createAdapter } from '../ai/adapters';

export default {
  title: 'AI/Adapters',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
AI Adapters provide a unified interface for different AI providers.

## Available Adapters
- **ChromeAIAdapter** - Uses Chrome's built-in AI (Writer/Rewriter APIs)
- **OpenAIAdapter** - Uses OpenAI's Chat Completions API
- **GeminiAdapter** - Uses Google's Gemini API

## Usage

\`\`\`jsx
import { createAdapter, ChromeAIAdapter, OpenAIAdapter } from '@reactkits.dev/react-writer/hooks';

// Default (Chrome AI)
const adapter = createAdapter();

// OpenAI
const openaiAdapter = createAdapter({
  type: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-4',
});

// Gemini
const geminiAdapter = createAdapter({
  type: 'gemini',
  apiKey: 'AIza...',
  model: 'gemini-1.5-flash',
});
\`\`\`
        `,
      },
    },
  },
};

// Chrome AI Adapter Demo
export const ChromeAI = {
  render: () => {
    const [available, setAvailable] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState('');
    const [prompt, setPrompt] = useState('Write a short social media post about productivity');

    useEffect(() => {
      const adapter = new ChromeAIAdapter();
      adapter.isAvailable().then(setAvailable);
    }, []);

    const handleGenerate = async () => {
      setGenerating(true);
      setResult('');
      try {
        const adapter = new ChromeAIAdapter();
        const text = await adapter.generateText({
          prompt,
          tone: 'casual',
          format: 'plain-text',
          length: 'short',
        });
        setResult(text);
      } catch (error) {
        setResult(`Error: ${error.message}`);
      }
      setGenerating(false);
    };

    return (
      <div style={{ maxWidth: '600px' }}>
        <h3>Chrome AI Adapter</h3>
        <p>
          Status:{' '}
          {available === null ? (
            'Checking...'
          ) : available ? (
            <span style={{ color: 'green' }}>Available</span>
          ) : (
            <span style={{ color: 'red' }}>Not Available</span>
          )}
        </p>
        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
            }}
            rows={3}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={!available || generating}
          style={{
            padding: '10px 20px',
            background: available ? '#0066cc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: available ? 'pointer' : 'not-allowed',
          }}
        >
          {generating ? 'Generating...' : 'Generate'}
        </button>
        {result && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '6px',
            }}
          >
            <strong>Result:</strong>
            <p>{result}</p>
          </div>
        )}
      </div>
    );
  },
};

// Adapter Factory Demo
export const AdapterFactory = {
  render: () => {
    const [adapterType, setAdapterType] = useState('chrome');
    const [apiKey, setApiKey] = useState('');

    const handleCreate = () => {
      const config = { type: adapterType };
      if (apiKey) config.apiKey = apiKey;

      const adapter = createAdapter(config);
      console.log('Created adapter:', adapter.getName());
      alert(`Created ${adapter.getName()} adapter!`);
    };

    return (
      <div style={{ maxWidth: '400px' }}>
        <h3>Adapter Factory</h3>
        <p>Create adapters using the factory function.</p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Adapter Type:</label>
          <select
            value={adapterType}
            onChange={(e) => setAdapterType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            <option value="chrome">Chrome AI (free)</option>
            <option value="openai">OpenAI (requires API key)</option>
            <option value="gemini">Gemini (requires API key)</option>
          </select>
        </div>

        {adapterType !== 'chrome' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter ${adapterType} API key`}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
          </div>
        )}

        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Create Adapter
        </button>

        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <strong>Code:</strong>
          <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
{`import { createAdapter } from '@reactkits.dev/react-writer/hooks';

const adapter = createAdapter({
  type: '${adapterType}',${adapterType !== 'chrome' ? `
  apiKey: '${apiKey || 'YOUR_API_KEY'}',` : ''}
});`}
          </pre>
        </div>
      </div>
    );
  },
};
