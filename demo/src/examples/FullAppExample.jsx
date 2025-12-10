import { useState, lazy, Suspense } from 'react';
import { createPostCreator, tailwindPreset } from '@reactkits.dev/react-writer/posts';
import { useDocuments } from '@reactkits.dev/react-writer/articles';
import { usePostEntries } from '@reactkits.dev/react-writer/hooks';

// Lazy load BlockNoteEditor
const BlockNoteEditor = lazy(() =>
  import('@reactkits.dev/react-writer/articles').then(m => ({ default: m.BlockNoteEditor }))
);

const PostCreator = createPostCreator(tailwindPreset);

const LoadingFallback = () => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
    Loading...
  </div>
);

export default function FullAppExample() {
  // Default to 'articles' - a neutral starting point
  // Note: The demo doesn't persist navigation state - that's up to the consumer app
  const [mode, setMode] = useState('articles');

  const {
    currentDocId,
    documents,
    handleNewDocument,
    handleSelectDocument,
    handleSave,
    getDocTitle,
  } = useDocuments();

  const {
    currentEntryId,
    entries: postEntries,
    handleNewEntry,
    handleSelectEntry,
    loadEntries,
    getEntryTitle,
  } = usePostEntries();

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        borderRight: '1px solid #e5e5e5',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Mode Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e5e5',
        }}>
          <button
            onClick={() => setMode('articles')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: mode === 'articles' ? '#fff' : '#f5f5f5',
              borderBottom: mode === 'articles' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: mode === 'articles' ? 'bold' : 'normal',
            }}
          >
            Articles
          </button>
          <button
            onClick={() => setMode('posts')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: mode === 'posts' ? '#fff' : '#f5f5f5',
              borderBottom: mode === 'posts' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: mode === 'posts' ? 'bold' : 'normal',
            }}
          >
            Posts
          </button>
        </div>

        {/* Content List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {mode === 'articles' ? (
            <>
              <button
                onClick={handleNewDocument}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '16px',
                  background: '#0066cc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                New Article
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {documents.map(doc => (
                  <li key={doc.id} style={{ marginBottom: '8px' }}>
                    <button
                      onClick={() => handleSelectDocument(doc.id)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        textAlign: 'left',
                        background: doc.id === currentDocId ? '#e6f0ff' : '#f5f5f5',
                        border: doc.id === currentDocId ? '1px solid #0066cc' : '1px solid transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getDocTitle(doc)}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <button
                onClick={handleNewEntry}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '16px',
                  background: '#0066cc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                New Post
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {postEntries.map(entry => (
                  <li key={entry.id} style={{ marginBottom: '8px' }}>
                    <button
                      onClick={() => handleSelectEntry(entry.id)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        textAlign: 'left',
                        background: entry.id === currentEntryId ? '#e6f0ff' : '#f5f5f5',
                        border: entry.id === currentEntryId ? '1px solid #0066cc' : '1px solid transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getEntryTitle(entry)}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: '#fff', overflowY: 'auto' }}>
        {mode === 'articles' ? (
          currentDocId ? (
            <Suspense fallback={<LoadingFallback />}>
              <BlockNoteEditor
                docId={currentDocId}
                onSave={handleSave}
                darkMode={false}
              />
            </Suspense>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>
              Select or create an article to get started
            </div>
          )
        ) : (
          <div style={{ padding: '20px' }}>
            <PostCreator
              currentEntryId={currentEntryId}
              onEntrySaved={loadEntries}
            />
          </div>
        )}
      </main>
    </div>
  );
}
