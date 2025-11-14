import { useRef, lazy, Suspense, useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  X,
  Check
} from 'lucide-react';
import { Shell } from './Shell';
import { SettingsMenu } from './components/SettingsMenu';

const BlockNoteEditor = lazy(() => import('./components/BlockNoteEditor'));
import { ChromeAiSetup } from './components/ChromeAiSetup';
import { Sidebar } from './components/Sidebar';
import { PostHelper } from './components/posts/PostHelper';
import { useDocuments } from './hooks/useDocuments';
import { useMarkdown } from './hooks/useMarkdown';
import { useSettings } from './hooks/useSettings';
import { useAI } from './hooks/useAI';

// Lazy load combined CSS after initial render
if (typeof window !== 'undefined') {
  import('./styles.css');
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [postSettings, setPostSettings] = useState(null);

  // Simple routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };
  const exportPdfRef = useRef(null);
  
  // Custom hooks
  const {
    currentDocId,
    documents,
    deleteConfirmId,
    deleteToast,
    getDocTitle,
    handleSave,
    handleNewDocument,
    handleSelectDocument,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
  } = useDocuments();

  const {
    showMarkdown,
    markdown,
    toggleMarkdown,
    copyMarkdown,
    setShowMarkdown,
  } = useMarkdown();

  const {
    showSidebar,
    setShowSidebar,
    darkMode,
    docInfoCollapsed,
    setDocInfoCollapsed,
  } = useSettings();

  const [postSettingsCollapsed, setPostSettingsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('postSettingsCollapsed');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('postSettingsCollapsed', postSettingsCollapsed.toString());
    } catch {}
  }, [postSettingsCollapsed]);

  const {
    aiAvailable,
    showAiModal,
    setShowAiModal,
  } = useAI();

  if (!currentDocId && currentRoute !== '/posts') {
    return <Shell />;
  }

  return (
    <div className="app">
      {deleteToast && (
        <div className={`toast ${deleteToast.type}`}>
          {deleteToast.type === 'success' ? (
            <Check size={20} />
          ) : (
            <X size={20} />
          )}
          <span>{deleteToast.message}</span>
        </div>
      )}
      {showAiModal && <ChromeAiSetup onClose={() => setShowAiModal(false)} />}
      <button onClick={() => setShowSidebar(!showSidebar)} className="sidebar-toggle-btn" aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}>
        <ChevronLeft size={18} style={{ transform: showSidebar ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
      </button>
      
      <Sidebar
        documents={documents}
        currentDocId={currentDocId}
        showSidebar={showSidebar}
        deleteConfirmId={deleteConfirmId}
        docInfoCollapsed={docInfoCollapsed}
        postSettingsCollapsed={postSettingsCollapsed}
        onSelectDocument={(docId) => {
          handleSelectDocument(docId, () => setShowMarkdown(false));
          navigate('/');
        }}
        onNewDocument={handleNewDocument}
        onNewPost={() => window.handleNewPost?.()}
        onDeleteClick={handleDeleteClick}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        onToggleDocInfo={() => setDocInfoCollapsed(!docInfoCollapsed)}
        onTogglePostSettings={() => setPostSettingsCollapsed(!postSettingsCollapsed)}
        onNavigate={navigate}
        currentRoute={currentRoute}
        postSettings={postSettings}
      />
      
      <div className="main-content">
        <SettingsMenu
          showMarkdown={showMarkdown}
          onToggleMarkdown={() => toggleMarkdown(currentDocId)}
          onCopyMarkdown={copyMarkdown}
          exportPdfRef={exportPdfRef}
          currentDocId={currentDocId}
          documents={documents}
          getDocTitle={getDocTitle}
          aiAvailable={aiAvailable}
          onShowAiModal={() => setShowAiModal(true)}
        />
        {currentRoute === '/posts' ? (
          <PostHelper 
            onNewPost={() => window.handleNewPost?.()} 
            darkMode={darkMode}
            onSettingsExport={setPostSettings}
          />
        ) : (
          <div className="editor-container">
            <div className="editor-wrapper">
              {showMarkdown ? (
                <div className="markdown-preview">
                  <pre>{markdown}</pre>
                </div>
              ) : (
                <Suspense fallback={<Shell />}>
                  <BlockNoteEditor 
                    key={currentDocId} 
                    docId={currentDocId} 
                    onSave={handleSave} 
                    onExportPdf={exportPdfRef} 
                    darkMode={darkMode}
                  />
                </Suspense>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
