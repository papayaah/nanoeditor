import { useState, useRef } from 'react';
import { lazy, Suspense } from 'react';
import { PostCreator } from '../components/posts/PostCreator';
import { MantineProvider } from '@mantine/core';
import '../components/posts/PostCreator.css';

const DocumentEditor = lazy(() => import('../components/documents/DocumentEditor'));

export default {
  title: 'Examples/Integration',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Examples showing how to integrate both components in a real application.',
      },
    },
  },
};

export const SideBySide = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [docId] = useState('demo-doc');
  const [entryId] = useState('demo-entry');
  const exportPdfRef = useRef(null);

  const handleSave = (content) => {
    console.log('Document saved:', content);
  };

  const handleEntrySaved = () => {
    console.log('Post entry saved');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        <button
          onClick={() => setActiveTab('editor')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'editor' ? '#fff' : 'transparent',
            borderBottom: activeTab === 'editor' ? '2px solid #3b82f6' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'editor' ? '600' : '400',
            color: activeTab === 'editor' ? '#1e40af' : '#6b7280',
          }}
        >
          📝 Document Editor
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'posts' ? '#fff' : 'transparent',
            borderBottom: activeTab === 'posts' ? '2px solid #3b82f6' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'posts' ? '600' : '400',
            color: activeTab === 'posts' ? '#1e40af' : '#6b7280',
          }}
        >
          📱 Post Creator
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'editor' ? (
          <MantineProvider>
            <Suspense fallback={<div style={{ padding: '60px', color: '#9b9a97' }}>Loading editor...</div>}>
              <div style={{ padding: '20px', height: '100%' }}>
                <DocumentEditor
                  docId={docId}
                  onSave={handleSave}
                  onExportPdf={exportPdfRef}
                  darkMode={false}
                />
              </div>
            </Suspense>
          </MantineProvider>
        ) : (
          <PostCreator
            currentEntryId={entryId}
            onEntrySaved={handleEntrySaved}
            darkMode={false}
          />
        )}
      </div>
    </div>
  );
};

SideBySide.parameters = {
  docs: {
    description: {
      story: 'A tabbed interface showing both the Document Editor and Post Creator. This demonstrates how you might integrate both components in a single application.',
    },
  },
};

export const MinimalSetup = () => {
  const [docId] = useState('minimal-doc');
  const exportPdfRef = useRef(null);

  return (
    <MantineProvider>
      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', fontFamily: 'system-ui' }}>Minimal Editor Setup</h1>
        <p style={{ marginBottom: '30px', color: '#6b7280' }}>
          This shows the absolute minimum code needed to integrate the DocumentEditor component.
        </p>
        <Suspense fallback={<div>Loading...</div>}>
          <DocumentEditor
            docId={docId}
            onSave={(content) => console.log('Saved:', content)}
            onExportPdf={exportPdfRef}
            darkMode={false}
          />
        </Suspense>
      </div>
    </MantineProvider>
  );
};

MinimalSetup.parameters = {
  docs: {
    description: {
      story: 'The simplest possible integration of the DocumentEditor component with minimal styling and configuration.',
    },
  },
};

export const MinimalPostCreator = () => {
  const [entryId] = useState('minimal-entry');

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', fontFamily: 'system-ui' }}>Minimal Post Creator Setup</h1>
      <p style={{ marginBottom: '30px', color: '#6b7280' }}>
        This shows the absolute minimum code needed to integrate the PostCreator component.
      </p>
      <PostCreator
        currentEntryId={entryId}
        onEntrySaved={() => console.log('Entry saved')}
        darkMode={false}
      />
    </div>
  );
};

MinimalPostCreator.parameters = {
  docs: {
    description: {
      story: 'The simplest possible integration of the PostCreator component with minimal configuration.',
    },
  },
};

export const CodeExample = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: '20px' }}>Integration Code Examples</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>DocumentEditor</h2>
        <pre style={{ 
          background: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '14px',
          border: '1px solid #e5e7eb'
        }}>
{`import { lazy, Suspense, useRef } from 'react';
import { MantineProvider } from '@mantine/core';

const DocumentEditor = lazy(() => 
  import('nano-editor/DocumentEditor')
);

function App() {
  const exportPdfRef = useRef(null);
  
  const handleSave = (content) => {
    // Save to your backend or local storage
    console.log('Document saved:', content);
  };

  return (
    <MantineProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentEditor
          docId="unique-doc-id"
          onSave={handleSave}
          onExportPdf={exportPdfRef}
          darkMode={false}
        />
      </Suspense>
    </MantineProvider>
  );
}`}
        </pre>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>PostCreator</h2>
        <pre style={{ 
          background: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '14px',
          border: '1px solid #e5e7eb'
        }}>
{`import { PostCreator } from 'nano-editor/PostCreator';

function App() {
  const handleEntrySaved = () => {
    // Handle entry save
    console.log('Entry saved');
  };

  return (
    <PostCreator
      currentEntryId="unique-entry-id"
      onEntrySaved={handleEntrySaved}
      darkMode={false}
    />
  );
}`}
        </pre>
      </section>

      <section>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Required Peer Dependencies</h2>
        <pre style={{ 
          background: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '14px',
          border: '1px solid #e5e7eb'
        }}>
{`npm install react react-dom
npm install @mantine/core @mantine/hooks
npm install @blocknote/core @blocknote/react @blocknote/mantine
npm install dexie lucide-react react-markdown`}
        </pre>
      </section>
    </div>
  );
};

CodeExample.parameters = {
  docs: {
    description: {
      story: 'Code examples showing how to integrate the components in your own project.',
    },
  },
};
