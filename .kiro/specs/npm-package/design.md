# Design Document

## Overview

The nano-editor-ai npm package provides AI-powered writing assistance through Chrome's built-in AI APIs. The package follows a **headless UI architecture**, completely separating business logic from UI presentation, allowing developers to integrate AI writing capabilities into any React application with their preferred UI library.

### Headless Architecture

The package is built on a **headless-first** approach:

- **Headless Hooks** - All business logic is exposed through framework-agnostic React hooks (`usePostCreator`, `useAI`, `useWriter`, `useRewriter`)
- **UI-Agnostic** - No UI components are required; developers bring their own (Tailwind, Mantine, Material-UI, Shadcn, etc.)
- **Component Factories** - Optional factory functions (`createPostCreator`) that accept UI components and wire them to headless hooks
- **Adapter Pattern** - Pluggable AI providers (Chrome, Gemini, OpenAI) and storage backends (IndexedDB, custom)

This architecture allows developers to:
1. Use headless hooks directly for complete UI control
2. Use component factories with their existing UI library
3. Swap AI providers without changing UI code
4. Integrate into existing applications without style conflicts

### Core Principles

1. **Modularity** - Developers import only what they need via subpath imports
2. **Flexibility** - Headless hooks and component factories work with any UI library
3. **Performance** - Minimal bundle size through tree-shaking and lightweight dependencies

### Technology Stack

- **React**: 19.x (peer dependency)
- **Storybook**: 10.x for component documentation
- **Build Tool**: Vite 7.x in library mode
- **TypeScript**: Latest with full type definitions
- **Storage**: idb (~1.5KB) for IndexedDB operations

**Package Versions:**
```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "idb": "^8.0.0",
    "react-markdown": "^9.0.0"
  },
  "devDependencies": {
    "storybook": "^10.1.0",
    "@storybook/react": "^10.1.0",
    "@storybook/react-vite": "^10.1.0",
    "@storybook/addon-essentials": "^10.1.0",
    "@storybook/addon-interactions": "^10.1.0",
    "@storybook/addon-links": "^10.1.0",
    "@storybook/addon-a11y": "^10.1.0",
    "vite": "^7.0.0",
    "typescript": "^5.6.0"
  }
}
```

**Note:** The current demo application uses Dexie (~15KB) for storage, but the npm package will migrate to idb (~1.5KB) for optimal bundle size. The demo will later consume the published package.

## Architecture

### Package Structure

```
nano-editor-ai/
├── src/
│   ├── core/
│   │   ├── hooks/
│   │   │   ├── usePostCreator.js      # Post generation logic
│   │   │   ├── useAI.js               # AI adapter integration
│   │   │   └── useDocuments.js        # Document CRUD operations
│   │   ├── ai/
│   │   │   ├── adapter.js             # AI adapter interface
│   │   │   ├── chrome.js              # Chrome AI adapter
│   │   │   ├── gemini.js              # Google Gemini adapter
│   │   │   ├── openai.js              # OpenAI adapter
│   │   │   └── mock.js                # Mock adapter for testing/Storybook
│   │   ├── storage/
│   │   │   ├── idb.js                 # IndexedDB with idb wrapper
│   │   │   ├── adapter.js             # Storage adapter interface
│   │   │   └── schema.js              # Database schema definitions
│   │   └── utils/
│   │       ├── markdown.js            # Markdown parsing/rendering
│   │       └── validation.js          # Input validation
│   ├── components/
│   │   ├── post-creator/
│   │   │   ├── createPostCreator.jsx  # Component factory
│   │   │   ├── PostCreator.jsx        # Default implementation
│   │   │   └── PostCreator.css        # Base styles
│   │   ├── inline-assistant/
│   │   │   ├── InlineAssistant.jsx    # Floating widget
│   │   │   └── useInlineAssistant.js  # Widget logic
│   │   └── context-menu/
│   │       ├── ContextMenu.jsx        # Right-click menu
│   │       └── useContextMenu.js      # Menu logic
│   ├── editors/
│   │   ├── basic/
│   │   │   ├── BasicEditor.jsx        # Textarea + markdown
│   │   │   └── useBasicEditor.js      # Editor logic
│   │   ├── lexical/
│   │   │   ├── LexicalEditor.jsx      # Lexical integration
│   │   │   └── useLexicalAI.js        # AI integration for Lexical
│   │   └── blocknote/
│   │       ├── BlockNoteEditor.jsx    # BlockNote integration
│   │       └── useBlockNoteAI.js      # AI integration for BlockNote
│   ├── index.js                       # Main entry point
│   └── exports/
│       ├── post-creator.js            # Subpath: /post-creator
│       ├── editors.js                 # Subpath: /editors
│       └── hooks.js                   # Subpath: /hooks
├── demo/                              # Demo application (moved from root)
│   ├── src/
│   ├── public/
│   └── package.json
├── .storybook/                        # Storybook configuration
└── stories/                           # Component stories
    ├── PostCreator.stories.jsx
    ├── BasicEditor.stories.jsx
    └── hooks/
        ├── usePostCreator.stories.jsx
        └── useWriter.stories.jsx
```

