export const Toolbar = ({ 
  showSidebar, 
  showMarkdown, 
  onToggleSidebar, 
  onToggleMarkdown, 
  onCopyMarkdown 
}) => {
  return (
    <div className="toolbar">
      <button onClick={onToggleSidebar} className="toolbar-btn">
        {showSidebar ? '◀' : '▶'} Docs
      </button>
      <button onClick={onToggleMarkdown} className="toolbar-btn">
        {showMarkdown ? '📝 Editor' : '📄 Markdown'}
      </button>
      <button onClick={onCopyMarkdown} className="toolbar-btn">
        📋 Copy
      </button>
    </div>
  );
};
