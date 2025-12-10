/**
 * Hooks Exports
 *
 * Subpath export for all hooks and AI adapters.
 * Import from '@reactkits.dev/react-writer/hooks'
 */

// Post Creator Hooks
export { usePostCreator } from '../hooks/usePostCreator';
export { usePostEntries, savePostEntry, getAllPostEntries, deletePostEntry, clearAllPostEntries, repairCorruptedEntries } from '../hooks/usePostEntries';

// Article/Document Hooks
export { useDocuments } from '../hooks/useDocuments';
export { useWriter } from '../hooks/useWriter';
export { useRewriter } from '../hooks/useRewriter';
export { useMarkdown } from '../hooks/useMarkdown';
export { useMarkdownPaste } from '../hooks/useMarkdownPaste';
export { usePdfExport } from '../hooks/usePdfExport';

// Utility Hooks
export { useAI } from '../hooks/useAI';
export { useSettings } from '../hooks/useSettings';
export { useUILibrary } from '../hooks/useUILibrary';

// AI Adapters
export { AIAdapter } from '../ai/adapters/base';
export { ChromeAIAdapter } from '../ai/adapters/chrome';
export { OpenAIAdapter } from '../ai/adapters/openai';
export { GeminiAdapter } from '../ai/adapters/gemini';
export { createDefaultAdapter, createAdapter } from '../ai/adapters';

// Convenience aliases for adapter creation
import { ChromeAIAdapter as ChromeAI } from '../ai/adapters/chrome';
import { OpenAIAdapter as OpenAI } from '../ai/adapters/openai';
import { GeminiAdapter as Gemini } from '../ai/adapters/gemini';

export const createChromeAIAdapter = () => new ChromeAI();
export const createOpenAIAdapter = (config) => new OpenAI(config);
export const createGeminiAdapter = (config) => new Gemini(config);