### Subpath Exports

The package.json defines subpath exports for modular imports:

```json
{
  "name": "nano-editor-ai",
  "exports": {
    ".": "./dist/index.js",
    "./post-creator": "./dist/exports/post-creator.js",
    "./editors/basic": "./dist/editors/basic/index.js",
    "./editors/lexical": "./dist/editors/lexical/index.js",
    "./editors/blocknote": "./dist/editors/blocknote/index.js",
    "./hooks": "./dist/exports/hooks.js",
    "./ai/chrome": "./dist/ai/chrome.js",
    "./ai/gemini": "./dist/ai/gemini.js",
    "./ai/openai": "./dist/ai/openai.js",
    "./ai/mock": "./dist/ai/mock.js",
    "./styles": "./dist/styles.css"
  }
}
```

### Dependency Strategy

**Core Dependencies** (always included):
- `idb` (~1.5KB) - IndexedDB wrapper
- `react-markdown` (~10KB) - Markdown rendering

**Peer Dependencies** (consumer provides):
- `react` (^18.0.0 || ^19.0.0)
- `react-dom` (^18.0.0 || ^19.0.0)

**Optional Peer Dependencies** (for specific features):
- `lexical` (^0.12.0) - For Lexical editor
- `@lexical/react` (^0.12.0) - Lexical React bindings
- `@blocknote/core` (^0.41.0) - For BlockNote editor
- `@blocknote/react` (^0.41.0) - BlockNote React bindings
- `@blocknote/mantine` (^0.41.0) - BlockNote Mantine theme

## Components and Interfaces

### 1. Headless Hooks

#### usePostCreator

Manages all state and logic for social media post generation.

**Interface:**
```typescript
interface UsePostCreatorOptions {
  currentEntryId?: string;
  onEntrySaved?: () => void;
  onSettingsExport?: (settings: PostSettings) => void;
  storageAdapter?: StorageAdapter;
  aiAdapter?: AIAdapter; // Custom AI adapter
}

interface UsePostCreatorReturn {
  // State
  inputText: string;
  setInputText: (text: string) => void;
  currentEntry: PostEntry | null;
  copiedId: string | null;
  isGenerating: boolean;
  aiAvailable: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  
  // Settings
  settings: {
    apiMode: 'writer' | 'rewriter';
    setApiMode: (mode: 'writer' | 'rewriter') => void;
    tone: string;
    setTone: (tone: string) => void;
    format: string;
    setFormat: (format: string) => void;
    length: string;
    setLength: (length: string) => void;
    // ... other settings
  };
  
  // Actions
  handleSubmit: () => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  handleCopy: (text: string, entryId: string, index: string) => void;
  handleRegenerate: () => Promise<void>;
  generateSuggestions: (text: string, targetEntryId?: string, forceNew?: boolean) => Promise<void>;
  
  // Computed
  charCount: number;
  wordCount: number;
}
```

**Behavior:**
- Manages post entry state (current entry, submissions, generations)
- Handles AI generation with streaming support via configured AI adapter
- Persists settings to localStorage
- Saves entries to storage adapter
- Provides clipboard operations
- Supports adapter switching without losing state

#### useAI

Manages AI adapter integration and availability detection.

**Interface:**
```typescript
interface UseAIOptions {
  aiAdapter?: AIAdapter; // Custom AI adapter
  defaultAdapter?: 'chrome' | 'gemini' | 'openai'; // Default adapter to use
}

interface UseAIReturn {
  aiAvailable: boolean | null; // null = checking, true/false = result
  adapter: AIAdapter; // Current AI adapter
  setAdapter: (adapter: AIAdapter) => void;
  generateText: (options: GenerateTextOptions) => Promise<string | AsyncIterable<string>>;
  rewriteText: (options: RewriteTextOptions) => Promise<string | AsyncIterable<string>>;
  showAiModal: boolean;
  setShowAiModal: (show: boolean) => void;
}
```

**Behavior:**
- Accepts custom AI adapter or uses default (Chrome AI)
- Checks adapter availability on mount
- Provides unified interface for text generation and rewriting
- Handles adapter switching at runtime
- Provides modal state for setup instructions

### 2. Component Factory Pattern

#### createPostCreator

Factory function that accepts UI components and returns a functional PostCreator.

**Interface:**
```typescript
interface UIComponents {
  Input?: ComponentType<InputProps>;
  Button?: ComponentType<ButtonProps>;
  Card?: ComponentType<CardProps>;
  Badge?: ComponentType<BadgeProps>;
}

interface PostCreatorProps {
  currentEntryId?: string;
  onEntrySaved?: () => void;
  onSettingsExport?: (settings: PostSettings) => void;
  darkMode?: boolean;
  storageAdapter?: StorageAdapter;
  aiAdapter?: AIAdapter; // Custom AI adapter
}

function createPostCreator(components?: UIComponents): ComponentType<PostCreatorProps>
```

