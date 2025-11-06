import { useState, useEffect, useRef } from 'react';

export const WriterPrompt = ({ editor, isReady }) => {
  const [showInput, setShowInput] = useState(false);
  const [inputPosition, setInputPosition] = useState({ top: 0, left: 0 });
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

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

  if (!showInput) return null;

  return (
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
  );
};
