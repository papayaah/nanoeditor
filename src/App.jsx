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
import { PDFExporter, pdfDefaultSchemaMappings } from '@blocknote/xl-pdf-exporter';
import * as ReactPDF from '@react-pdf/renderer';
import '@blocknote/mantine/style.css';
import { MantineProvider } from '@mantine/core';
import { 
  ChevronLeft, 
  FileText, 
  Code, 
  Copy, 
  FileDown, 
  Plus, 
  X,
  Moon,
  Sun,
  Settings,
  Check
} from 'lucide-react';
import { loadDocument, saveDocument, createDocument, deleteDocument, getAllDocuments } from './db';
import { WriterPrompt } from './components/WriterPrompt';
import { RewriteButton } from './components/RewriteButton';
import { DocumentInfo } from './components/DocumentInfo';
import { StreamingBlockIndicator } from './components/StreamingBlockIndicator';
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
  useEffect(() => {
    if (!editor || !isReady) return;

    const handlePaste = async (event) => {
      const pastedText = event.clipboardData?.getData('text/plain');
      if (!pastedText) return;

      // Check if pasted text looks like markdown (has markdown syntax)
      const hasMarkdownSyntax = /^#{1,6}\s|^\*\*|^\*|^-\s|^\d+\.\s|^>\s|^```/m.test(pastedText);

      if (hasMarkdownSyntax) {
        event.preventDefault();
        
        try {
          // Convert markdown to blocks using BlockNote's built-in parser
          const blocks = editor.tryParseMarkdownToBlocks(pastedText);
          
          // Get current cursor position
          const currentBlock = editor.getTextCursorPosition().block;
          
          // Insert the blocks at current position
          editor.insertBlocks(blocks, currentBlock, 'after');
          
          // Remove current block if it's empty
          const blockContent = currentBlock.content;
          if (!blockContent || (Array.isArray(blockContent) && blockContent.length === 0)) {
            editor.removeBlocks([currentBlock]);
          }
        } catch (error) {
          console.log('Error parsing markdown:', error);
          // If parsing fails, let default paste behavior happen
        }
      }
    };

    const editorElement = editor.domElement;
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste);
      return () => {
        editorElement.removeEventListener('paste', handlePaste);
      };
    }
  }, [editor, isReady]);

  const handleChange = () => {
    if (!editor || !isReady) return;
    const content = editor.document;
    onSave(content);
  };

  // Expose PDF export function
  useEffect(() => {
    if (editor && isReady && onExportPdf) {
      onExportPdf.current = async (docTitle) => {
        try {
          // Create the PDF exporter
          const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);
          
          // Convert the blocks to a react-pdf document
          const pdfDocument = await exporter.toReactPDFDocument(editor.document);
          
          // Use react-pdf to render and download the PDF
          const pdfBlob = await ReactPDF.pdf(pdfDocument).toBlob();
          
          // Create download link
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${docTitle}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('PDF exported successfully');
        } catch (error) {
          console.error('Error exporting to PDF:', error);
          throw error;
        }
      };
    }
  }, [editor, isReady, onExportPdf]);

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
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [showSidebar, setShowSidebar] = useState(() => {
    const saved = localStorage.getItem('showSidebar');
    return saved ? JSON.parse(saved) : false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const exportPdfRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('showSidebar', JSON.stringify(showSidebar));
  }, [showSidebar]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSettings && !e.target.closest('.floating-settings')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await getAllDocuments();
    setDocuments(docs);
    if (docs.length > 0 && !currentDocId) {
      setCurrentDocId(docs[0].id);
    } else if (docs.length === 0) {
      const newDoc = await createDocument();
      setDocuments([newDoc]);
      setCurrentDocId(newDoc.id);
    }
  };

  const handleSave = async (content) => {
    if (!currentDocId) return;
    await saveDocument(currentDocId, content);
    // Update just the title in the current documents array without reloading
    const updatedDocs = documents.map(doc => {
      if (doc.id === currentDocId) {
        const title = getDocTitle({ ...doc, content: JSON.stringify(content) });
        return { ...doc, title, content: JSON.stringify(content) };
      }
      return doc;
    });
    setDocuments(updatedDocs);
  };

  const handleNewDocument = async () => {
    const newDoc = await createDocument();
    await loadDocuments();
    setCurrentDocId(newDoc.id);
  };

  const handleSelectDocument = (docId) => {
    setCurrentDocId(docId);
    setShowMarkdown(false);
  };

  const handleDeleteDocument = async (docId) => {
    if (documents.length === 1) {
      alert('Cannot delete the last document');
      return;
    }
    if (confirm('Delete this document?')) {
      await deleteDocument(docId);
      await loadDocuments();
      if (currentDocId === docId) {
        const docs = await getAllDocuments();
        setCurrentDocId(docs[0]?.id || null);
      }
    }
  };

  const toggleMarkdown = async () => {
    if (!showMarkdown && currentDocId) {
      const content = await loadDocument(currentDocId);
      const md = content.map(block => {
        if (block.type === 'heading') {
          const level = '#'.repeat(block.props?.level || 1);
          return `${level} ${block.content?.[0]?.text || ''}\n`;
        }
        return block.content?.[0]?.text || '';
      }).join('\n');
      setMarkdown(md);
    }
    setShowMarkdown(!showMarkdown);
  };

  const [showCopied, setShowCopied] = useState(false);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const exportToPdf = async () => {
    if (!currentDocId || !exportPdfRef.current) return;
    
    try {
      const docTitle = getDocTitle(documents.find(doc => doc.id === currentDocId)) || 'document';
      await exportPdfRef.current(docTitle);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const getDocTitle = (doc) => {
    if (doc.title && doc.title !== 'Untitled Document') {
      return doc.title;
    }
    const content = JSON.parse(doc.content || '[]');
    if (content.length > 0 && content[0].content) {
      const firstBlock = content[0].content;
      if (Array.isArray(firstBlock) && firstBlock.length > 0) {
        return firstBlock[0].text || 'Untitled';
      }
    }
    return 'Untitled';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!currentDocId) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <button onClick={() => setShowSidebar(!showSidebar)} className="sidebar-toggle-btn">
        <ChevronLeft size={18} style={{ transform: showSidebar ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
      </button>
      
      <div className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Documents</h2>
          <button onClick={handleNewDocument} className="new-doc-btn">
            <Plus size={16} /> New
          </button>
        </div>
        <div className="document-list">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`doc-item ${currentDocId === doc.id ? 'active' : ''}`}
              onClick={() => handleSelectDocument(doc.id)}
            >
              <div className="doc-item-content">
                <span className="doc-title">{getDocTitle(doc)}</span>
                {doc.updatedAt && (
                  <span className="doc-date">{formatDate(doc.updatedAt)}</span>
                )}
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(doc.id);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <DocumentInfo 
          currentDocId={currentDocId}
          documents={documents}
        />
      </div>
      
      <div className="main-content">
        <div className="floating-settings">
          <button onClick={() => setShowSettings(!showSettings)} className="settings-toggle">
            <Settings size={20} />
          </button>
          {showSettings && (
            <div className="settings-menu">
              {!showSidebar && (
                <button onClick={() => setShowSidebar(true)} className="settings-menu-btn">
                  <ChevronLeft size={16} />
                  <span>Show Sidebar</span>
                </button>
              )}
              <button onClick={toggleMarkdown} className="settings-menu-btn">
                {showMarkdown ? <FileText size={16} /> : <Code size={16} />}
                <span>{showMarkdown ? 'Editor' : 'Markdown'}</span>
              </button>
              <button onClick={copyMarkdown} className="settings-menu-btn">
                {showCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span>{showCopied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button onClick={exportToPdf} className="settings-menu-btn">
                <FileDown size={16} />
                <span>Export PDF</span>
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="settings-menu-btn">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          )}
        </div>
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
