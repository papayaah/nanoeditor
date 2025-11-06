import { useEffect, useState } from 'react';
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
import { loadDocument, saveDocument, createDocument, deleteDocument, getAllDocuments } from './db';
import { WriterPrompt } from './components/WriterPrompt';
import { RewriteButton } from './components/RewriteButton';
import './App.css';

function Editor({ docId, onSave }) {
  const [initialContent, setInitialContent] = useState(undefined);
  const [isReady, setIsReady] = useState(false);

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

  if (!isReady) {
    return <div style={{ padding: '60px', color: '#9b9a97' }}>Loading...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <BlockNoteView 
        editor={editor} 
        onChange={handleChange}
        formattingToolbar={false}
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
              <RewriteButton key="rewriteButton" />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
      
      <WriterPrompt editor={editor} isReady={isReady} />
    </div>
  );
}

function App() {
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

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

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    alert('Markdown copied to clipboard!');
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

  if (!currentDocId) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Documents</h2>
          <button onClick={handleNewDocument} className="new-doc-btn">+ New</button>
        </div>
        <div className="document-list">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`doc-item ${currentDocId === doc.id ? 'active' : ''}`}
              onClick={() => handleSelectDocument(doc.id)}
            >
              <span className="doc-title">{getDocTitle(doc)}</span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(doc.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="main-content">
        <div className="toolbar">
          <button onClick={() => setShowSidebar(!showSidebar)} className="toolbar-btn">
            {showSidebar ? '◀' : '▶'} Docs
          </button>
          <button onClick={toggleMarkdown} className="toolbar-btn">
            {showMarkdown ? '📝 Editor' : '📄 Markdown'}
          </button>
          <button onClick={copyMarkdown} className="toolbar-btn">
            📋 Copy
          </button>
        </div>
        <div className="editor-container">
          <div className="editor-wrapper">
            {showMarkdown ? (
              <div className="markdown-preview">
                <pre>{markdown}</pre>
              </div>
            ) : (
              <Editor key={currentDocId} docId={currentDocId} onSave={handleSave} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
