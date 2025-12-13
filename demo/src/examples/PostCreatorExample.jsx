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
      <Suspense fallback={<EditorShell />}>
        <LazyPostCreator
          currentEntryId={currentEntryId}
          onEntrySaved={loadEntries}
        />
      </Suspense>
    </div>
  );
}
