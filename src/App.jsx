import { useRef, lazy, Suspense } from 'react';
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
import { useDocuments } from './hooks/useDocuments';
import { useMarkdown } from './hooks/useMarkdown';
import { useSettings } from './hooks/useSettings';
import { useAI } from './hooks/useAI';

// Lazy load combined CSS after initial render
if (typeof window !== 'undefined') {
  import('./styles.css');
}

function App() {
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
    setDarkMode,
    docInfoCollapsed,
    setDocInfoCollapsed,
  } = useSettings();

  const {
    aiAvailable,
    showAiModal,
    setShowAiModal,
  } = useAI();

  const exportToPdf = async () => {
    if (!currentDocId || !exportPdfRef.current) return;
    
    try {
      const currentDoc = documents.find(doc => doc.id === currentDocId);
      const docTitle = getDocTitle(currentDoc) || 'document';
      await exportPdfRef.current(docTitle);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };



  if (!currentDocId) {
    return <div className="loading">Loading...</div>;
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
        onSelectDocument={(docId) => handleSelectDocument(docId, () => setShowMarkdown(false))}
        onNewDocument={handleNewDocument}
        onDeleteClick={handleDeleteClick}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        onToggleDocInfo={() => setDocInfoCollapsed(!docInfoCollapsed)}
      />
      
      <div className="main-content">
        <SettingsMenu
          showMarkdown={showMarkdown}
          onToggleMarkdown={() => toggleMarkdown(currentDocId)}
          onCopyMarkdown={copyMarkdown}
          onExportPdf={exportToPdf}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          aiAvailable={aiAvailable}
          onShowAiModal={() => setShowAiModal(true)}
        />
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
      </div>
    </div>
  );
}

export default App;