**Component Detection:**
The factory auto-detects component types by name:
- `TextField`, `Textarea`, `Input` → Input component
- `Button` → Button component
- `Card`, `Paper`, `Box` → Card component
- `Badge`, `Chip`, `Tag` → Badge component

**Prop Normalization:**
The factory normalizes props across different UI libraries:

```typescript
// Input normalization
const normalizeInputProps = (props) => ({
  value: props.value,
  onChange: (e) => props.onChange(e?.target?.value ?? e),
  onKeyDown: props.onKeyDown,
  placeholder: props.placeholder,
  disabled: props.disabled,
  multiline: true,
  rows: 3,
});

// Button normalization
const normalizeButtonProps = (props) => ({
  children: props.children,
  onClick: props.onClick,
  disabled: props.disabled,
  variant: props.variant || 'primary',
  color: props.variant === 'primary' ? 'primary' : 'default',
});
```

**Example Usage:**

```jsx
// Tailwind + Headless UI
import { createPostCreator } from 'nano-editor-ai/post-creator';

const PostCreator = createPostCreator({
  Input: ({ value, onChange, ...props }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
      {...props}
    />
  ),
  Button: ({ children, ...props }) => (
    <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }) => (
    <div className="p-4 border rounded shadow" {...props}>
      {children}
    </div>
  ),
});

// Mantine
import { Textarea, Button, Card, Badge } from '@mantine/core';
const PostCreator = createPostCreator({
  Input: Textarea,
  Button,
  Card,
  Badge,
});

// Material-UI
import { TextField, Button, Card, Chip } from '@mui/material';
const PostCreator = createPostCreator({
  Input: TextField,
  Button,
  Card,
  Badge: Chip,
});
```

### 3. AI Adapter Interface

The AI adapter interface abstracts AI provider implementation, allowing developers to swap between Chrome AI, Gemini, OpenAI, or custom providers.

**Interface:**
```typescript
interface AIAdapter {
  // Provider identification
  name: string; // 'chrome', 'gemini', 'openai', 'custom'
  
  // Availability check
  isAvailable: () => Promise<boolean>;
  
  // Text generation (like Chrome Writer)
  generateText: (options: GenerateTextOptions) => Promise<string | AsyncIterable<string>>;
  
  // Text rewriting (like Chrome Rewriter)
  rewriteText: (options: RewriteTextOptions) => Promise<string | AsyncIterable<string>>;
  
  // Configuration
  configure?: (config: AIAdapterConfig) => void;
}

interface GenerateTextOptions {
  prompt: string;
  context?: string;
  tone?: 'casual' | 'neutral' | 'formal';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface RewriteTextOptions {
  text: string;
  context?: string;
  tone?: 'more-casual' | 'as-is' | 'more-formal';
  format?: 'as-is' | 'markdown' | 'plain-text';
  length?: 'shorter' | 'as-is' | 'longer';
  stream?: boolean;
}

interface AIAdapterConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  [key: string]: any; // Provider-specific config
}
```

**Built-in Adapters:**

**1. Chrome AI Adapter (Default)**
```typescript
import { createChromeAIAdapter } from 'nano-editor-ai/ai/chrome';

const chromeAdapter = createChromeAIAdapter();

// Usage
const available = await chromeAdapter.isAvailable();
const text = await chromeAdapter.generateText({
  prompt: 'Write a tweet about AI',
  tone: 'casual',
  length: 'short',
  stream: true,
});
```

**2. Gemini Adapter**
```typescript
import { createGeminiAdapter } from 'nano-editor-ai/ai/gemini';

const geminiAdapter = createGeminiAdapter({
  apiKey: 'YOUR_GEMINI_API_KEY',
  model: 'gemini-pro', // optional, defaults to gemini-pro
});

// Usage
const text = await geminiAdapter.generateText({
  prompt: 'Write a tweet about AI',
  tone: 'casual',
  length: 'short',
  stream: true,
});
```

**3. OpenAI Adapter**
```typescript
import { createOpenAIAdapter } from 'nano-editor-ai/ai/openai';

const openaiAdapter = createOpenAIAdapter({
  apiKey: 'YOUR_OPENAI_API_KEY',
  model: 'gpt-4', // optional, defaults to gpt-3.5-turbo
});

// Usage
const text = await openaiAdapter.generateText({
  prompt: 'Write a tweet about AI',
  temperature: 0.7,
  maxTokens: 100,
  stream: true,
});
```

**4. Mock Adapter (for Storybook/Testing)**
```typescript
import { createMockAdapter } from 'nano-editor-ai/ai/mock';

const mockAdapter = createMockAdapter({
  responses: {
    generateText: 'This is a mock generated text',
    rewriteText: 'This is a mock rewritten text',
  },
  delay: 1000, // Simulate network delay
  streamChunks: true, // Simulate streaming
});
```

