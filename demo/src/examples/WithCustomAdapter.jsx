import { lazy, Suspense } from 'react';
import { usePostEntries } from '@reactkits.dev/react-writer/hooks';

// Lazy load PostCreator with its CSS
const LazyPostCreator = lazy(() =>
  Promise.all([
    import('@reactkits.dev/react-writer/posts'),
    import('@reactkits.dev/react-writer/styles/posts.css'),
  ]).then(([m]) => {
    const PostCreator = m.createPostCreator(m.tailwindPreset);
    return { default: PostCreator };
  })
);

// Empty shell - no loading text for better LCP
const EditorShell = () => <div style={{ minHeight: '400px', background: '#fff' }} />;

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

      <Suspense fallback={<EditorShell />}>
        <LazyPostCreator
          currentEntryId={currentEntryId}
          onEntrySaved={loadEntries}
        />
      </Suspense>
    </div>
  );
}
