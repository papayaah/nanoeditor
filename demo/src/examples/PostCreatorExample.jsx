import { useState } from 'react';
import { createPostCreator, tailwindPreset } from '@reactkits.dev/react-writer/posts';
import { usePostEntries } from '@reactkits.dev/react-writer/hooks';

// Using Tailwind preset
const PostCreator = createPostCreator(tailwindPreset);

export default function PostCreatorExample() {
  const {
    currentEntryId,
    handleNewEntry,
    loadEntries,
  } = usePostEntries();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Post Creator Example</h1>
        <button
          onClick={handleNewEntry}
          style={{
            padding: '8px 16px',
            background: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          New Post
        </button>
      </div>
      <PostCreator
        currentEntryId={currentEntryId}
        onEntrySaved={loadEntries}
      />
    </div>
  );
}
