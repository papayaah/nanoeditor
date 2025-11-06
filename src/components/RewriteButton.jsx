import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useComponentsContext } from '@blocknote/react';

export const RewriteButton = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const Components = useComponentsContext();

  const rewriteOptions = [
    "Make it shorter",
    "Make it longer", 
    "Simplify",
    "Professional tone",
    "Casual tone",
    "Fix grammar"
  ];

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
              onClick={() => {
                console.log('Rewrite option selected:', option);
                setShowDropdown(false);
              }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: index < rewriteOptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {option}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
