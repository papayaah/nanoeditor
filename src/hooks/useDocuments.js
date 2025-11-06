import { useState, useEffect } from 'react';
import { getAllDocuments, createDocument, deleteDocument, loadDocument, saveDocument } from '../db';

export const useDocuments = () => {
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documents, setDocuments] = useState([]);

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

  const handleSave = async (content) => {
    if (!currentDocId) return;
    await saveDocument(currentDocId, content);
  };

  const handleNewDocument = async () => {
    const newDoc = await createDocument();
    await loadDocuments();
    setCurrentDocId(newDoc.id);
  };

  const handleSelectDocument = (docId) => {
    setCurrentDocId(docId);
  };

  const handleDeleteDocument = async (docId) => {
    if (documents.length === 1) {
      alert('Cannot delete the last document');
      return;
    }
    if (confirm('Delete this document?')) {
      await deleteDocument(docId);
      await loadDocuments();
      if (currentDocId === docId) {
        const docs = await getAllDocuments();
        setCurrentDocId(docs[0]?.id || null);
      }
    }
  };

  return {
    currentDocId,
    documents,
    handleSave,
    handleNewDocument,
    handleSelectDocument,
    handleDeleteDocument,
  };
};
