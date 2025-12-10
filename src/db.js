/**
 * Database Module (Re-exports from storage/idb.js)
 *
 * This file maintains backward compatibility while the actual
 * implementation lives in the storage module.
 */

export {
  db,
  createDocument,
  saveDocument,
  loadDocument,
  getAllDocuments,
  deleteDocument,
  incrementAIGenerations,
} from './storage/idb.js';
