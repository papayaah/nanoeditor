/**
 * Storage Adapter Interface
 *
 * Implement this interface to provide custom storage backends.
 * The default implementation uses IndexedDB via the idb library.
 */

/**
 * @typedef {Object} Document
 * @property {number} id - Document ID
 * @property {string} title - Document title
 * @property {string} content - Document content (JSON stringified)
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} PostEntry
 * @property {string|number} id - Entry ID
 * @property {string} text - Original text
 * @property {string} suggestions - JSON stringified suggestions array
 * @property {string} generations - JSON stringified generations array
 * @property {string} settings - JSON stringified settings object
 * @property {string} submissions - JSON stringified submissions array
 * @property {boolean} isGenerating - Whether generation is in progress
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Storage Adapter Interface
 *
 * All storage adapters must implement these methods.
 */
export class StorageAdapter {
  /**
   * Get the adapter name
   * @returns {string}
   */
  getName() {
    return this.constructor.name.toLowerCase().replace('adapter', '');
  }

  // Document operations

  /**
   * Create a new document
   * @returns {Promise<Document>}
   */
  async createDocument() {
    throw new Error('createDocument() must be implemented by adapter');
  }

  /**
   * Save a document
   * @param {number} id - Document ID
   * @param {any} content - Document content
   * @param {string} [title] - Document title
   * @returns {Promise<void>}
   */
  async saveDocument(id, content, title) {
    throw new Error('saveDocument() must be implemented by adapter');
  }

  /**
   * Load a document by ID
   * @param {number} id - Document ID
   * @returns {Promise<any>} - Document content
   */
  async loadDocument(id) {
    throw new Error('loadDocument() must be implemented by adapter');
  }

  /**
   * Get all documents
   * @returns {Promise<Document[]>}
   */
  async getAllDocuments() {
    throw new Error('getAllDocuments() must be implemented by adapter');
  }

  /**
   * Delete a document
   * @param {number} id - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(id) {
    throw new Error('deleteDocument() must be implemented by adapter');
  }

  // Post entry operations

  /**
   * Save a post entry
   * @param {PostEntry} entry - Post entry data
   * @returns {Promise<void>}
   */
  async savePostEntry(entry) {
    throw new Error('savePostEntry() must be implemented by adapter');
  }

  /**
   * Get all post entries
   * @returns {Promise<PostEntry[]>}
   */
  async getAllPostEntries() {
    throw new Error('getAllPostEntries() must be implemented by adapter');
  }

  /**
   * Delete a post entry
   * @param {string|number} id - Entry ID
   * @returns {Promise<void>}
   */
  async deletePostEntry(id) {
    throw new Error('deletePostEntry() must be implemented by adapter');
  }

  /**
   * Clear all post entries
   * @returns {Promise<void>}
   */
  async clearAllPostEntries() {
    throw new Error('clearAllPostEntries() must be implemented by adapter');
  }
}
