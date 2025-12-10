import { useState } from 'react';
import { usePostCreator } from '../hooks/usePostCreator';
import { useWriter } from '../hooks/useWriter';
import { useRewriter } from '../hooks/useRewriter';

export default {
  title: 'Hooks/Overview',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Headless hooks for AI-powered writing features.

## Available Hooks

### Post Creator
- **usePostCreator** - Complete post creation logic with AI generation
- **usePostEntries** - CRUD operations for post entries

### AI/Writing
- **useWriter** - Chrome AI Writer API integration
- **useRewriter** - Chrome AI Rewriter API integration

### Documents
- **useDocuments** - Document CRUD operations
- **useMarkdown** - Markdown preview toggle
- **useMarkdownPaste** - Convert pasted HTML to markdown

### Utility
- **useAI** - Check Chrome AI availability
- **useSettings** - UI settings (sidebar, dark mode)
- **useUILibrary** - UI library switching

## Usage

\`\`\`jsx
import { usePostCreator, useWriter } from '@reactkits.dev/react-writer/hooks';

function MyComponent() {
  const { inputText, setInputText, handleSubmit, isGenerating } = usePostCreator({
    currentEntryId: 1,
    onEntrySaved: () => console.log('Saved'),
  });

  return (
    <div>
      <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} />
      <button onClick={handleSubmit} disabled={isGenerating}>
        Generate
      </button>
    </div>
  );
}
\`\`\`
        `,
      },
    },
  },
};

// useWriter Demo
export const UseWriter = {
  name: 'useWriter',
  render: () => {
    const {
      writerAvailable,
      tone,
      setTone,
      format,
      setFormat,
      length,
      setLength,
      generateText,
    } = useWriter();

    const [prompt, setPrompt] = useState('Write a tweet about coding');
    const [result, setResult] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
      setGenerating(true);
      setResult('');
      try {
        const text = await generateText(prompt, '', false);
        setResult(text);
      } catch (error) {
        setResult(`Error: ${error.message}`);
      }
      setGenerating(false);
    };

    return (
      <div style={{ maxWidth: '600px' }}>
        <h3>useWriter Hook</h3>
        <p>
          Writer Available:{' '}
          {writerAvailable ? (
            <span style={{ color: 'green' }}>Yes</span>
          ) : (
            <span style={{ color: 'red' }}>No</span>
          )}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="casual">Casual</option>
              <option value="neutral">Neutral</option>
              <option value="formal">Formal</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="plain-text">Plain Text</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '16px' }}
          rows={3}
        />

        <button
          onClick={handleGenerate}
          disabled={!writerAvailable || generating}
          style={{
            padding: '10px 20px',
            background: writerAvailable ? '#0066cc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: writerAvailable ? 'pointer' : 'not-allowed',
          }}
        >
          {generating ? 'Generating...' : 'Generate'}
        </button>

        {result && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
            <strong>Result:</strong>
            <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
          </div>
        )}
      </div>
    );
  },
};

// useRewriter Demo
export const UseRewriter = {
  name: 'useRewriter',
  render: () => {
    const { rewriterAvailable, rewriteText } = useRewriter();

    const [text, setText] = useState('This is a sample text that I want to rewrite in a different style.');
    const [tone, setTone] = useState('as-is');
    const [format, setFormat] = useState('as-is');
    const [length, setLength] = useState('as-is');
    const [result, setResult] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleRewrite = async () => {
      setGenerating(true);
      setResult('');
      try {
        const rewritten = await rewriteText(text, tone, format, length, '', false);
        setResult(rewritten);
      } catch (error) {
        setResult(`Error: ${error.message}`);
      }
      setGenerating(false);
    };

    return (
      <div style={{ maxWidth: '600px' }}>
        <h3>useRewriter Hook</h3>
        <p>
          Rewriter Available:{' '}
          {rewriterAvailable ? (
            <span style={{ color: 'green' }}>Yes</span>
          ) : (
            <span style={{ color: 'red' }}>No</span>
          )}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="more-casual">More Casual</option>
              <option value="as-is">As Is</option>
              <option value="more-formal">More Formal</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="as-is">As Is</option>
              <option value="plain-text">Plain Text</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="shorter">Shorter</option>
              <option value="as-is">As Is</option>
              <option value="longer">Longer</option>
            </select>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '16px' }}
          rows={4}
        />

        <button
          onClick={handleRewrite}
          disabled={!rewriterAvailable || generating}
          style={{
            padding: '10px 20px',
            background: rewriterAvailable ? '#0066cc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: rewriterAvailable ? 'pointer' : 'not-allowed',
          }}
        >
          {generating ? 'Rewriting...' : 'Rewrite'}
        </button>

        {result && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
            <strong>Result:</strong>
            <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
          </div>
        )}
      </div>
    );
  },
};

// usePostCreator Demo
export const UsePostCreator = {
  name: 'usePostCreator',
  render: () => {
    const [entryId] = useState(Date.now());
    const logic = usePostCreator({
      currentEntryId: entryId,
      onEntrySaved: () => console.log('Entry saved'),
    });

    return (
      <div style={{ maxWidth: '600px' }}>
        <h3>usePostCreator Hook</h3>
        <p>
          AI Available:{' '}
          {logic.aiAvailable ? (
            <span style={{ color: 'green' }}>Yes</span>
          ) : (
            <span style={{ color: 'red' }}>No</span>
          )}
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Input Text</label>
          <textarea
            value={logic.inputText}
            onChange={(e) => logic.setInputText(e.target.value)}
            placeholder="What would you like to post?"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            rows={4}
            onKeyDown={logic.handleKeyDown}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {logic.charCount} chars | {logic.wordCount} words | Press Shift+Enter to generate
          </div>
        </div>

        <button
          onClick={logic.handleSubmit}
          disabled={!logic.inputText.trim() || logic.isGenerating}
          style={{
            padding: '10px 20px',
            background: logic.inputText.trim() ? '#0066cc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: logic.inputText.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {logic.isGenerating ? 'Generating...' : 'Generate'}
        </button>

        {logic.currentEntry && logic.currentEntry.submissions && logic.currentEntry.submissions.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Generated Suggestions</h4>
            {logic.currentEntry.submissions[0]?.generations?.[0]?.suggestions?.map((suggestion, i) => (
              suggestion && (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => logic.handleCopy(suggestion, logic.currentEntry.id, i)}
                >
                  {suggestion}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    );
  },
};
