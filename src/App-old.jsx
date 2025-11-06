import { useEffect, useState } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote, FormattingToolbar, FormattingToolbarController } from '@blocknote/react';
import '@blocknote/mantine/style.css';
import { saveDocument, loadDocument, getAllDocuments, createDocument, deleteDocument } from './db';
import { WriterPrompt } from './components/WriterPrompt';
import { RewriteButton } from './components/RewriteButton';
import './App.css';

function Editor({ docId, onSave }) {
  const [initialContent, setInitialContent] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    setInitialContent(null);
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

  // Intercept spacebar on empty lines
  useEffect(() => {
    if (!editor || !isReady) return;

    let editorElement = null;

    const handleKeyDown = (event) => {
      console.log('Key pressed:', event.key);
      if (event.key === ' ' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        console.log('Spacebar detected!');
        // Check if current block is empty
        try {
          const currentBlock = editor.getTextCursorPosition().block;
          console.log('Current block:', currentBlock);
          const isEmpty = !currentBlock.content || 
                         currentBlock.content.length === 0 ||
                         (currentBlock.content.length === 1 && 
                          currentBlock.content[0].type === 'text' && 
                          currentBlock.content[0].text.trim() === '');

          console.log('Is empty?', isEmpty);
          if (isEmpty) {
            console.log('Showing input!');
            
            event.preventDefault(); // Prevent space from being added
            
            // Show input at cursor position
            setInputValue("");
            
            // Use a small delay to let the DOM settle, then get position
            setTimeout(() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                
                // Create a temporary span to get the exact cursor position
                const span = document.createElement('span');
                span.textContent = '\u200B'; // Zero-width space
                range.insertNode(span);
                
                const rect = span.getBoundingClientRect();
                span.remove();
                
                console.log('Cursor rect:', rect);
                
                if (rect.top > 0 || rect.left > 0) {
                  const inputHeight = 150;
                  const spaceBelow = window.innerHeight - rect.bottom;
                  const spaceAbove = rect.top;
                  const shouldPositionAbove = spaceBelow < inputHeight && spaceAbove > spaceBelow;
                  
                  const position = {
                    top: shouldPositionAbove ? rect.top - inputHeight - 5 : rect.bottom + 5,
                    left: rect.left
                  };
                  console.log('Setting position:', position);
                  setInputPosition(position);
                  setShowInput(true);
                } else {
                  console.log('Invalid rect position:', rect);
                }
              }
            }, 10);
          }
        } catch (error) {
          console.log('Error checking for spacebar:', error);
        }
      }
    };

    // Add event listener to editor's DOM element
    // Wait a bit for the editor to be fully mounted
    const timer = setTimeout(() => {
      try {
        editorElement = editor.domElement;
        if (editorElement) {
          editorElement.addEventListener('keydown', handleKeyDown, true);
          console.log('Spacebar listener attached');
        }
      } catch (error) {
        console.log('Editor not ready yet:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorElement) {
        editorElement.removeEventListener('keydown', handleKeyDown, true);
        console.log('Spacebar listener removed');
      }
    };
  }, [editor, isReady]);

  useEffect(() => {
    if (isReady && editor && initialContent !== null) {
      editor.replaceBlocks(editor.document, initialContent);
    }
  }, [isReady, initialContent, editor]);

  const handleChange = () => {
    if (!editor || !isReady) return;
    const content = editor.document;
    onSave(content);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) {
      setShowInput(false);
      return;
    }

    // Insert the text at current cursor position
    try {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.updateBlock(currentBlock, {
        ...currentBlock,
        content: [{
          type: "text",
          text: inputValue + " "
        }]
      });
    } catch (error) {
      console.log('Error inserting text:', error);
    }

    setShowInput(false);
    setInputValue("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setInputValue("");
    }
  };



  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowInput(false);
      }
    };

    if (showInput) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showInput]);

  if (!isReady) {
    return <div style={{ padding: '60px', color: '#9b9a97' }}>Loading...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <BlockNoteView editor={editor} onChange={handleChange} formattingToolbar={false}>
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <div style={{ 
                borderLeft: '1px solid #e0e0e0', 
                height: '20px', 
                margin: '0 8px' 
              }} />
              <RewriteButton />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
      
      {showInput && (
        <div
          ref={inputRef}
          style={{
            position: 'fixed',
            top: inputPosition.top,
            left: inputPosition.left,
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px',
            zIndex: 1000,
          }}
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your text here..."
            autoFocus
            rows={3}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: '4px',
              padding: '8px',
              width: '100%',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div style={{ fontSize: '12px', color: '#9b9a97', marginTop: '8px' }}>
            Press Enter to insert, Esc to cancel
          </div>
        </div>
      )}
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
    // Don't reload documents on every save to prevent reordering
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
      // Simple markdown conversion
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