**Custom Adapter Example:**
```typescript
// Create a custom adapter for a proprietary AI service
const customAdapter = {
  name: 'my-custom-ai',
  
  isAvailable: async () => {
    try {
      await fetch('https://my-ai-service.com/health');
      return true;
    } catch {
      return false;
    }
  },
  
  generateText: async (options) => {
    const response = await fetch('https://my-ai-service.com/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: options.prompt,
        context: options.context,
        settings: {
          tone: options.tone,
          length: options.length,
        },
      }),
    });
    
    if (options.stream) {
      // Return async iterable for streaming
      return streamResponse(response);
    }
    
    const data = await response.json();
    return data.text;
  },
  
  rewriteText: async (options) => {
    // Similar implementation for rewriting
  },
};

// Use custom adapter
const PostCreator = createPostCreator({
  aiAdapter: customAdapter,
});
```

**Adapter Integration with Hooks:**

```typescript
// usePostCreator with custom AI adapter
const postCreator = usePostCreator({
  aiAdapter: geminiAdapter,
});

// useAI with custom adapter
const { aiAvailable } = useAI({
  aiAdapter: openaiAdapter,
});
```

**Adapter Parameter Mapping:**

Different AI providers have different parameter names and ranges. The adapter implementation handles mapping:

```typescript
// Chrome AI: tone = 'casual' | 'neutral' | 'formal'
// Gemini: temperature = 0.0-1.0
// OpenAI: temperature = 0.0-2.0

// Adapter maps tone to temperature
const mapToneToTemperature = (tone, provider) => {
  const mapping = {
    chrome: { casual: 0.9, neutral: 0.7, formal: 0.5 },
    gemini: { casual: 0.9, neutral: 0.7, formal: 0.5 },
    openai: { casual: 1.2, neutral: 0.7, formal: 0.3 },
  };
  return mapping[provider][tone];
};
```

**Streaming Support:**

All adapters support streaming responses:

```typescript
const stream = await adapter.generateText({
  prompt: 'Write a story',
  stream: true,
});

// For streaming responses
if (Symbol.asyncIterator in stream) {
  for await (const chunk of stream) {
    console.log(chunk);
    updateUI(chunk);
  }
} else {
  // Non-streaming response
  console.log(stream);
}
```

### 4. Storage Adapter Interface

**Interface:**
```typescript
interface StorageAdapter {
  // Documents
  createDocument: () => Promise<Document>;
  saveDocument: (id: string, content: any, title?: string) => Promise<void>;
  loadDocument: (id: string) => Promise<any>;
  getAllDocuments: () => Promise<Document[]>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Post Entries
  createPostEntry: () => Promise<PostEntry>;
  savePostEntry: (entry: PostEntry) => Promise<void>;
  getPostEntry: (id: string) => Promise<PostEntry | null>;
  getAllPostEntries: () => Promise<PostEntry[]>;
  deletePostEntry: (id: string) => Promise<void>;
}

interface Document {
  id: string;
  title: string;
  content: any; // Format depends on editor
  createdAt: Date;
  updatedAt: Date;
}

interface PostEntry {
  id: string;
  text: string;
  submissions: Submission[];
  settings: PostSettings;
  isGenerating: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Submission {
  id: string;
  text: string;
  settings: PostSettings;
  generations: Generation[];
  timestamp: Date;
}

interface Generation {
  id: string;
  suggestions: string[]; // Array of 3 AI-generated variations
  isGenerating: boolean;
  timestamp: Date;
}
```

**Default Implementation (idb):**

The package uses **idb** (~1.5KB gzipped) for minimal bundle size. The current demo app uses Dexie, but the npm package will migrate to idb for better bundle optimization.

```javascript
import { openDB } from 'idb';

const DB_NAME = 'NanoEditorDB';
const DB_VERSION = 5;

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Documents store
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', {
          keyPath: 'id',
          autoIncrement: true,
        });
        docStore.createIndex('updatedAt', 'updatedAt');
      }
      
      // Post entries store
      if (!db.objectStoreNames.contains('postEntries')) {
        const entryStore = db.createObjectStore('postEntries', {
          keyPath: 'id',
        });
        entryStore.createIndex('updatedAt', 'updatedAt');
      }
    },
  });
};

export const createIDBAdapter = () => {
  let db;
  
  const getDB = async () => {
    if (!db) db = await initDB();
    return db;
  };

  return {
    // Document operations
    createDocument: async () => {
      const database = await getDB();
      const now = new Date();
      const doc = {
        title: 'Untitled Document',
        content: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      };
      const id = await database.add('documents', doc);
      return { ...doc, id };
    },
    
    saveDocument: async (id, content, title) => {
      const database = await getDB();
      const doc = await database.get('documents', id);
      if (doc) {
        doc.content = JSON.stringify(content);
        if (title) doc.title = title;
        doc.updatedAt = new Date();
        await database.put('documents', doc);
      }
    },
    
    loadDocument: async (id) => {
      const database = await getDB();
      const doc = await database.get('documents', id);
      return doc ? JSON.parse(doc.content) : null;
    },
    
    getAllDocuments: async () => {
      const database = await getDB();
      const tx = database.transaction('documents', 'readonly');
      const index = tx.store.index('updatedAt');
      const docs = await index.getAll();
      return docs.reverse(); // Most recent first
    },
    
    deleteDocument: async (id) => {
      const database = await getDB();
      await database.delete('documents', id);
    },
    
    // Post entry operations
    createPostEntry: async () => {
      const database = await getDB();
      const now = new Date();
      const id = Date.now().toString();
      const entry = {
        id,
        text: '',
        submissions: [],
        settings: {},
        isGenerating: false,
        createdAt: now,
        updatedAt: now,
      };
      await database.add('postEntries', entry);
      return entry;
    },
    
    savePostEntry: async (entry) => {
      const database = await getDB();
      await database.put('postEntries', entry);
    },
    
    getPostEntry: async (id) => {
      const database = await getDB();
      return await database.get('postEntries', id);
    },
    
    getAllPostEntries: async () => {
      const database = await getDB();
      const tx = database.transaction('postEntries', 'readonly');
      const index = tx.store.index('updatedAt');
      const entries = await index.getAll();
      return entries.reverse(); // Most recent first
    },
    
    deletePostEntry: async (id) => {
      const database = await getDB();
      await database.delete('postEntries', id);
        await database.put('documents', doc);
      }
    },
    
    // ... other methods
  };
};
```

