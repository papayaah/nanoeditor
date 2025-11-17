import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { incrementAIGenerations } from '../../db';

// Helper functions for localStorage
const getStoredSetting = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const setStoredSetting = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Silently handle localStorage errors
  }
};

export const WriterPrompt = ({ editor, isReady, onSave, currentDocId, onStreamingBlock }) => {
  const [showInput, setShowInput] = useState(false);
  const [inputPosition, setInputPosition] = useState({ top: 0, left: 0 });
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [writerAvailable, setWriterAvailable] = useState(false);
  
  // Load settings from localStorage with defaults
  const [tone, setTone] = useState(() => getStoredSetting('writerTone', 'formal'));
  const [format, setFormat] = useState(() => getStoredSetting('writerFormat', 'markdown'));
  const [length, setLength] = useState(() => getStoredSetting('writerLength', 'long'));
  
  const inputRef = useRef(null);
  const writerRef = useRef(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    setStoredSetting('writerTone', tone);
  }, [tone]);

  useEffect(() => {
    setStoredSetting('writerFormat', format);
  }, [format]);

  useEffect(() => {
    setStoredSetting('writerLength', length);
  }, [length]);

  // Check if Chrome AI Writer is available
  useEffect(() => {
    const checkAI = async () => {
      try {
        // Check for Chrome's built-in AI Writer API
        if (typeof self !== 'undefined' && 'Writer' in self) {
          const availability = await self.Writer.availability();
          const isAvailable = availability === 'available' || availability === 'downloadable';
          setWriterAvailable(isAvailable);
        } else {
        }
      } catch (error) {
        // Silently handle AI availability check errors
      }
    };
    checkAI();
  }, []);

  // Intercept spacebar on empty lines
  useEffect(() => {
    if (!editor || !isReady) return;

    let editorElement = null;

    const handleKeyDown = (event) => {
      if (event.key === ' ' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        // Check if current block is empty
        try {
          const currentBlock = editor.getTextCursorPosition().block;
          const isEmpty = !currentBlock.content || 
                         currentBlock.content.length === 0 ||
                         (currentBlock.content.length === 1 && 
                          currentBlock.content[0].type === 'text' && 
                          currentBlock.content[0].text.trim() === '');

          if (isEmpty) {
            
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
                
                if (rect.top > 0 || rect.left > 0) {
                  const inputHeight = 150;
                  const spaceBelow = window.innerHeight - rect.bottom;
                  const spaceAbove = rect.top;
                  const shouldPositionAbove = spaceBelow < inputHeight && spaceAbove > spaceBelow;
                  
                  const position = {
                    top: shouldPositionAbove ? rect.top - inputHeight - 5 : rect.bottom + 5,
                    left: rect.left
                  };
                  setInputPosition(position);
                  setShowInput(true);
                } else {
                }
              }
            }, 10);
          }
        } catch (error) {
          // Silently handle errors
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
        }
      } catch (error) {
        // Editor not ready yet
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorElement) {
        editorElement.removeEventListener('keydown', handleKeyDown, true);
      }
    };
  }, [editor, isReady]);

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) {
      setShowInput(false);
      return;
    }

    if (!writerAvailable) {
      // Fallback: just insert the text as-is
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
        // Silently handle text insertion errors
      }
      setShowInput(false);
      setInputValue("");
      return;
    }



    // Use Chrome AI to generate content
    setIsGenerating(true);
    setShowInput(false);
    
    try {
      // Always create a fresh writer instance with current settings
      // Writer instances should be recreated to pick up new settings
      if (writerRef.current && writerRef.current.destroy) {
        writerRef.current.destroy();
      }
      
      const availability = await self.Writer.availability();
      
      if (availability === 'available' || availability === 'downloadable') {
        writerRef.current = await self.Writer.create({
          tone: tone,
          format: format,
          length: length,
          outputLanguage: 'en'
        });
      } else {
        throw new Error('Writer API is unavailable');
      }

      const currentBlock = editor.getTextCursorPosition().block;
      const blockId = currentBlock.id;
      
      // Notify parent that streaming is starting on this block
      if (onStreamingBlock) {
        onStreamingBlock(blockId);
      }
      
      // Get current document content as context for the AI
      const documentContext = editor.document
        .map(block => {
          if (block.content && Array.isArray(block.content)) {
            return block.content
              .filter(item => item.type === 'text')
              .map(item => item.text)
              .join('');
          }
          return '';
        })
        .join('\n') || 'New document';

      // Stream the AI response with document context
      const stream = writerRef.current.writeStreaming(inputValue, {
        context: documentContext
      });
      let fullText = '';
      let currentBlockRef = { id: blockId };
      
      for await (const chunk of stream) {
        // Each chunk is incremental text to append
        fullText += chunk;
        
        // Update current block with accumulated text (no real-time parsing)
        try {
          const block = editor.getBlock(currentBlockRef.id);
          if (block) {
            editor.updateBlock(block, {
              ...block,
              content: [{
                type: "text",
                text: fullText
              }]
            });
          }
        } catch (error) {
          // Silently handle block update errors
        }
      }

      // After streaming is complete, format any remaining unformatted text
      try {
        const currentBlock = editor.getBlock(currentBlockRef.id);
        if (currentBlock && fullText.trim()) {
          // If format is plain-text, don't parse markdown - just split by newlines
          if (format === 'plain-text') {
            const lines = fullText.split('\n').filter(line => line.trim());
            const blocks = lines.map(line => ({
              type: 'paragraph',
              content: [{
                type: 'text',
                text: line,
                styles: {}
              }]
            }));
            
            if (blocks.length > 0) {
              // Insert plain text blocks
              const insertedBlocks = editor.insertBlocks(blocks, currentBlock, 'after');
              
              // Remove the temporary block
              editor.removeBlocks([currentBlock]);
              
              // Position cursor at the end
              if (insertedBlocks && insertedBlocks.length > 0) {
                const lastBlock = insertedBlocks[insertedBlocks.length - 1];
                editor.setTextCursorPosition(lastBlock, 'end');
              }
            }
          } else {
            // Format is markdown - parse it
            const blocks = [];
            let processedText = fullText.replace(/\r\n/g, '\n');
            
            // Split by code blocks while preserving them
            const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
            let lastIndex = 0;
            let match;
            
            while ((match = codeBlockRegex.exec(processedText)) !== null) {
              // Add text before code block
              const textBefore = processedText.slice(lastIndex, match.index).trim();
              if (textBefore) {
                // Parse the text portion as markdown
                const textBlocks = await editor.tryParseMarkdownToBlocks(textBefore);
                blocks.push(...textBlocks);
              }
              
              // Add code block with preserved newlines
              const language = match[1] || 'text';
              const codeContent = match[2];
              blocks.push({
                type: 'codeBlock',
                props: { language },
                content: [{
                  type: 'text',
                  text: codeContent,
                  styles: {}
                }]
              });
              
              lastIndex = match.index + match[0].length;
            }
            
            // Add remaining text after last code block
            const textAfter = processedText.slice(lastIndex).trim();
            if (textAfter) {
              const textBlocks = await editor.tryParseMarkdownToBlocks(textAfter);
              blocks.push(...textBlocks);
            }
            
            if (blocks.length > 0) {
              // Insert formatted blocks after current block
              const insertedBlocks = editor.insertBlocks(blocks, currentBlock, 'after');
              
              // Remove the temporary unformatted block
              editor.removeBlocks([currentBlock]);
              
              // Position cursor at the end of the last inserted block
              if (insertedBlocks && insertedBlocks.length > 0) {
                const lastBlock = insertedBlocks[insertedBlocks.length - 1];
                editor.setTextCursorPosition(lastBlock, 'end');
              }
            } else {
              // Fallback: just add a space to the plain text
              editor.updateBlock(currentBlock, {
                ...currentBlock,
                content: [{
                  type: "text",
                  text: fullText + " "
                }]
              });
            }
          }
        }
      } catch (error) {
        console.error('Text formatting error:', error);
        console.error('Full text was:', fullText);
        // Silently handle final block formatting errors
      }

    } catch (error) {
      console.error('AI generation failed:', error);
      console.error('Error details:', error.message, error.stack);
      // Fallback: insert the prompt as text
      try {
        const currentBlock = editor.getTextCursorPosition().block;
        editor.updateBlock(currentBlock, {
          ...currentBlock,
          content: [{
            type: "text",
            text: `[AI Error: ${error.message}] ${inputValue} `
          }]
        });
      } catch (err) {
        // Silently handle fallback text insertion errors
      }
    } finally {
      setIsGenerating(false);
      setInputValue("");
      
      // Clear streaming indicator
      if (onStreamingBlock) {
        onStreamingBlock(null);
      }
      
      // Increment AI generation counter and save
      if (onSave && editor && currentDocId) {
        try {
          // Increment AI generation count
          await incrementAIGenerations(currentDocId);
          
          // Save document content
          const content = editor.document;
          onSave(content);
        } catch (error) {
          // Silently handle save errors
        }
      }
    }
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

  // Cleanup writer on unmount
  useEffect(() => {
    return () => {
      if (writerRef.current && writerRef.current.destroy) {
        writerRef.current.destroy();
      }
    };
  }, []);

  if (!showInput) return null;

  return (
    <div
      ref={inputRef}
      style={{
        position: 'fixed',
        top: inputPosition.top,
        left: inputPosition.left,
        backgroundColor: 'white',
        border: writerAvailable ? '1px solid #a78bfa' : '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '300px',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {writerAvailable && (
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#f3e8ff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={14} color="#a78bfa" />
          </div>
        )}
        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
          {writerAvailable ? 'AI Writer' : 'Text Input'}
        </div>
      </div>

      {writerAvailable && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '8px',
          padding: '8px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="writer-tone" style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
              Tone
            </label>
            <select 
              id="writer-tone"
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
              disabled={isGenerating}
              aria-label="Select writing tone"
              style={{
                width: '100%',
                padding: '4px 6px',
                fontSize: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="formal">Formal</option>
              <option value="neutral">Neutral</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="writer-length" style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
              Length
            </label>
            <select 
              id="writer-length"
              value={length} 
              onChange={(e) => setLength(e.target.value)}
              disabled={isGenerating}
              aria-label="Select writing length"
              style={{
                width: '100%',
                padding: '4px 6px',
                fontSize: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="writer-format" style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
              Format
            </label>
            <select 
              id="writer-format"
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
              disabled={isGenerating}
              aria-label="Select output format"
              style={{
                width: '100%',
                padding: '4px 6px',
                fontSize: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="markdown">Markdown</option>
              <option value="plain-text">Plain Text</option>
            </select>
          </div>
        </div>
      )}
      
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={writerAvailable ? "Ask AI to write anything..." : "Type your text here..."}
        aria-label={writerAvailable ? "AI writing prompt" : "Text input"}
        autoFocus
        rows={3}
        disabled={isGenerating}
        style={{
          border: '1px solid #e5e5e5',
          borderRadius: '4px',
          padding: '8px',
          width: '100%',
          fontFamily: 'inherit',
          fontSize: '14px',
          resize: 'vertical',
          outline: 'none',
          backgroundColor: isGenerating ? '#f9fafb' : 'white',
        }}
      />
      
      <div style={{ fontSize: '12px', color: '#9b9a97', marginTop: '8px' }}>
        {isGenerating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              border: '2px solid #a78bfa',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite'
            }} />
            AI is writing...
          </div>
        ) : (
          `Press Enter to ${writerAvailable ? 'generate' : 'insert'}, Esc to cancel`
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
