import { Plus, Trash2, Check, X, FileText, Megaphone } from 'lucide-react';
import { DocumentInfo } from './DocumentInfo';
import { PostSettings } from './PostSettings';

export const Sidebar = ({ 
  documents, 
  currentDocId, 
  showSidebar, 
  deleteConfirmId,
  docInfoCollapsed,
  postSettingsCollapsed,
  onSelectDocument, 
  onNewDocument,
  onNewPost,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete,
  onToggleDocInfo,
  onTogglePostSettings,
  onNavigate,
  currentRoute,
  postSettings
}) => {
  const isPostsMode = currentRoute === '/posts';
  const getDocTitle = (doc) => {
    // Use the saved title directly
    return doc.title || 'Untitled';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>{isPostsMode ? 'Social Posts' : 'Documents'}</h2>
        {isPostsMode ? (
          <button onClick={onNewPost} className="new-doc-btn">
            <Plus size={16} /> New
          </button>
        ) : (
          <button onClick={onNewDocument} className="new-doc-btn">
            <Plus size={16} /> New
          </button>
        )}
      </div>
      
      {onNavigate && (
        <div className="mode-toggle-container">
          <div className="mode-toggle">
            <button
              className={`mode-toggle-btn ${!isPostsMode ? 'active' : ''}`}
              onClick={() => onNavigate('/')}
              aria-label="Document mode"
            >
              <FileText size={16} />
              <span>Documents</span>
            </button>
            <button
              className={`mode-toggle-btn ${isPostsMode ? 'active' : ''}`}
              onClick={() => onNavigate('/posts')}
              aria-label="Social Post mode"
            >
              <Megaphone size={16} />
              <span>Posts</span>
            </button>
          </div>
        </div>
      )}
      
      {isPostsMode ? (
        <div className="document-list">
          {/* Empty spacer for posts mode to push settings to bottom */}
        </div>
      ) : (
        <div className="document-list">
          {documents.map((doc) => (
          <div
            key={doc.id}
            className={`doc-item ${currentDocId === doc.id ? 'active' : ''}`}
            onClick={() => onSelectDocument(doc.id)}
          >
            <div className="doc-item-content">
              <div className="doc-title-row">
                <span className="doc-title">{getDocTitle(doc)}</span>
                <div className="delete-btn-container">
                  {deleteConfirmId === doc.id ? (
                    <>
                      <button
                        className="cancel-btn"
                        onClick={onCancelDelete}
                        aria-label="Cancel delete"
                      >
                        <X size={16} />
                      </button>
                      <button
                        className="confirm-btn"
                        onClick={(e) => onConfirmDelete(doc.id, e)}
                        aria-label="Confirm delete"
                      >
                        <Check size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="delete-btn"
                      onClick={(e) => onDeleteClick(doc.id, e)}
                      aria-label="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              {doc.updatedAt && (
                <span className="doc-date">{formatDate(doc.updatedAt)}</span>
              )}
            </div>
          </div>
          ))}
        </div>
      )}
      
      {isPostsMode ? (
        postSettings && (
          <PostSettings 
            {...postSettings}
            collapsed={postSettingsCollapsed}
            onToggle={onTogglePostSettings}
          />
        )
      ) : (
        <DocumentInfo 
          currentDocId={currentDocId}
          documents={documents}
          collapsed={docInfoCollapsed}
          onToggle={onToggleDocInfo}
        />
      )}
    </div>
  );
};