### 4. Editor Integrations

#### Basic Editor

Minimal markdown editor using textarea with toggle between edit and preview modes.

**Components:**
- `BasicEditor` - Main editor component with mode toggle
- `useBasicEditor` - Headless hook for editor logic

**Features:**
- Toggle between Edit and Preview modes (no split view)
- Edit mode: Textarea for writing markdown
- Preview mode: Rendered markdown view using `react-markdown`
- AI rewrite/continue buttons in edit mode
- Keyboard shortcuts (Cmd+K for AI)
- Mobile-friendly single-pane design

**UI Pattern:**
```
┌─────────────────────────────────┐
│  [Edit] [Preview]  ← Toggle     │
├─────────────────────────────────┤
│  Content area (edit or preview) │
└─────────────────────────────────┘
```

#### Lexical Editor

Modern rich text editor integration.

**Components:**
- `LexicalEditor` - Main editor wrapper
- `LexicalAIPlugin` - Plugin for AI integration
- `AIFloatingMenu` - Floating menu on text selection

**Features:**
- Rich text formatting (bold, italic, lists, etc.)
- AI rewrite on selection
- AI continue writing at cursor
- Markdown import/export

#### BlockNote Editor

Full-featured Notion-like editor.

**Components:**
- `BlockNoteEditor` - Main editor wrapper
- `RewriteButton` - Custom toolbar button
- `WriterPrompt` - Slash command for AI
- `StreamingBlockIndicator` - Shows AI generation progress

**Features:**
- All BlockNote features (tables, images, code blocks, etc.)
- AI rewrite per block
- AI continue writing
- PDF export
- Markdown import/export

### 5. Context Menu Integration

**Component:** `useContextMenu`

**Interface:**
```typescript
interface UseContextMenuOptions {
  targetRef: RefObject<HTMLElement>;
  onRewrite?: (text: string, action: AIAction) => Promise<string>;
  actions?: AIAction[];
}

interface AIAction {
  label: string;
  icon?: ReactNode;
  handler: (text: string) => Promise<string>;
}

interface UseContextMenuReturn {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
  actions: AIAction[];
  close: () => void;
}
```

**Usage:**
```jsx
import { useContextMenu } from 'nano-editor-ai/hooks';

function MyEditor() {
  const editorRef = useRef();
  const contextMenu = useContextMenu({
    targetRef: editorRef,
    actions: [
      {
        label: 'Improve writing',
        handler: async (text) => {
          // Use Writer API to improve text
        },
      },
      {
        label: 'Make shorter',
        handler: async (text) => {
          // Use Rewriter API with length: 'shorter'
        },
      },
    ],
  });
  
  return (
    <>
      <textarea ref={editorRef} />
      {contextMenu.isOpen && (
        <ContextMenu
          position={contextMenu.position}
          actions={contextMenu.actions}
          onClose={contextMenu.close}
        />
      )}
    </>
  );
}
```

### 6. Inline Assistant Widget

**Component:** `InlineAssistant`

**Interface:**
```typescript
interface InlineAssistantProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onInsert?: (text: string) => void;
  initialText?: string;
  darkMode?: boolean;
}
```

**Features:**
- Draggable floating button
- Expands to show post creator interface
- Auto-populates with selected text
- Insert at cursor or replace selection
- Minimizes to button when not in use

## Data Models

### Database Structure

**Database Name:** `NanoEditorDB` (default, configurable via storage adapter)

**Tables:**
- **`documents`** - Stores document editor content (Basic, Lexical, BlockNote editors)
- **`postEntries`** - Stores social media post generation history and settings

Both documents and social posts are stored in the **same IndexedDB database** but in **separate tables** to maintain clear separation of concerns.

