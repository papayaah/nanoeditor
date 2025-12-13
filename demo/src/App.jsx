import { useState, Suspense } from 'react';
import PostCreatorExample from './examples/PostCreatorExample';
import ArticleEditorExample from './examples/ArticleEditorExample';
import WithCustomAdapter from './examples/WithCustomAdapter';
import FullAppExample from './examples/FullAppExample';

const navStyle = {
  padding: '20px',
  borderBottom: '1px solid #e5e5e5',
  display: 'flex',
  gap: '10px',
  background: '#fff',
};

const buttonStyle = (isActive) => ({
  padding: '8px 16px',
  border: '1px solid #e5e5e5',
  borderRadius: '6px',
  background: isActive ? '#0066cc' : '#fff',
  color: isActive ? '#fff' : '#333',
  cursor: 'pointer',
  fontSize: '14px',
});

function App() {
  const [view, setView] = useState('full-app');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={navStyle}>
        <button
          style={buttonStyle(view === 'full-app')}
          onClick={() => setView('full-app')}
        >
          Full App
        </button>
        <button
          style={buttonStyle(view === 'post-creator')}
          onClick={() => setView('post-creator')}
        >
          Post Creator Only
        </button>
        <button
          style={buttonStyle(view === 'article')}
          onClick={() => setView('article')}
        >
          Article Editor Only
        </button>
        <button
          style={buttonStyle(view === 'custom-adapter')}
          onClick={() => setView('custom-adapter')}
        >
          Custom Adapter
        </button>
      </nav>

      {view === 'full-app' && <FullAppExample />}
      {view === 'post-creator' && <PostCreatorExample />}
      {view === 'article' && <ArticleEditorExample />}
      {view === 'custom-adapter' && <WithCustomAdapter />}
    </div>
  );
}

export default App;
