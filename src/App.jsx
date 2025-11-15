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
import { Footer } from './components/Footer';
import { useDocuments } from './hooks/useDocuments';
import { usePostEntries } from './hooks/usePostEntries';
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
    sortBy: docSortBy,
    getDocTitle,
    handleSave,
    handleNewDocument,
    handleSelectDocument,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    toggleSort: toggleDocSort,
  } = useDocuments();

  const {
    currentEntryId,
    entries: postEntries,
    deleteConfirmId: entryDeleteConfirmId,
    deleteToast: entryDeleteToast,
    sortBy,
    getEntryTitle,
    handleSaveEntry,
    handleNewEntry,
    handleSelectEntry,
    handleDeleteClick: handleDeleteEntryClick,
    handleCancelDelete: handleCancelDeleteEntry,
    handleConfirmDelete: handleConfirmDeleteEntry,
    loadEntries,
    toggleSort,
  } = usePostEntries();

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

  // Combine toasts from both hooks
  const activeToast = deleteToast || entryDeleteToast;

  return (
    <div className="app">
      {activeToast && (
        <div className={`toast ${activeToast.type}`}>
          {activeToast.type === 'success' ? (
            <Check size={20} />
          ) : (
            <X size={20} />
          )}
          <span>{activeToast.message}</span>
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
        onNewPost={async () => {
          await handleNewEntry();
          await loadEntries();
        }}
        onDeleteClick={handleDeleteClick}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        onToggleDocInfo={() => setDocInfoCollapsed(!docInfoCollapsed)}
        onTogglePostSettings={() => setPostSettingsCollapsed(!postSettingsCollapsed)}
        onNavigate={navigate}
        currentRoute={currentRoute}
        postSettings={postSettings}
        // Post entries props
        postEntries={postEntries}
        currentEntryId={currentEntryId}
        onSelectEntry={(entryId) => {
          handleSelectEntry(entryId);
        }}
        onDeleteEntryClick={handleDeleteEntryClick}
        onConfirmDeleteEntry={handleConfirmDeleteEntry}
        onCancelDeleteEntry={handleCancelDeleteEntry}
        entryDeleteConfirmId={entryDeleteConfirmId}
        getEntryTitle={getEntryTitle}
        sortBy={sortBy}
        onToggleSort={toggleSort}
        // Document sorting props
        docSortBy={docSortBy}
        onToggleDocSort={toggleDocSort}
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
            currentEntryId={currentEntryId}
            onEntrySaved={loadEntries}
            onNewEntry={handleNewEntry}
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
      <Footer />
    </div>
  );
}

export default App;
