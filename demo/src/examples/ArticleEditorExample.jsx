import { lazy, Suspense } from 'react';
import { useDocuments } from '@reactkits.dev/react-writer/articles';

// Lazy load the BlockNoteEditor since it has large dependencies
const BlockNoteEditor = lazy(() =>
  import('@reactkits.dev/react-writer/articles').then(m => ({ default: m.BlockNoteEditor }))
);

const LoadingFallback = () => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
    Loading editor...
  </div>
);

export default function ArticleEditorExample() {
  const {
    currentDocId,
    documents,
    handleNewDocument,
    handleSelectDocument,
    handleSave,
    getDocTitle,
  } = useDocuments();

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <aside style={{
        width: '250px',
        borderRight: '1px solid #e5e5e5',
        padding: '20px',
        background: '#fff',
        overflowY: 'auto',
      }}>
        <button
          onClick={handleNewDocument}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
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
      </aside>
      <main style={{ flex: 1, padding: '20px', background: '#fff', overflowY: 'auto' }}>
        {currentDocId ? (
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
        )}
      </main>
    </div>
  );
}
