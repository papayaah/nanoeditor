import { useState, useEffect } from 'react';
import { getAllDocuments, createDocument, deleteDocument, saveDocument } from '../db';

export const useDocuments = () => {
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteToast, setDeleteToast] = useState(null);
  const [sortBy, setSortBy] = useState(() => {
    try {
      return localStorage.getItem('documentsSortBy') || 'updated';
    } catch {
      return 'updated';
    }
  });

  useEffect(() => {
    loadDocuments();
  }, [sortBy]);

  const loadDocuments = async () => {
    const docs = await getAllDocuments();
    
    // Sort based on current sort preference
    const sortedDocs = sortBy === 'created' 
      ? [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : docs; // Already sorted by updatedAt from getAllDocuments
    
    setDocuments(sortedDocs);
    if (sortedDocs.length > 0 && !currentDocId) {
      setCurrentDocId(sortedDocs[0].id);
    } else if (sortedDocs.length === 0) {
      const newDoc = await createDocument();
      setDocuments([newDoc]);
      setCurrentDocId(newDoc.id);
    }
  };

  const toggleSort = () => {
    const newSort = sortBy === 'updated' ? 'created' : 'updated';
    setSortBy(newSort);
    try {
      localStorage.setItem('documentsSortBy', newSort);
    } catch {}
  };

  const getDocTitle = (doc) => {
    if (doc.title && doc.title !== 'Untitled Document') {
      return doc.title;
    }
    
    // Parse content - handle both string and array
    let content;
    if (typeof doc.content === 'string') {
      content = JSON.parse(doc.content || '[]');
    } else {
      content = doc.content || [];
    }
    
    // Extract text from first block
    if (content.length > 0) {
      const firstBlock = content[0];
      
      // Check if block has content array with text
      if (firstBlock.content && Array.isArray(firstBlock.content)) {
        const textContent = firstBlock.content
          .filter(item => item.type === 'text' && item.text)
          .map(item => item.text)
          .join('');
        
        if (textContent.trim()) {
          return textContent.trim();
        }
      }
    }
    
    return 'Untitled';
  };

  const handleSave = async (content) => {
    if (!currentDocId) return;
    
    // Extract title directly from the new content
    let title = 'Untitled';
    if (content.length > 0 && content[0].content && Array.isArray(content[0].content)) {
      const textContent = content[0].content
        .filter(item => item.type === 'text' && item.text)
        .map(item => item.text)
        .join('');
      
      if (textContent.trim()) {
        title = textContent.trim();
      }
    }
    
    // Save to database with title
    await saveDocument(currentDocId, content, title);
    
    // Update local state - create new array to trigger re-render
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === currentDocId 
          ? { ...doc, title, content: JSON.stringify(content), updatedAt: new Date() }
          : doc
      )
    );
  };

  const handleNewDocument = async () => {
    const newDoc = await createDocument();
    await loadDocuments();
    setCurrentDocId(newDoc.id);
  };

  const handleSelectDocument = (docId, onSelect) => {
    setCurrentDocId(docId);
    if (onSelect) onSelect();
  };

  const handleDeleteClick = (docId, e) => {
    e.stopPropagation();
    
    if (documents.length === 1) {
      setDeleteToast({ type: 'error', message: 'Cannot delete last document' });
      setTimeout(() => setDeleteToast(null), 2000);
      return;
    }
    
    setDeleteConfirmId(docId);
    setTimeout(() => setDeleteConfirmId(null), 3000);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const handleConfirmDelete = async (docId, e) => {
    e.stopPropagation();
    
    setDeleteConfirmId(null);
    await deleteDocument(docId);
    await loadDocuments();
    if (currentDocId === docId) {
      const docs = await getAllDocuments();
      setCurrentDocId(docs[0]?.id || null);
    }
    
    setDeleteToast({ type: 'success', message: 'Document deleted' });
    setTimeout(() => setDeleteToast(null), 2000);
  };

  return {
    currentDocId,
    documents,
    deleteConfirmId,
    deleteToast,
    sortBy,
    setCurrentDocId,
    getDocTitle,
    handleSave,
    handleNewDocument,
    handleSelectDocument,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    toggleSort,
  };
};
