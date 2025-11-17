import { useState, useEffect } from 'react';
import { db } from '../db';

export const savePostEntry = async (entry) => {
  try {
    const now = new Date();
    
    // Safe stringify with validation
    const safeStringify = (value, fallback) => {
      try {
        if (value === undefined || value === null) {
          return JSON.stringify(fallback);
        }
        const stringified = JSON.stringify(value);
        // Validate by parsing it back
        JSON.parse(stringified);
        return stringified;
      } catch (e) {
        console.warn('Failed to stringify value, using fallback:', e);
        return JSON.stringify(fallback);
      }
    };

    const entryData = {
      id: entry.id,
      text: entry.text || '',
      suggestions: safeStringify(entry.suggestions, []),
      generations: safeStringify(entry.generations, []),
      settings: safeStringify(entry.settings, {}),
      submissions: safeStringify(entry.submissions, []),
      isGenerating: entry.isGenerating || false,
      updatedAt: now
    };

    // Check if entry exists
    const existing = await db.postEntries.get(entry.id);
    if (existing) {
      // Update existing entry
      entryData.createdAt = existing.createdAt;
      await db.postEntries.update(entry.id, entryData);
    } else {
      // Create new entry
      entryData.createdAt = now;
      await db.postEntries.add(entryData);
    }
  } catch (error) {
    console.error('Error saving post entry:', error);
  }
};

export const getAllPostEntries = async () => {
  try {
    const entries = await db.postEntries.orderBy('updatedAt').reverse().toArray();
    return entries.map(entry => {
      // Safe JSON parse with fallback
      const safeParse = (jsonString, fallback) => {
        try {
          if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
            return fallback;
          }
          return JSON.parse(jsonString);
        } catch (e) {
          console.warn('Failed to parse JSON, using fallback:', e);
          return fallback;
        }
      };

      return {
        id: entry.id,
        text: entry.text || '',
        suggestions: safeParse(entry.suggestions, []),
        generations: safeParse(entry.generations, []),
        settings: safeParse(entry.settings, {}),
        submissions: safeParse(entry.submissions, []),
        isGenerating: false, // Always load as not generating
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      };
    });
  } catch (error) {
    console.error('Error loading post entries:', error);
    return [];
  }
};

export const deletePostEntry = async (entryId) => {
  try {
    await db.postEntries.delete(entryId);
  } catch (error) {
    console.error('Error deleting post entry:', error);
  }
};

export const clearAllPostEntries = async () => {
  try {
    await db.postEntries.clear();
  } catch (error) {
    console.error('Error clearing post entries:', error);
  }
};

export const repairCorruptedEntries = async () => {
  try {
    const entries = await db.postEntries.toArray();
    let repairedCount = 0;
    
    for (const entry of entries) {
      let needsRepair = false;
      const repairedEntry = { ...entry };
      
      // Check and repair each JSON field
      const fields = ['suggestions', 'generations', 'settings', 'submissions'];
      const defaults = { suggestions: '[]', generations: '[]', settings: '{}', submissions: '[]' };
      
      for (const field of fields) {
        try {
          if (!entry[field] || entry[field] === 'undefined' || entry[field] === 'null') {
            repairedEntry[field] = defaults[field];
            needsRepair = true;
          } else {
            JSON.parse(entry[field]); // Test if valid
          }
        } catch (e) {
          console.warn(`Repairing corrupted ${field} for entry ${entry.id}`);
          repairedEntry[field] = defaults[field];
          needsRepair = true;
        }
      }
      
      if (needsRepair) {
        await db.postEntries.update(entry.id, repairedEntry);
        repairedCount++;
      }
    }
    
    console.log(`Repaired ${repairedCount} corrupted entries`);
    return repairedCount;
  } catch (error) {
    console.error('Error repairing corrupted entries:', error);
    return 0;
  }
};

export const usePostEntries = () => {
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteToast, setDeleteToast] = useState(null);
  const [sortBy, setSortBy] = useState(() => {
    try {
      return localStorage.getItem('postEntriesSortBy') || 'updated';
    } catch {
      return 'updated';
    }
  });

  const loadEntries = async () => {
    const loadedEntries = await getAllPostEntries();
    // Sort based on current sort preference
    const sortedEntries = sortBy === 'created' 
      ? [...loadedEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : loadedEntries; // Already sorted by updatedAt from getAllPostEntries
    setEntries(sortedEntries);
    if (sortedEntries.length > 0 && !currentEntryId) {
      setCurrentEntryId(sortedEntries[0].id);
    }
  };

  const toggleSort = () => {
    const newSort = sortBy === 'updated' ? 'created' : 'updated';
    setSortBy(newSort);
    try {
      localStorage.setItem('postEntriesSortBy', newSort);
    } catch {}
  };

  const handleNewEntry = async () => {
    const newEntryId = Date.now();
    const newEntry = {
      id: newEntryId,
      text: '',
      suggestions: [],
      settings: {},
      isGenerating: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await savePostEntry(newEntry);
    await loadEntries();
    setCurrentEntryId(newEntryId);
    return newEntryId;
  };

  useEffect(() => {
    const initialize = async () => {
      const loadedEntries = await getAllPostEntries();
      const sortedEntries = sortBy === 'created' 
        ? [...loadedEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : loadedEntries;
      setEntries(sortedEntries);
      if (sortedEntries.length > 0 && !currentEntryId) {
        setCurrentEntryId(sortedEntries[0].id);
      } else if (sortedEntries.length === 0) {
        // Create first entry if none exist
        const newEntryId = Date.now();
        const newEntry = {
          id: newEntryId,
          text: '',
          suggestions: [],
          settings: {},
          isGenerating: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await savePostEntry(newEntry);
        const updatedEntries = await getAllPostEntries();
        const sortedUpdated = sortBy === 'created' 
          ? [...updatedEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : updatedEntries;
        setEntries(sortedUpdated);
        setCurrentEntryId(newEntryId);
      }
    };
    initialize();
  }, [sortBy]);

  const getEntryTitle = (entry) => {
    if (entry.text && entry.text.trim()) {
      const text = entry.text.trim();
      // Return first 50 chars as title
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }
    return 'Untitled Post';
  };

  const handleSaveEntry = async (entry) => {
    await savePostEntry(entry);
    await loadEntries();
  };

  const handleSelectEntry = (entryId, onSelect) => {
    setCurrentEntryId(entryId);
    if (onSelect) onSelect();
  };

  const handleDeleteClick = (entryId, e) => {
    e.stopPropagation();
    
    if (entries.length === 1) {
      setDeleteToast({ type: 'error', message: 'Cannot delete last post' });
      setTimeout(() => setDeleteToast(null), 2000);
      return;
    }
    
    setDeleteConfirmId(entryId);
    setTimeout(() => setDeleteConfirmId(null), 3000);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const handleConfirmDelete = async (entryId, e) => {
    e.stopPropagation();
    
    setDeleteConfirmId(null);
    await deletePostEntry(entryId);
    await loadEntries();
    if (currentEntryId === entryId) {
      const remainingEntries = await getAllPostEntries();
      setCurrentEntryId(remainingEntries[0]?.id || null);
    }
    
    setDeleteToast({ type: 'success', message: 'Post deleted' });
    setTimeout(() => setDeleteToast(null), 2000);
  };

  return {
    currentEntryId,
    entries,
    deleteConfirmId,
    deleteToast,
    sortBy,
    setCurrentEntryId,
    getEntryTitle,
    handleSaveEntry,
    handleNewEntry,
    handleSelectEntry,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    loadEntries,
    toggleSort,
  };
};

