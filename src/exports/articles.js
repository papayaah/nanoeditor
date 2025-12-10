/**
 * Article Editor Exports
 *
 * Subpath export for article/document editor functionality.
 * Import from '@reactkits.dev/react-writer/articles'
 */

// Optional: BlockNoteEditor component (lazy-loaded, requires @blocknote/mantine)
export { default as BlockNoteEditor } from '../components/documents/BlockNoteEditor';

// Headless hooks and services (work with any editor)
export { useDocuments } from '../hooks/useDocuments';
export { useWriter } from '../hooks/useWriter';
export { useRewriter } from '../hooks/useRewriter';
export { useMarkdown } from '../hooks/useMarkdown';
export { useMarkdownPaste } from '../hooks/useMarkdownPaste';
export { usePdfExport } from '../hooks/usePdfExport';

// Optional UI components (for BlockNoteEditor)
export { DocumentInfo } from '../components/documents/DocumentInfo';
export { DocumentInfo as ArticleInfo } from '../components/documents/DocumentInfo'; // Alias
export { RewriteButton } from '../components/documents/RewriteButton';
export { StreamingBlockIndicator } from '../components/documents/StreamingBlockIndicator';
export { WriterPrompt } from '../components/documents/WriterPrompt';

// Storage operations
export { createDocument, saveDocument, loadDocument, getAllDocuments, deleteDocument } from '../storage';