### PostEntry Schema

```typescript
interface PostEntry {
  id: string; // UUID
  text: string; // Current input text
  submissions: Submission[]; // History of submissions
  settings: PostSettings; // Last used settings
  isGenerating: boolean; // Currently generating
  createdAt: Date;
  updatedAt: Date;
}

interface Submission {
  id: string; // UUID
  text: string; // The prompt text
  settings: PostSettings; // Settings used for this submission
  generations: Generation[]; // Multiple generations for same prompt
  timestamp: Date;
}

interface Generation {
  id: string; // UUID
  suggestions: string[]; // Array of 3 AI-generated posts
  isGenerating: boolean; // Currently streaming
  timestamp: Date;
}

interface PostSettings {
  apiMode: 'writer' | 'rewriter';
  tone: string; // 'casual' | 'neutral' | 'formal' (Writer) or 'more-casual' | 'as-is' | 'more-formal' (Rewriter)
  format: string; // 'plain-text' | 'markdown' (Writer) or 'as-is' | 'markdown' | 'plain-text' (Rewriter)
  length: string; // 'short' | 'medium' | 'long' (Writer) or 'shorter' | 'as-is' | 'longer' (Rewriter)
  style: string; // 'default' | 'professional' | 'casual' | 'custom'
  customStyle: string; // Custom style description
  useEmoticons: boolean;
  stream: boolean;
  temperature?: string;
  topP?: string;
  seed?: string;
  useCurrentSettings: boolean;
}
```

### Document Schema

```typescript
interface Document {
  id: number; // Auto-increment
  title: string;
  content: any; // Format depends on editor:
                // - Basic: string (markdown)
                // - Lexical: EditorState JSON
                // - BlockNote: Block[] JSON
  createdAt: Date;
  updatedAt: Date;
  aiGenerations?: number; // Count of AI operations
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Export Completeness
*For any* public API defined in the package, importing it by name should successfully resolve to a defined value (not undefined).
**Validates: Requirements 1.2**

### Property 2: Tree-Shaking Effectiveness
*For any* subset of package features imported, the final bundle should exclude code from non-imported features.
**Validates: Requirements 1.1.4**

### Property 3: Component Factory Returns Valid Component
*For any* valid UI component set (or empty set), calling createPostCreator should return a React component that can be rendered without errors.
**Validates: Requirements 3.1**

### Property 4: Prop Normalization Consistency
*For any* UI library component provided to the factory, the normalized props should maintain the same semantic behavior (onChange fires with value, onClick fires on click, etc.).
**Validates: Requirements 3.2, 3.4**

### Property 5: Storage Adapter Interface Consistency
*For any* storage operation (create, save, load, delete), the data structure passed to the adapter should conform to the defined schema regardless of which component initiated the operation.
**Validates: Requirements 7.2, 7.5**

### Property 6: Error Propagation
*For any* storage operation that fails, the error should propagate to the calling code without being silently swallowed.
**Validates: Requirements 7.4, 20.3**

### Property 7: Settings Persistence Round-Trip
*For any* valid AI settings configuration, saving the settings and then loading them should return an equivalent configuration.
**Validates: Requirements 8.5, 10.3**

### Property 8: Configuration Application
*For any* AI generation request with specific settings (tone, format, length), the settings should be passed to the underlying AI API calls.
**Validates: Requirements 10.1**

### Property 9: Style Merging Preservation
*For any* custom styles provided, the merged styles should include both custom styles and default styles, with custom styles taking precedence for overlapping properties.
**Validates: Requirements 10.4**

### Property 10: Validation Error Clarity
*For any* invalid configuration provided to the package, the validation error message should include both what was invalid and how to fix it.
**Validates: Requirements 20.2**

### Property 11: AI Adapter Interface Consistency
*For any* AI adapter (Chrome, Gemini, OpenAI, or custom), calling generateText or rewriteText with the same parameters should return responses in the same format (string or AsyncIterable).
**Validates: Requirements 8.3, 8.4**

### Property 12: AI Adapter Swapping Preservation
*For any* AI adapter switch during runtime, the application state (settings, current entry, history) should remain unchanged.
**Validates: Requirements 8.1**

## Error Handling

### Error Categories

**1. AI API Unavailability**
- Detection: Check `window.ai.writer` and `window.ai.rewriter` on initialization
- Response: Set `aiAvailable` to false, show setup modal with instructions
- User Message: "Chrome AI APIs are not available. Please enable them in chrome://flags"

**2. Storage Failures**
- Detection: Try-catch around all storage operations
- Response: Log error, attempt fallback to in-memory storage, notify user
- User Message: "Failed to save data. Changes may not persist."

**3. Network Errors During Generation**
- Detection: Catch errors from AI API streaming
- Response: Stop generation, show error state, allow retry
- User Message: "Generation failed. Please try again."

**4. Invalid Configuration**
- Detection: Validate configuration on initialization and prop changes
- Response: Throw descriptive error with fix suggestions
- Developer Message: "Invalid tone value 'xyz'. Expected one of: 'casual', 'neutral', 'formal'"

**5. Component Integration Errors**
- Detection: Validate provided UI components have required props
- Response: Fall back to default HTML elements, log warning
- Developer Message: "Provided Button component missing 'onClick' prop. Using default button."

### Error Handling Patterns

```typescript
// Storage operations
try {
  await storageAdapter.saveDocument(id, content);
} catch (error) {
  console.error('Storage failed:', error);
  // Attempt in-memory fallback
  inMemoryCache.set(id, content);
  // Notify user
  onError?.({ type: 'storage', message: 'Failed to save', error });
}

