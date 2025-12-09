import { openDB } from 'idb';

// ============================================================================
// Database Configuration
// ============================================================================

const DB_NAME = 'Writer';
const DB_VERSION = 5;

// ============================================================================
// Database Instance
// ============================================================================

let dbPromise = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`[DB] Upgrading from version ${oldVersion} to ${newVersion}`);

        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', {
            keyPath: 'id',
            autoIncrement: true,
          });
          docStore.createIndex('by-updatedAt', 'updatedAt');
          console.log('[DB] Created documents store');
        } else {
          // Store exists, check if index exists
          const transaction = db.transaction(['documents'], 'readwrite');
          const docStore = transaction.objectStore('documents');
          if (!docStore.indexNames.contains('by-updatedAt')) {
            docStore.createIndex('by-updatedAt', 'updatedAt');
            console.log('[DB] Created by-updatedAt index on documents');
          }
        }

        // Post entries store
        if (!db.objectStoreNames.contains('postEntries')) {
          const entryStore = db.createObjectStore('postEntries', {
            keyPath: 'id',
          });
          entryStore.createIndex('by-updatedAt', 'updatedAt');
          console.log('[DB] Created postEntries store');
        } else {
          // Store exists, check if index exists
          const transaction = db.transaction(['postEntries'], 'readwrite');
          const entryStore = transaction.objectStore('postEntries');
          if (!entryStore.indexNames.contains('by-updatedAt')) {
            entryStore.createIndex('by-updatedAt', 'updatedAt');
            console.log('[DB] Created by-updatedAt index on postEntries');
          }
        }
      },
    });
  }
  return dbPromise;
};

// ============================================================================
// Compatibility Layer for db.postEntries (used by usePostEntries.js)
// ============================================================================

const createPostEntriesCompat = () => {
  return {
    async get(id) {
      const db = await getDB();
      return await db.get('postEntries', id);
    },
    async add(data) {
      const db = await getDB();
      return await db.add('postEntries', data);
    },
    async update(id, updates) {
      const db = await getDB();
      const existing = await db.get('postEntries', id);
      if (existing) {
        return await db.put('postEntries', { ...existing, ...updates });
      }
      throw new Error(`Entry with id ${id} not found`);
    },
    async delete(id) {
      const db = await getDB();
      return await db.delete('postEntries', id);
    },
    async clear() {
      const db = await getDB();
      return await db.clear('postEntries');
    },
    async toArray() {
      const db = await getDB();
      return await db.getAll('postEntries');
    },
    orderBy(field) {
      return {
        reverse() {
          return {
            async toArray() {
              const db = await getDB();
              const tx = db.transaction('postEntries', 'readonly');
              const index = tx.store.index('by-updatedAt');
              const entries = await index.getAll();
              await tx.done;
              return entries.reverse();
            },
          };
        },
      };
    },
  };
};

// Export db object for backward compatibility
export const db = {
  postEntries: createPostEntriesCompat(),
};

// ============================================================================
// Document Operations
// ============================================================================

export const createDocument = async () => {
  try {
    const db = await getDB();
    const now = new Date();
    const id = await db.add('documents', {
      title: 'Untitled Document',
      content: JSON.stringify([]),
      createdAt: now,
      updatedAt: now,
    });
    const doc = await db.get('documents', id);
    return doc;
  } catch (error) {
    console.error('Error creating document:', error);
    return null;
  }
};

export const saveDocument = async (docId, content, title) => {
  try {
    const db = await getDB();
    const existing = await db.get('documents', docId);
    if (!existing) {
      console.error('Document not found:', docId);
      return;
    }

    const updateData = {
      ...existing,
      content: JSON.stringify(content),
      updatedAt: new Date(),
    };

    if (title) {
      updateData.title = title;
    }

    await db.put('documents', updateData);
  } catch (error) {
    console.error('Error saving document:', error);
  }
};

export const loadDocument = async (docId) => {
  try {
    const db = await getDB();
    const doc = await db.get('documents', docId);
    return doc ? JSON.parse(doc.content) : null;
  } catch (error) {
    console.error('Error loading document:', error);
    return null;
  }
};

export const getAllDocuments = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction('documents', 'readonly');
    const index = tx.store.index('by-updatedAt');
    const docs = await index.getAll();
    await tx.done;
    return docs.reverse(); // Most recent first
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
};

export const deleteDocument = async (docId) => {
  try {
    const db = await getDB();
    await db.delete('documents', docId);
  } catch (error) {
    console.error('Error deleting document:', error);
  }
};

export const incrementAIGenerations = async (docId) => {
  try {
    const db = await getDB();
    const doc = await db.get('documents', docId);
    if (doc) {
      const currentCount = doc.aiGenerations || 0;
      await db.put('documents', {
        ...doc,
        aiGenerations: currentCount + 1,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error incrementing AI generations:', error);
  }
};
