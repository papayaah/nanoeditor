import { useState, useEffect } from 'react';
import { getAllDocuments, createDocument, deleteDocument, saveDocument } from '../db';

export const useDocuments = () => {
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteToast, setDeleteToast] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await getAllDocuments();
    setDocuments(docs);
    if (docs.length > 0 && !currentDocId) {
      setCurrentDocId(docs[0].id);
    } else if (docs.length === 0) {
      const newDoc = await createDocument();
      setDocuments([newDoc]);
      setCurrentDocId(newDoc.id);
    }
  };

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

  const handleSave = async (content) => {
    if (!currentDocId) return;
    await saveDocument(currentDocId, content);
    const updatedDocs = documents.map(doc => {
      if (doc.id === currentDocId) {
        const title = getDocTitle({ ...doc, content: JSON.stringify(content) });
        return { ...doc, title, content: JSON.stringify(content) };
      }
      return doc;
    });
    setDocuments(updatedDocs);
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
    setCurrentDocId,
    getDocTitle,
    handleSave,
    handleNewDocument,
    handleSelectDocument,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
  };
};