// AI generation
try {
  const stream = await writer.write(prompt);
  for await (const chunk of stream) {
    onChunk(chunk);
  }
} catch (error) {
  console.error('Generation failed:', error);
  setIsGenerating(false);
  setError('Generation failed. Please try again.');
}

// Configuration validation
function validateConfig(config) {
  const validTones = ['casual', 'neutral', 'formal'];
  if (config.tone && !validTones.includes(config.tone)) {
    throw new Error(
      `Invalid tone '${config.tone}'. Expected one of: ${validTones.join(', ')}`
    );
  }
}
```

## Testing Strategy

### Unit Testing

**Framework:** Vitest (fast, Vite-native)

**Coverage Areas:**
- Hook return values and state management
- Storage adapter interface compliance
- Prop normalization functions
- Configuration validation
- Error handling paths

**Example Tests:**
```typescript
describe('usePostCreator', () => {
  it('should return all required interface properties', () => {
    const { result } = renderHook(() => usePostCreator());
    expect(result.current).toHaveProperty('inputText');
    expect(result.current).toHaveProperty('handleSubmit');
    expect(result.current).toHaveProperty('settings');
  });
  
  it('should handle storage errors gracefully', async () => {
    const failingAdapter = {
      savePostEntry: () => Promise.reject(new Error('Storage failed'))
    };
    const { result } = renderHook(() => usePostCreator({ storageAdapter: failingAdapter }));
    await expect(result.current.handleSubmit()).resolves.not.toThrow();
  });
});
```

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:** Minimum 100 iterations per property test

**Test Tagging Format:** `// Feature: npm-package, Property {number}: {property_text}`

**Coverage Areas:**
- Export completeness across all entry points
- Tree-shaking with various import combinations
- Component factory with different UI library components
- Storage adapter calls with various data structures
- Settings persistence round-trips
- Style merging with various custom styles

**Example Tests:**
```typescript
import fc from 'fast-check';

// Feature: npm-package, Property 1: Export Completeness
describe('Property 1: Export Completeness', () => {
  it('should export all public APIs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'usePostCreator',
          'useWriter',
          'useRewriter',
          'useAI',
          'createPostCreator'
        ),
        (exportName) => {
          const exported = require('nano-editor-ai')[exportName];
          expect(exported).toBeDefined();
          expect(typeof exported).toBe('function');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: npm-package, Property 7: Settings Persistence Round-Trip
describe('Property 7: Settings Persistence Round-Trip', () => {
  it('should persist and restore settings correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          tone: fc.constantFrom('casual', 'neutral', 'formal'),
          format: fc.constantFrom('plain-text', 'markdown'),
          length: fc.constantFrom('short', 'medium', 'long'),
          useEmoticons: fc.boolean(),
        }),
        (settings) => {
          // Save settings
          localStorage.setItem('ai-settings', JSON.stringify(settings));
          
          // Load settings
          const loaded = JSON.parse(localStorage.getItem('ai-settings'));
          
          // Verify round-trip
          expect(loaded).toEqual(settings);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: npm-package, Property 9: Style Merging Preservation
describe('Property 9: Style Merging Preservation', () => {
  it('should merge custom and default styles correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          color: fc.string(),
          fontSize: fc.string(),
          padding: fc.string(),
        }),
        (customStyles) => {
          const defaultStyles = {
            color: 'black',
            fontSize: '14px',
            margin: '0',
          };
          
          const merged = { ...defaultStyles, ...customStyles };
          
          // Custom styles should override defaults
          Object.keys(customStyles).forEach(key => {
            expect(merged[key]).toBe(customStyles[key]);
          });
          
          // Default styles should be present for non-overridden keys
          Object.keys(defaultStyles).forEach(key => {
            if (!(key in customStyles)) {
              expect(merged[key]).toBe(defaultStyles[key]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Framework:** React Testing Library + Vitest

**Coverage Areas:**
- Component factory with real UI library components (Mantine, MUI)
- Full post creation flow with mocked AI APIs
- Storage adapter integration with IndexedDB
- Dark mode theme switching
- Error recovery flows

### End-to-End Testing

**Framework:** Playwright

**Coverage Areas:**
- Complete user workflows across all editors (Basic, Lexical, BlockNote)
- AI generation flows with real Chrome AI APIs
- Cross-browser testing (Chrome, Firefox, Safari)
- PostCreator integration with different UI libraries
- Context menu and inline assistant interactions
- Storage persistence across page reloads
- Error handling and recovery scenarios

**Test Organization:**
```
e2e/
├── post-creator.spec.ts      # PostCreator workflows
├── basic-editor.spec.ts      # Basic editor with AI
├── lexical-editor.spec.ts    # Lexical editor integration
├── blocknote-editor.spec.ts  # BlockNote editor integration
├── context-menu.spec.ts      # Context menu interactions
├── inline-assistant.spec.ts  # Floating widget tests
└── adapters.spec.ts          # AI and storage adapter tests
```

### Storybook-Based Testing

**Visual Regression:** Chromatic or Percy for visual diffs
**Interaction Testing:** Storybook's play functions for user interactions
**Accessibility Testing:** axe-core integration in Storybook

**Coverage Areas:**
- All component variations across UI libraries
- Dark mode vs light mode
- Loading and error states
- Responsive layouts

## Development Workflow

### Storybook-First Approach

**1. Component Development Cycle:**
```
Story Creation → Component Implementation → Story Refinement → Integration
```

**2. Story Requirements:**
- Every public component must have stories
- Every hook must have usage example stories
- Stories must cover: default state, loading state, error state, edge cases
- Stories must demonstrate integration with at least 3 UI libraries

**3. Story Organization:**
```
stories/
├── hooks/
│   ├── usePostCreator.stories.jsx
│   ├── useWriter.stories.jsx
│   └── useRewriter.stories.jsx
├── components/
│   ├── PostCreator.stories.jsx
│   ├── InlineAssistant.stories.jsx
│   └── ContextMenu.stories.jsx
├── editors/
│   ├── BasicEditor.stories.jsx
│   ├── LexicalEditor.stories.jsx
│   └── BlockNoteEditor.stories.jsx
└── integrations/
    ├── TailwindIntegration.stories.jsx
    ├── MantineIntegration.stories.jsx
    └── MaterialUIIntegration.stories.jsx
