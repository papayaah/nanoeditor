/**
 * Example: Using usePostCreator with Google Gemini (Bring Your Own Key)
 * 
 * Shows how to use different Gemini models: Pro, Flash, Flash Lite
 */

import { useState } from 'react';
import { usePostCreator } from '../hooks/usePostCreator';
import { GeminiAdapter } from '../ai/adapters/gemini';
import { AIAssistantToggle } from '../components/posts/AIAssistantToggle';
import { AIOptionsPanel } from '../components/posts/AIOptionsPanel';

// Available Gemini models
const GEMINI_MODELS = [
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast, Cheap)' },
  { value: 'gemini-1.5-flash-lite', label: 'Gemini 1.5 Flash Lite (Fastest)' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Most Capable)' },
  { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro Latest' },
  { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash Latest' },
  { value: 'gemini-pro', label: 'Gemini Pro (Legacy)' },
];

export function UseWithGemini() {
  const [entryId] = useState(() => Date.now().toString());
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Create adapter with selected model
  const adapter = apiKey ? new GeminiAdapter({
    apiKey: apiKey,
    model: selectedModel, // Switch between models easily!
  }) : null;

  const {
    inputText,
    setInputText,
    currentEntry,
    isGenerating,
    aiAvailable,
    settings,
    handleSubmit,
    handleKeyDown,
    handleCopy,
    charCount,
    wordCount,
  } = usePostCreator({
    currentEntryId: entryId,
    onEntrySaved: () => {},
    aiAdapter: adapter,
  });

  if (!apiKey) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        <h2>Enter Your Google Gemini API Key</h2>
        <p style={{ color: '#666', marginBottom: 16 }}>
          Get your API key from{' '}
          <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
            Google AI Studio
          </a>
        </p>
        <input
          type="password"
          placeholder="AIza..."
          value={apiKey}
          onChange={(e) => {
            const key = e.target.value;
            setApiKey(key);
            localStorage.setItem('gemini_api_key', key);
          }}
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid #e5e5e5',
            borderRadius: 6,
            fontSize: 14,
            marginBottom: 12,
          }}
        />
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid #e5e5e5',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          {GEMINI_MODELS.map(model => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          Your API key is stored locally. Choose your model above.
        </p>
      </div>
    );
  }

  if (!aiAvailable) {
    return (
      <div style={{ padding: 20 }}>
        <p>Checking API key...</p>
      </div>
    );
  }

  const latestSuggestions = 
    currentEntry?.submissions?.[0]?.generations?.[0]?.suggestions || [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Create Your Post</h2>
          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Powered by {selectedModel}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              // Adapter will be recreated with new model on next render
            }}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              border: '1px solid #e5e5e5',
              borderRadius: 4,
            }}
          >
            {GEMINI_MODELS.map(model => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
          <AIAssistantToggle
            isActive={showAIPanel}
            onToggle={() => setShowAIPanel(!showAIPanel)}
            disabled={isGenerating}
          />
          <button
            onClick={() => {
              setApiKey('');
              localStorage.removeItem('gemini_api_key');
            }}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              backgroundColor: 'transparent',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Change Key
          </button>
        </div>
      </div>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What would you like to post?"
        disabled={isGenerating}
        style={{
          width: '100%',
          padding: 16,
          fontSize: 14,
          border: '1px solid #e5e5e5',
          borderRadius: 8,
          minHeight: 120,
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />

      {showAIPanel && (
        <div style={{ marginTop: 16 }}>
          <AIOptionsPanel
            {...settings}
            isGenerating={isGenerating}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ fontSize: 12, color: '#666' }}>
          {charCount} chars, {wordCount} words
        </div>
        <button
          onClick={handleSubmit}
          disabled={!inputText.trim() || isGenerating}
          style={{
            padding: '8px 16px',
            backgroundColor: isGenerating ? '#ccc' : '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Suggestions'}
        </button>
      </div>

      {latestSuggestions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            AI Suggestions ({selectedModel}):
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {latestSuggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  backgroundColor: '#f9fafb',
                }}
              >
                <p style={{ margin: 0, marginBottom: 8, lineHeight: 1.6 }}>
                  {suggestion}
                </p>
                <button
                  onClick={() => handleCopy(suggestion, entryId, `${index}`)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 12,
                    backgroundColor: 'transparent',
                    border: '1px solid #7c3aed',
                    color: '#7c3aed',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
