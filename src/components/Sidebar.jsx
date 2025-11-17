import { Plus, Trash2, Check, X, FileText, Megaphone, Clock, CalendarPlus } from 'lucide-react';
import { DocumentInfo } from './documents/DocumentInfo';
import { PostSettings } from './posts/PostSettings';

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
  postSettings,
  // Post entries props
  postEntries,
  currentEntryId,
  onSelectEntry,
  onDeleteEntryClick,
  onConfirmDeleteEntry,
  onCancelDeleteEntry,
  entryDeleteConfirmId,
  getEntryTitle,
  sortBy,
  onToggleSort,
  // Document sorting props
  docSortBy,
  onToggleDocSort
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
        <div className="sidebar-header-actions">
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
      
      <div className="list-controls">
        {isPostsMode && onToggleSort && (
          <button 
            onClick={onToggleSort} 
            className="sort-toggle-btn"
            title={sortBy === 'updated' ? 'Sorted by last updated' : 'Sorted by date created'}
          >
            {sortBy === 'updated' ? <Clock size={14} /> : <CalendarPlus size={14} />}
            <span className="sort-label">{sortBy === 'updated' ? 'Last updated' : 'Date created'}</span>
          </button>
        )}
        {!isPostsMode && onToggleDocSort && (
          <button 
            onClick={onToggleDocSort} 
            className="sort-toggle-btn"
            title={docSortBy === 'updated' ? 'Sorted by last updated' : 'Sorted by date created'}
          >
            {docSortBy === 'updated' ? <Clock size={14} /> : <CalendarPlus size={14} />}
            <span className="sort-label">{docSortBy === 'updated' ? 'Last updated' : 'Date created'}</span>
          </button>
        )}
      </div>
      
      {isPostsMode ? (
        <div className="document-list">
          {postEntries && postEntries.map((entry) => (
            <div
              key={entry.id}
              className={`doc-item ${currentEntryId === entry.id ? 'active' : ''}`}
              onClick={() => onSelectEntry && onSelectEntry(entry.id)}
            >
              <div className="doc-item-content">
                <div className="doc-title-row">
                  <span className="doc-title">{getEntryTitle ? getEntryTitle(entry) : (entry.text || 'Untitled Post')}</span>
                  <div className="delete-btn-container">
                    {entryDeleteConfirmId === entry.id ? (
                      <>
                        <button
                          className="cancel-btn"
                          onClick={onCancelDeleteEntry}
                          aria-label="Cancel delete"
                        >
                          <X size={16} />
                        </button>
                        <button
                          className="confirm-btn"
                          onClick={(e) => onConfirmDeleteEntry && onConfirmDeleteEntry(entry.id, e)}
                          aria-label="Confirm delete"
                        >
                          <Check size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        className="delete-btn"
                        onClick={(e) => onDeleteEntryClick && onDeleteEntryClick(entry.id, e)}
                        aria-label="Delete post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                {entry.updatedAt && (
                  <span className="doc-date">{formatDate(entry.updatedAt)}</span>
                )}
              </div>
            </div>
          ))}
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