```

**4. Story Template:**
```jsx
import { usePostCreator } from '../src/hooks/usePostCreator';

export default {
  title: 'Hooks/usePostCreator',
  parameters: {
    docs: {
      description: {
        component: 'Headless hook for social media post generation with AI',
      },
    },
  },
};

// Default story
export const Default = () => {
  const postCreator = usePostCreator();
  
  return (
    <div>
      <textarea
        value={postCreator.inputText}
        onChange={(e) => postCreator.setInputText(e.target.value)}
      />
      <button onClick={postCreator.handleSubmit}>Generate</button>
      {/* Display state */}
    </div>
  );
};

// With Mantine
export const WithMantine = () => {
  const PostCreator = createPostCreator({
    Input: Textarea,
    Button,
    Card,
  });
  
  return <PostCreator />;
};

// Error state
export const ErrorState = () => {
  // Mock AI unavailable
  // Show error handling
};
```

### Demo Application Purpose

The demo application serves as:
1. **Integration Example** - Shows how to install and configure the package
2. **Real-World Usage** - Demonstrates package in a complete application context
3. **Testing Ground** - Used for manual testing of full integration flows

**Demo Structure:**
```
demo/
├── src/
│   ├── examples/
│   │   ├── TailwindExample.jsx    # PostCreator with Tailwind
│   │   ├── MantineExample.jsx     # PostCreator with Mantine
│   │   ├── MaterialUIExample.jsx  # PostCreator with Material-UI
│   │   └── CustomStorageExample.jsx # Custom storage adapter
│   ├── App.jsx                    # Simple router between examples
│   └── main.jsx
├── package.json                   # Shows peer dependency installation
└── README.md                      # Integration instructions
```

**Demo vs Storybook:**
- **Storybook** = Component documentation, isolated examples, primary reference
- **Demo** = Integration patterns, full application context, secondary reference

## Build Configuration

### Bundler: Vite Library Mode

```javascript
// vite.config.js
export default {
  build: {
    lib: {
      entry: {
        index: 'src/index.js',
        'post-creator': 'src/exports/post-creator.js',
        'editors/basic': 'src/editors/basic/index.js',
        'editors/lexical': 'src/editors/lexical/index.js',
        'editors/blocknote': 'src/editors/blocknote/index.js',
        hooks: 'src/exports/hooks.js',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'lexical',
        '@lexical/react',
        '@blocknote/core',
        '@blocknote/react',
        '@blocknote/mantine',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
};
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "demo", "stories"]
}
```

## Deployment

### Package Publishing
- **Registry:** npm
- **Versioning:** Semantic versioning (semver)
- **CI/CD:** GitHub Actions for automated publishing

### Storybook Deployment
- **Platform:** Vercel or Chromatic
- **URL:** https://storybook.nano-editor-ai.dev
- **Updates:** Automatic on main branch push

### Demo Deployment
- **Platform:** Vercel
- **URL:** https://demo.nano-editor-ai.dev
- **Updates:** Automatic on main branch push

