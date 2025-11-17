import { useEffect, useState, useRef } from 'react';

export const StreamingBlockIndicator = ({ editor, streamingBlockId }) => {
  const [indicatorPosition, setIndicatorPosition] = useState(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!editor || !streamingBlockId) {
      setIndicatorPosition(null);
      return;
    }

    const updatePosition = () => {
      try {
        const block = editor.getBlock(streamingBlockId);
        if (!block) {
          setIndicatorPosition(null);
          return;
        }

        // Find the block element in the DOM
        const blockElement = editor.domElement?.querySelector(`[data-id="${streamingBlockId}"]`);
        if (blockElement) {
          const rect = blockElement.getBoundingClientRect();
          
          // Position relative to viewport, 40px to the left of the block
          setIndicatorPosition({
            top: rect.top + rect.height / 2 - 12,
            left: rect.left - 40
          });
        }
      } catch (error) {
        // Silently handle positioning errors
      }
      
      // Continue updating on next frame
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    // Start the animation loop
    updatePosition();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [editor, streamingBlockId]);

  if (!indicatorPosition) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: indicatorPosition.top,
          left: indicatorPosition.left,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid #a78bfa',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
