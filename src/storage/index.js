/**
 * Storage Module
 *
 * Export storage adapters and utilities.
 */

export { StorageAdapter } from './adapter.js';
export {
  createIDBAdapter,
  db,
  createDocument,
  saveDocument,
  loadDocument,
  getAllDocuments,
  deleteDocument,
  incrementAIGenerations,
} from './idb.js';
