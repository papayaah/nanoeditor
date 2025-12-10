import { useState } from 'react';
import { createPostCreator, mantinePreset } from '@reactkits.dev/react-writer/posts';
import { usePostEntries } from '@reactkits.dev/react-writer/hooks';

// Using Mantine preset (requires @mantine/core to be installed)
// For this demo, we'll use the tailwind preset as fallback
import { tailwindPreset } from '@reactkits.dev/react-writer/posts';

const PostCreator = createPostCreator(tailwindPreset);

export default function WithCustomAdapter() {
  const {
    currentEntryId,
    handleNewEntry,
    loadEntries,
  } = usePostEntries();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Post Creator with Custom Settings</h1>
        <p style={{ color: '#666', margin: 0 }}>
          This example shows how to use the PostCreator with a custom AI adapter (e.g., OpenAI, Gemini).
          Currently using Chrome AI as the default.
        </p>
      </div>

      <div style={{
        padding: '16px',
        background: '#fff3cd',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffc107',
      }}>
        <strong>Note:</strong> To use a custom AI adapter like OpenAI or Gemini, you would pass
        the <code>aiAdapter</code> prop to the PostCreator or configure it via the usePostCreator hook.
      </div>

      <button
        onClick={handleNewEntry}
        style={{
          padding: '8px 16px',
          marginBottom: '20px',
          background: '#0066cc',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        New Post
      </button>

      <PostCreator
        currentEntryId={currentEntryId}
        onEntrySaved={loadEntries}
      />
    </div>
  );
}
