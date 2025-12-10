/**
 * @reactkits.dev/react-writer
 *
 * Headless AI-powered writing assistant for React.
 * Works with Tailwind, Mantine, or any UI library.
 */

// Hooks
export { usePostCreator } from './hooks/usePostCreator';
export { usePostEntries, savePostEntry, getAllPostEntries, deletePostEntry, clearAllPostEntries, repairCorruptedEntries } from './hooks/usePostEntries';
export { useDocuments } from './hooks/useDocuments';
export { useWriter } from './hooks/useWriter';
export { useRewriter } from './hooks/useRewriter';
export { useAI } from './hooks/useAI';
export { useMarkdown } from './hooks/useMarkdown';
export { useMarkdownPaste } from './hooks/useMarkdownPaste';
export { usePdfExport } from './hooks/usePdfExport';
export { useSettings } from './hooks/useSettings';
export { useUILibrary } from './hooks/useUILibrary';

// Components - Posts
export { createPostCreator, PostCreator } from './components/posts/createPostCreator';
export { AIAssistantToggle } from './components/posts/AIAssistantToggle';
export { AIOptionsPanel } from './components/posts/AIOptionsPanel';
export { PostSettings } from './components/posts/PostSettings';

// Components - Articles/Documents
export { default as BlockNoteEditor } from './components/documents/BlockNoteEditor';
export { DocumentInfo } from './components/documents/DocumentInfo';
export { RewriteButton } from './components/documents/RewriteButton';
export { StreamingBlockIndicator } from './components/documents/StreamingBlockIndicator';
export { WriterPrompt } from './components/documents/WriterPrompt';

// AI Adapters
export { AIAdapter, ChromeAIAdapter, OpenAIAdapter, GeminiAdapter, createDefaultAdapter, createAdapter } from './ai/adapters';

// Storage
export { StorageAdapter, createIDBAdapter, db, createDocument, saveDocument, loadDocument, getAllDocuments, deleteDocument } from './storage';

// Presets
export { tailwindPreset, mantinePreset } from './presets';
