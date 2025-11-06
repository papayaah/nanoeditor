export const Sidebar = ({ 
  documents, 
  currentDocId, 
  showSidebar, 
  onSelectDocument, 
  onNewDocument, 
  onDeleteDocument 
}) => {
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

  return (
    <div className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>Documents</h2>
        <button onClick={onNewDocument} className="new-doc-btn">+ New</button>
      </div>
      <div className="document-list">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`doc-item ${currentDocId === doc.id ? 'active' : ''}`}
            onClick={() => onSelectDocument(doc.id)}
          >
            <span className="doc-title">{getDocTitle(doc)}</span>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDocument(doc.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
