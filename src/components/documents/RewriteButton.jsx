import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useComponentsContext, useBlockNoteEditor } from '@blocknote/react';

export const RewriteButton = ({ onStreamingBlock }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriterAvailable, setRewriterAvailable] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('checking');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
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
        } catch (error) {
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
      // Check if there's a text selection first
      const selection = editor.getSelection();
      let selectedText = '';
      let blocksToRewrite = [];
      
      if (selection && selection.blocks && selection.blocks.length > 0) {
        // User has selected text across one or more blocks
        blocksToRewrite = selection.blocks;
        
        // Extract text from all selected blocks
        selection.blocks.forEach(block => {
          if (block.content && Array.isArray(block.content)) {
            block.content.forEach(item => {
              if (item.type === 'text' && item.text) {
                selectedText += item.text + ' ';
              }
            });
          }
          selectedText += '\n'; // Add newline between blocks
        });
      } else {
        // No selection, use current block
        const currentBlock = editor.getTextCursorPosition().block;
        if (!currentBlock) {
          alert('Please place cursor in text to rewrite');
          return;
        }
        
        blocksToRewrite = [currentBlock];
        
        // Extract text from current block
        if (currentBlock.content && Array.isArray(currentBlock.content)) {
          currentBlock.content.forEach(item => {
            if (item.type === 'text' && item.text) {
              selectedText += item.text + ' ';
            }
          });
        }
      }

      selectedText = selectedText.trim();
      if (!selectedText) {
        alert('No text found to rewrite');
        return;
      }

      // Create a fresh rewriter for each operation
      // Note: Rewriter instances cannot be reused after streaming
      const rewriterConfig = {
        tone: rewriteOptions.options.tone,
        format: rewriteOptions.options.format,
        length: rewriteOptions.options.length,
        sharedContext: 'This is a document editor where users want to improve their writing.'
      };

      const rewriter = await createRewriter(rewriterConfig);

      // Use the first block for streaming
      const firstBlock = blocksToRewrite[0];
      
      // Remove all blocks except the first one if multiple blocks selected
      if (blocksToRewrite.length > 1) {
        editor.removeBlocks(blocksToRewrite.slice(1));
      }
      
      // Clear the first block for streaming
      editor.updateBlock(firstBlock, {
        ...firstBlock,
        content: [{
          type: "text",
          text: ""
        }]
      });

      // Notify parent about streaming block for indicator
      if (onStreamingBlock) {
        onStreamingBlock(firstBlock.id);
      }

      // Stream the rewrite with specific context for this operation
      const stream = rewriter.rewriteStreaming(selectedText, {
        context: rewriteOptions.context || "Rewrite this text while maintaining its core meaning and structure."
      });

      let fullRewrittenText = '';
      let currentBlockRef = { id: firstBlock.id };
      
      for await (const chunk of stream) {
        // Each chunk is incremental text to append
        fullRewrittenText += chunk;
        
        // Check if we completed a block (double newline indicates block boundary)
        if (fullRewrittenText.includes('\n\n')) {
          try {
            // Split into completed blocks and remaining text
            const parts = fullRewrittenText.split('\n\n');
            const completedText = parts.slice(0, -1).join('\n\n');
            const remainingText = parts[parts.length - 1];
            
            if (completedText.trim()) {
              // Parse and insert completed blocks
              const formattedBlocks = editor.tryParseMarkdownToBlocks(completedText + '\n\n');
              
              if (formattedBlocks && formattedBlocks.length > 0) {
                const currentBlock = editor.getBlock(currentBlockRef.id);
                if (currentBlock) {
                  // Insert formatted blocks
                  editor.insertBlocks(formattedBlocks, currentBlock, 'after');
                  
                  // Create new block for remaining text
                  const newBlock = editor.insertBlocks([{
                    type: "paragraph",
                    content: [{
                      type: "text",
                      text: remainingText
                    }]
                  }], formattedBlocks[formattedBlocks.length - 1], 'after')[0];
                  
                  // Remove original block
                  editor.removeBlocks([currentBlock]);
                  
                  // Update reference to new block
                  currentBlockRef.id = newBlock.id;
                  
                  // Notify parent that streaming moved to new block
                  if (onStreamingBlock) {
                    onStreamingBlock(newBlock.id);
                  }
                  
                  // Reset fullText to just remaining text
                  fullRewrittenText = remainingText;
                }
              }
            }
          } catch (error) {
            // Silently handle formatting errors
          }
        }
        
        // Update current block with accumulated text
        try {
          const block = editor.getBlock(currentBlockRef.id);
          if (block) {
            editor.updateBlock(block, {
              ...block,
              content: [{
                type: "text",
                text: fullRewrittenText
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
        if (currentBlock && fullRewrittenText.trim()) {
          // Check if the remaining text has markdown formatting
          if (fullRewrittenText.includes('**') || fullRewrittenText.startsWith('#') || fullRewrittenText.includes('*') || fullRewrittenText.includes('`')) {
            // Parse the remaining text as markdown
            const markdownBlocks = editor.tryParseMarkdownToBlocks(fullRewrittenText);
            
            if (markdownBlocks && markdownBlocks.length > 0) {
              // Insert formatted blocks
              editor.insertBlocks(markdownBlocks, currentBlock, 'after');
              
              // Remove the unformatted block
              editor.removeBlocks([currentBlock]);
              
              // Position cursor at the end of the last inserted block
              const lastBlock = markdownBlocks[markdownBlocks.length - 1];
              if (lastBlock) {
                editor.setTextCursorPosition(lastBlock, 'end');
              }
            } else {
              // Just add a space to the plain text
              editor.updateBlock(currentBlock, {
                ...currentBlock,
                content: [{
                  type: "text",
                  text: fullRewrittenText + " "
                }]
              });
            }
          } else {
            // No markdown formatting needed, just add a space
            editor.updateBlock(currentBlock, {
              ...currentBlock,
              content: [{
                type: "text",
                text: fullRewrittenText + " "
              }]
            });
          }
        }
      } catch (error) {
        // Silently handle final formatting errors
      }

    } catch (error) {
      console.error('AI rewrite failed:', error);
      alert(`Rewrite failed: ${error.message}`);
    } finally {
      setIsRewriting(false);
      
      // Clear streaming indicator
      if (onStreamingBlock) {
        onStreamingBlock(null);
      }
    }
  };



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
