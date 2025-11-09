import { useEffect, useState, useRef } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { 
  useCreateBlockNote,
  FormattingToolbar,
  FormattingToolbarController,
  BlockTypeSelect,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton
} from '@blocknote/react';
import '@blocknote/mantine/style.css';
import { 
  ChevronLeft, 
  X,
  Check
} from 'lucide-react';
import { loadDocument } from './db';
import { WriterPrompt } from './components/WriterPrompt';
import { RewriteButton } from './components/RewriteButton';
import { StreamingBlockIndicator } from './components/StreamingBlockIndicator';
import { SettingsMenu } from './components/SettingsMenu';
import { ChromeAiSetup } from './components/ChromeAiSetup';
import { Sidebar } from './components/Sidebar';
import { useDocuments } from './hooks/useDocuments';
import { useMarkdown } from './hooks/useMarkdown';
import { useSettings } from './hooks/useSettings';
import { useAI } from './hooks/useAI';
import { useMarkdownPaste } from './hooks/useMarkdownPaste';
import { usePdfExport } from './hooks/usePdfExport';
import './App.css';

function Editor({ docId, onSave, onExportPdf, darkMode }) {
  const [initialContent, setInitialContent] = useState(undefined);
  const [isReady, setIsReady] = useState(false);
  const [streamingBlockId, setStreamingBlockId] = useState(null);

  useEffect(() => {
    setIsReady(false);
    setInitialContent(undefined);
    loadDocument(docId).then((content) => {
      // Clean up old textInput inline content from database
      const cleanedContent = (content || []).map(block => {
        if (block.content && Array.isArray(block.content)) {
          return {
            ...block,
            content: block.content.filter(item => item.type === 'text')
          };
        }
        return block;
      });
      setInitialContent(cleanedContent);
      setIsReady(true);
    });
  }, [docId]);

  const editor = useCreateBlockNote({
    initialContent: initialContent,
    uploadFile: async (file) => {
      // Convert file to base64 data URL for local storage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent && isReady) {
      editor.replaceBlocks(editor.document, initialContent);
    }
  }, [editor, initialContent, isReady]);

  // Handle paste events to convert markdown
  useMarkdownPaste(editor, isReady);

  // Expose PDF export function
  usePdfExport(editor, isReady, onExportPdf);

  const handleChange = () => {
    if (!editor || !isReady) return;
    const content = editor.document;
    onSave(content);
  };

  if (!isReady) {
    return <div style={{ padding: '60px', color: '#9b9a97' }}>Loading...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <BlockNoteView 
        editor={editor} 
        onChange={handleChange}
        formattingToolbar={false}
        theme={darkMode ? 'dark' : 'light'}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key="blockTypeSelect" />
              <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
              <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
              <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
              <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
              <TextAlignButton textAlignment="left" key="textAlignLeftButton" />
              <TextAlignButton textAlignment="center" key="textAlignCenterButton" />
              <TextAlignButton textAlignment="right" key="textAlignRightButton" />
              <ColorStyleButton key="colorStyleButton" />
              <NestBlockButton key="nestBlockButton" />
              <UnnestBlockButton key="unnestBlockButton" />
              <CreateLinkButton key="createLinkButton" />
              <RewriteButton key="rewriteButton" onStreamingBlock={setStreamingBlockId} />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
      
      <StreamingBlockIndicator editor={editor} streamingBlockId={streamingBlockId} />
      
      <WriterPrompt 
        editor={editor} 
        isReady={isReady} 
        onSave={onSave} 
        currentDocId={docId}
        onStreamingBlock={setStreamingBlockId}
      />
    </div>
  );
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
              <Editor key={currentDocId} docId={currentDocId} onSave={handleSave} onExportPdf={exportPdfRef} darkMode={darkMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
