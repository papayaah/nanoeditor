import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useComponentsContext, useBlockNoteEditor } from '@blocknote/react';

export const RewriteButton = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriterAvailable, setRewriterAvailable] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('checking');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const rewriterRef = useRef(null);
  const rewriterConfigRef = useRef(null);
  const Components = useComponentsContext();
  const editor = useBlockNoteEditor();

  const rewriteOptions = [
    { 
      label: "Make it shorter", 
      options: { tone: 'as-is', format: 'as-is', length: 'shorter' },
      context: "Make this text more concise while keeping the same meaning."
    },
    { 
      label: "Make it longer", 
      options: { tone: 'as-is', format: 'as-is', length: 'longer' },
      context: "Expand this text with more detail and explanation."
    },
    { 
      label: "Simplify", 
      options: { tone: 'more-casual', format: 'as-is', length: 'as-is' },
      context: "Make this text simpler and easier to understand."
    },
    { 
      label: "Professional tone", 
      options: { tone: 'more-formal', format: 'as-is', length: 'as-is' },
      context: "Make this text more professional and formal."
    },
    { 
      label: "Casual tone", 
      options: { tone: 'more-casual', format: 'as-is', length: 'as-is' },
      context: "Make this text more casual and conversational."
    },
    { 
      label: "Fix grammar", 
      options: { tone: 'as-is', format: 'as-is', length: 'as-is' },
      context: "Fix any grammar, spelling, or punctuation errors in this text."
    }
  ];

  // Check if Chrome AI Rewriter is available
  useEffect(() => {
    const checkRewriter = async () => {
      if (typeof self !== 'undefined' && 'Rewriter' in self) {
        try {
          const availability = await self.Rewriter.availability();
          setAvailabilityStatus(availability);
          const isAvailable = availability === 'available' || availability === 'downloadable';
          setRewriterAvailable(isAvailable);
          console.log('Chrome AI Rewriter availability:', availability);
        } catch (error) {
          console.log('Chrome AI Rewriter not available:', error);
          setAvailabilityStatus('unavailable');
          setRewriterAvailable(false);
        }
      } else {
        setAvailabilityStatus('unavailable');
        setRewriterAvailable(false);
      }
    };
    checkRewriter();
  }, []);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Rewrite button clicked, current state:', showDropdown);
    
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
    
    setShowDropdown(!showDropdown);
  };

  // Helper function to create a new rewriter
  const createRewriter = async (config) => {
    if (availabilityStatus === 'available') {
      return await self.Rewriter.create(config);
    } else if (availabilityStatus === 'downloadable') {
      const rewriter = await self.Rewriter.create(config);
      rewriter.addEventListener('downloadprogress', (e) => {
        console.log(`Downloading AI model: ${Math.round((e.loaded / e.total) * 100)}%`);
      });
      return rewriter;
    } else {
      throw new Error('Rewriter API is unavailable');
    }
  };

  const handleRewrite = async (rewriteOptions) => {
    if (!rewriterAvailable || isRewriting) return;

    setIsRewriting(true);
    setShowDropdown(false);

    try {
      // Get current text cursor position and block
      const currentBlock = editor.getTextCursorPosition().block;
      if (!currentBlock) {
        alert('Please place cursor in text to rewrite');
        return;
      }

      // Extract text from current block
      let selectedText = '';
      if (currentBlock.content && Array.isArray(currentBlock.content)) {
        currentBlock.content.forEach(item => {
          if (item.type === 'text' && item.text) {
            selectedText += item.text + ' ';
          }
        });
      }

      selectedText = selectedText.trim();
      if (!selectedText) {
        alert('No text found to rewrite');
        return;
      }

      console.log('Block to rewrite:', currentBlock);
      console.log('Text to rewrite:', selectedText);
      console.log('Starting AI rewrite with options:', rewriteOptions);

      // Create rewriter config
      const rewriterConfig = {
        tone: rewriteOptions.options.tone,
        format: rewriteOptions.options.format,
        length: rewriteOptions.options.length,
        sharedContext: 'This is a document editor where users want to improve their writing.'
      };

      let rewriter = rewriterRef.current;
      let needsNewRewriter = false;

      // Check if we need a new rewriter (first time or config changed)
      if (!rewriter || JSON.stringify(rewriterConfigRef.current) !== JSON.stringify(rewriterConfig)) {
        needsNewRewriter = true;
      }

      // Try to reuse existing rewriter, create new one if needed
      if (needsNewRewriter) {
        // Clean up old rewriter
        if (rewriter) {
          try {
            rewriter.destroy();
          } catch (error) {
            console.log('Error destroying old rewriter:', error);
          }
        }

        // Create new rewriter
        console.log('Creating new rewriter with config:', rewriterConfig);
        rewriter = await createRewriter(rewriterConfig);
        rewriterRef.current = rewriter;
        rewriterConfigRef.current = rewriterConfig;
      } else {
        console.log('Reusing existing rewriter');
      }

      // Clear the current block for streaming
      editor.updateBlock(currentBlock, {
        ...currentBlock,
        content: [{
          type: "text",
          text: ""
        }]
      });

      // Stream the rewrite with specific context for this operation
      const stream = rewriter.rewriteStreaming(selectedText, {
        context: rewriteOptions.context || "Rewrite this text while maintaining its core meaning and structure."
      });

      let fullRewrittenText = '';
      
      for await (const chunk of stream) {
        // Each chunk is incremental text to append
        fullRewrittenText += chunk;
        
        // Update the block with the accumulated text
        try {
          editor.updateBlock(currentBlock, {
            ...currentBlock,
            content: [{
              type: "text",
              text: fullRewrittenText
            }]
          });
        } catch (error) {
          console.log('Error updating streaming block:', error);
        }
      }

      console.log('AI rewrite complete. Final text:', fullRewrittenText);

      // After streaming is complete, format the final text if it contains markdown
      if (fullRewrittenText.includes('**') || fullRewrittenText.startsWith('#') || fullRewrittenText.includes('*') || fullRewrittenText.includes('`')) {
        try {
          // Parse the final text as markdown
          const formattedBlocks = editor.tryParseMarkdownToBlocks(fullRewrittenText);
          
          if (formattedBlocks && formattedBlocks.length > 0) {
            // Replace with formatted blocks
            editor.replaceBlocks([currentBlock], formattedBlocks);
          }
        } catch (error) {
          console.log('Error formatting final rewritten text:', error);
        }
      }

    } catch (error) {
      console.error('AI rewrite failed:', error);
      
      // If we get an AbortError, try creating a fresh rewriter
      if (error.name === 'AbortError' && rewriterRef.current) {
        console.log('AbortError detected, will create fresh rewriter next time');
        try {
          rewriterRef.current.destroy();
        } catch (destroyError) {
          console.log('Error destroying failed rewriter:', destroyError);
        }
        rewriterRef.current = null;
        rewriterConfigRef.current = null;
      }
      
      alert(`Rewrite failed: ${error.message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rewriterRef.current) {
        try {
          rewriterRef.current.destroy();
        } catch (error) {
          console.log('Error destroying rewriter on unmount:', error);
        }
        rewriterRef.current = null;
        rewriterConfigRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  console.log('RewriteButton render, showDropdown:', showDropdown, 'position:', dropdownPosition);

  return (
    <>
      <div 
        ref={buttonRef}
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      >
        <Components.FormattingToolbar.Button
          onClick={handleButtonClick}
          isSelected={showDropdown}
          mainTooltip="Rewrite with AI"
        >
          Rewrite ▾
        </Components.FormattingToolbar.Button>
      </div>
      
      {showDropdown && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '200px',
            zIndex: 99999,
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {rewriteOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleRewrite(option)}
              style={{
                padding: '10px 14px',
                cursor: isRewriting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                borderBottom: index < rewriteOptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.15s',
                opacity: isRewriting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => !isRewriting && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => !isRewriting && (e.currentTarget.style.backgroundColor = 'white')}
            >
              {isRewriting && (
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #a78bfa',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
              )}
              <span>{option.label}</span>
              {!rewriterAvailable && (
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                  ({availabilityStatus === 'checking' ? 'Checking...' : 'AI unavailable'})
                </span>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
