/**
 * Example: Using usePostCreator hook with your existing form/textarea
 * 
 * This shows how to integrate AI capabilities into an app that already
 * has a textarea or form component.
 */

import { useState } from 'react';
import { usePostCreator } from '../hooks/usePostCreator';
import { AIAssistantToggle } from '../components/posts/AIAssistantToggle';
import { AIOptionsPanel } from '../components/posts/AIOptionsPanel';

export function UseWithExistingForm() {
  // Create a unique entry ID for this session
  const [entryId] = useState(() => Date.now().toString());
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Use the headless hook - it manages all AI logic
  const {
    inputText,
    setInputText,
    currentEntry,
    isGenerating,
    aiAvailable,
    settings,
    handleSubmit,
    handleKeyDown,
    handleRegenerate,
    handleCopy,
    charCount,
    wordCount,
    textareaRef,
  } = usePostCreator({
    currentEntryId: entryId,
    onEntrySaved: () => {
      console.log('Entry saved to IndexedDB');
    },
  });

  // Check if AI is available
  if (!aiAvailable) {
    return (
      <div style={{ padding: 20 }}>
        <p>Chrome AI is not available. Please use Chrome Canary with AI features enabled.</p>
      </div>
    );
  }

  // Get the latest suggestions
  const latestSuggestions = 
    currentEntry?.submissions?.[0]?.generations?.[0]?.suggestions || [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Create Your Post</h2>
        <AIAssistantToggle
          isActive={showAIPanel}
          onToggle={() => setShowAIPanel(!showAIPanel)}
          disabled={isGenerating}
        />
      </div>

      {/* Your existing textarea - just connect it to the hook */}
      <textarea
        ref={textareaRef}
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

      {/* AI Options Panel - appears when toggle is active */}
      {showAIPanel && (
        <div style={{ marginTop: 16 }}>
          <AIOptionsPanel
            {...settings}
            isGenerating={isGenerating}
          />
        </div>
      )}

      {/* Form controls */}
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

      {/* Display AI suggestions */}
      {latestSuggestions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            AI Suggestions:
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

      {/* Regenerate button (if there are suggestions) */}
      {latestSuggestions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e5e5',
              borderRadius: 6,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
