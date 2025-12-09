# NPM Package Migration Spec - Writer Package

## Overview

This document outlines the migration plan to convert the writer package into a publishable npm package with Storybook documentation and a demo application, following the same structure as the `media-library` package.

The writer package includes **two main features**:
1. **Social Post Creator** - AI-powered social media post generation
2. **Article Editor** - BlockNote-based rich text editor with AI integration

Both features will be included in the npm package with proper exports and documentation.

## Goals

1. **Package Structure**: Organize code into a clean npm package structure
2. **Headless UI First**: Implement headless architecture with preset system (Tailwind, Mantine) - similar to media-library
3. **Storybook Integration**: Document all components and hooks with Storybook (both post creator and article editor)
4. **Demo Application**: Create a standalone demo folder showcasing both features
5. **Build System**: Configure Vite for library mode with proper exports
6. **TypeScript Support**: Add TypeScript definitions for better DX
7. **Bundle Optimization**: Ensure tree-shaking and minimal bundle size
8. **Feature Completeness**: Ensure both post creator and article editor are fully migrated

## Package Structure

```
writer/
├── .storybook/                    # Storybook configuration
│   ├── main.ts
│   └── preview.ts
├── demo/                          # Demo application (moved from root)
│   ├── src/
│   │   ├── App.jsx               # Main demo app
│   │   ├── examples/             # Integration examples
│   │   │   ├── PostCreatorExample.jsx
│   │   │   ├── ArticleEditorExample.jsx
│   │   │   └── WithCustomAdapter.jsx
│   │   └── main.jsx
│   ├── package.json              # Demo dependencies
│   └── vite.config.ts
├── src/                          # Package source code
│   ├── ai/                       # AI adapters
│   │   ├── adapters/
│   │   │   ├── base.js
│   │   │   ├── chrome.js
│   │   │   ├── chrome.stories.jsx
│   │   │   ├── gemini.js
│   │   │   ├── gemini.stories.jsx
│   │   │   ├── openai.js
│   │   │   ├── openai.stories.jsx
│   │   │   └── index.js
│   │   └── README.md
│   ├── components/               # React components
│   │   ├── posts/
│   │   │   ├── createPostCreator.jsx
│   │   │   ├── PostCreator.jsx
│   │   │   ├── PostCreator.stories.jsx
│   │   │   ├── AIAssistantToggle.jsx
│   │   │   ├── AIAssistantToggle.stories.jsx
│   │   │   ├── AIOptionsPanel.jsx
│   │   │   ├── AIOptionsPanel.stories.jsx
│   │   │   └── PostSettings.jsx
│   │   └── articles/
│   │       ├── BlockNoteEditor.jsx
│   │       ├── BlockNoteEditor.stories.jsx
│   │       ├── ArticleInfo.jsx
│   │       ├── ArticleInfo.stories.jsx
│   │       ├── RewriteButton.jsx
│   │       ├── RewriteButton.stories.jsx
│   │       ├── StreamingBlockIndicator.jsx
│   │       └── WriterPrompt.jsx
│   ├── hooks/                    # Headless hooks
│   │   ├── usePostCreator.js
│   │   ├── usePostCreator.stories.jsx
│   │   ├── usePosts.js
│   │   ├── usePosts.stories.jsx
│   │   ├── useAI.js
│   │   ├── useAI.stories.jsx
│   │   ├── useWriter.js
│   │   ├── useWriter.stories.jsx
│   │   ├── useRewriter.js
│   │   ├── useRewriter.stories.jsx
│   │   ├── useArticles.js
│   │   ├── useArticles.stories.jsx
│   │   ├── useMarkdown.js
│   │   ├── useMarkdownPaste.js
│   │   ├── usePdfExport.js
│   │   └── usePdfExport.stories.jsx
│   ├── storage/                  # Storage adapters
│   │   ├── idb.js               # Default IndexedDB adapter
│   │   └── adapter.js           # Storage interface
│   ├── presets/                  # UI library presets
│   │   ├── tailwind.jsx          # Tailwind CSS preset
│   │   ├── mantine.jsx            # Mantine UI preset
│   │   └── index.js               # Preset exports
│   ├── utils/                    # Utilities
│   │   └── ...
│   ├── index.js                  # Main entry point
│   └── exports/                  # Subpath exports
│       ├── posts.js              # Post creator exports
│       ├── articles.js           # Article editor exports
│       └── hooks.js              # All hooks + AI adapters
├── package.json                  # Package configuration
├── vite.config.js                # Vite build config
├── tsconfig.json                 # TypeScript config
└── README.md                      # Package documentation
```

## Headless UI Architecture

### Design Philosophy

The writer package follows a **headless UI-first approach**, similar to the `media-library` package. This means:

1. **No UI Dependencies**: The package doesn't ship with any UI library dependencies
2. **Component Presets**: Users provide their own UI components via presets
3. **Flexibility**: Works with Tailwind, Mantine, Material-UI, or any custom components
4. **Tree-shakeable**: Only include the preset you need

### Preset System

The package uses a preset system where users pass UI components to factory functions:

**Post Creator Example:**
```jsx
import { createPostCreator, tailwindPreset } from '@reactkits.dev/react-writer/posts';

// Using built-in Tailwind preset
const PostCreator = createPostCreator(tailwindPreset);

// Or using Mantine preset
import { mantinePreset } from '@reactkits.dev/react-writer/posts';
const PostCreator = createPostCreator(mantinePreset);

// Or custom components
const PostCreator = createPostCreator({
  Input: MyTextarea,
  Button: MyButton,
  Card: MyCard,
  Badge: MyBadge,
});
```

**Article Editor:**
The article editor uses BlockNote which has its own styling, but can be customized via presets for UI elements like buttons, modals, etc.

### Required Preset Components

For Post Creator, the preset must provide:
- `Input` - Text input/textarea component
- `Button` - Button component
- `Card` - Card/container component
- `Badge` - Badge/tag component

### Built-in Presets

The package will include two built-in presets:

1. **`tailwindPreset`** - Tailwind CSS classes (no dependencies)
2. **`mantinePreset`** - Mantine UI components (requires `@mantine/core` as peer dependency)

### Preset Structure

**`src/presets/tailwind.jsx`:**
```jsx
export const tailwindPreset = {
  Input: ({ value, onChange, multiline, minRows, ...props }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded-md"
      rows={minRows || 4}
      {...props}
    />
  ),
  Button: ({ children, onClick, variant = 'primary', ...props }) => (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md font-medium
        ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
        ${variant === 'secondary' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
      `}
      {...props}
    >
      {children}
    </button>
  ),
  Card: ({ children, ...props }) => (
    <div className="border rounded-lg p-4 shadow-sm" {...props}>
      {children}
    </div>
  ),
  Badge: ({ children, ...props }) => (
    <span className="px-2 py-1 text-xs rounded-full bg-gray-100" {...props}>
      {children}
    </span>
  ),
};
```

**`src/presets/mantine.jsx`:**
```jsx
import { Textarea, Button, Card, Badge } from '@mantine/core';

export const mantinePreset = {
  Input: Textarea,
  Button,
  Card,
  Badge,
};
```

### Preset Exports

Presets will be exported from the main package and subpaths:

```javascript
// From main export
import { tailwindPreset, mantinePreset } from '@reactkits.dev/react-writer';

// From posts subpath
import { tailwindPreset, mantinePreset } from '@reactkits.dev/react-writer/posts';
```

### Migration Notes

- The current `createPostCreator` already accepts components (headless pattern)
- Need to formalize the preset interface and create preset implementations
- Remove hardcoded Mantine dependencies from components
- Ensure all UI is provided via presets, not hardcoded

## Migration Steps

### Phase 1: Restructure Source Code

#### 1.1 Move Current App to Demo Folder

**Current Structure:**
```
writer/
├── src/
│   ├── App.jsx              # Current demo app
│   ├── main.jsx
│   ├── Shell.jsx
│   └── ...
```

**New Structure:**
```
writer/
├── demo/
│   ├── src/
│   │   ├── App.jsx          # Moved from root src/
│   │   ├── main.jsx
│   │   ├── Shell.jsx
│   │   └── ...
│   └── package.json
└── src/                      # Package source (new)
```

**Actions:**
- [ ] Create `demo/` folder
- [ ] Move `src/App.jsx`, `src/main.jsx`, `src/Shell.jsx` to `demo/src/`
- [ ] Move `index.html` to `demo/`
- [ ] Move `public/` to `demo/public/`
- [ ] Create `demo/package.json` with local package dependency
- [ ] Update imports in demo app to use package imports

#### 1.2 Organize Package Source

**Extract Package Code:**
- [ ] Move `src/hooks/` → Keep as is (package hooks - both post and article hooks)
- [ ] Move `src/components/posts/` → Keep as is (post creator components)
- [ ] Move `src/components/articles/` → Keep as is (article editor components)
- [ ] Move `src/ai/` → Keep as is (package AI adapters)
- [ ] Move `src/db.js` → `src/storage/idb.js` (rename and refactor)
- [ ] Create `src/storage/adapter.js` (storage interface)
- [ ] Create `src/presets/` folder for UI presets
- [ ] Create `src/presets/tailwind.jsx` (Tailwind preset)
- [ ] Create `src/presets/mantine.jsx` (Mantine preset)
- [ ] Create `src/presets/index.js` (preset exports)
- [ ] Refactor `createPostCreator` to use preset interface (if needed)
- [ ] Remove hardcoded Mantine dependencies from components
- [ ] Create `src/index.js` (main entry point)
- [ ] Create `src/exports/` folder for subpath exports
- [ ] Ensure article editor components are properly exported

**Clean Up:**
- [ ] Remove demo-specific files from `src/`
- [ ] Remove `src/styles.css` (move to demo if needed)
- [ ] Remove `src/mantine-override.css` (move to demo if needed)

### Phase 2: Storybook Setup

#### 2.1 Install Storybook

```bash
npx storybook@latest init
```

**Configuration:**
- Framework: React + Vite
- Type: Component library
- Addons: Essentials, Interactions, Links

#### 2.2 Storybook Configuration

**`.storybook/main.ts`:**
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Ensure React is properly resolved
    config.resolve = config.resolve || {};
    config.resolve.dedupe = ['react', 'react-dom'];
    return config;
  },
};

export default config;
```

**`.storybook/preview.ts`:**
```typescript
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

#### 2.3 Create Stories

**Hook Stories:**
- `src/hooks/usePostCreator.stories.jsx` - Post creator hook
- `src/hooks/usePosts.stories.jsx` - Posts management
- `src/hooks/useAI.stories.jsx` - AI adapter integration
- `src/hooks/useWriter.stories.jsx` - Writer API hook
- `src/hooks/useRewriter.stories.jsx` - Rewriter API hook
- `src/hooks/useArticles.stories.jsx` - Article management hook
- `src/hooks/usePdfExport.stories.jsx` - PDF export hook

**Component Stories:**
- `src/components/posts/PostCreator.stories.jsx` - PostCreator component
- `src/components/posts/AIAssistantToggle.stories.jsx` - AI toggle component
- `src/components/posts/AIOptionsPanel.stories.jsx` - Options panel
- `src/components/articles/BlockNoteEditor.stories.jsx` - Article editor
- `src/components/articles/ArticleInfo.stories.jsx` - Article info display
- `src/components/articles/RewriteButton.stories.jsx` - AI rewrite button

**Adapter Stories:**
- `src/ai/adapters/chrome.stories.jsx` - Chrome AI adapter
- `src/ai/adapters/openai.stories.jsx` - OpenAI adapter
- `src/ai/adapters/gemini.stories.jsx` - Gemini adapter

**Story Template:**
```jsx
import { usePostCreator } from './usePostCreator';

export default {
  title: 'Hooks/usePostCreator',
  component: usePostCreator,
  parameters: {
    docs: {
      description: {
        component: 'Headless hook for social media post generation with AI',
      },
    },
  },
};

export const Default = () => {
  const postCreator = usePostCreator();
  
  return (
    <div style={{ padding: '20px' }}>
      <textarea
        value={postCreator.inputText}
        onChange={(e) => postCreator.setInputText(e.target.value)}
        style={{ width: '100%', minHeight: '100px' }}
      />
      <button onClick={postCreator.handleSubmit}>
        Generate
      </button>
      <pre>{JSON.stringify(postCreator.currentEntry, null, 2)}</pre>
    </div>
  );
};
```

### Phase 3: Package Configuration

#### 3.1 Update package.json

```json
{
  "name": "@reactkits.dev/react-writer",
  "version": "0.1.0",
  "description": "Headless AI-powered writing assistant for React - works with Tailwind, Mantine, or any UI library",
  "license": "MIT",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./posts": {
      "import": "./dist/exports/posts.mjs",
      "require": "./dist/exports/posts.js",
      "types": "./dist/exports/posts.d.ts"
    },
    "./articles": {
      "import": "./dist/exports/articles.mjs",
      "require": "./dist/exports/articles.js",
      "types": "./dist/exports/articles.d.ts"
    },
    "./hooks": {
      "import": "./dist/exports/hooks.mjs",
      "require": "./dist/exports/hooks.js",
      "types": "./dist/exports/hooks.d.ts"
    }
  },
  "scripts": {
    "dev": "concurrently \"npm run storybook\" \"npm run dev:demo\" --names \"storybook,demo\" --prefix-colors \"blue,green\"",
    "dev:demo": "cd demo && npm run dev",
    "build": "vite build",
    "build:storybook": "storybook build",
    "storybook": "storybook dev -p 6006",
    "preview": "vite preview"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "peerDependenciesMeta": {
    "@mantine/core": {
      "optional": true
    }
  },
  "dependencies": {
    "idb": "^8.0.0",
    "react-markdown": "^10.1.0"
  },
  "devDependencies": {
    "@storybook/addon-essentials": "^8.6.14",
    "@storybook/addon-interactions": "^8.6.14",
    "@storybook/addon-links": "^8.6.14",
    "@storybook/blocks": "^8.6.14",
    "@storybook/react": "^8.6.14",
    "@storybook/react-vite": "^8.6.14",
    "@storybook/test": "^8.6.14",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.1.0",
    "concurrently": "^9.2.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "storybook": "^8.6.14",
    "typescript": "^5.4.5",
    "vite": "^7.2.0",
    "vite-plugin-dts": "^3.9.0"
  }
}
```

#### 3.2 Vite Build Configuration

**`vite.config.js`:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.stories.*', 'src/**/*.test.*'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        'exports/posts': resolve(__dirname, 'src/exports/posts.js'),
        'exports/articles': resolve(__dirname, 'src/exports/articles.js'),
        'exports/hooks': resolve(__dirname, 'src/exports/hooks.js'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'js';
        // Handle nested exports
        if (entryName.includes('/')) {
          const parts = entryName.split('/');
          return `${parts[0]}/${parts[1]}.${ext}`;
        }
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

#### 3.3 Entry Points

**`src/index.js`:**
```javascript
// Main entry point - exports everything
export * from './hooks';
export * from './components';
export * from './ai/adapters';
export * from './storage';
export * from './presets';
```

**`src/exports/posts.js`:**
```javascript
// Post creator specific exports
export { createPostCreator } from '../components/posts/createPostCreator';
export { PostCreator } from '../components/posts/PostCreator';
export { usePostCreator } from '../hooks/usePostCreator';
export { usePosts } from '../hooks/usePosts';
export { AIAssistantToggle } from '../components/posts/AIAssistantToggle';
export { AIOptionsPanel } from '../components/posts/AIOptionsPanel';
export { PostSettings } from '../components/posts/PostSettings';

// Presets
export { tailwindPreset, mantinePreset } from '../presets';
```

**`src/exports/articles.js`:**
```javascript
// Article editor specific exports
export { default as BlockNoteEditor } from '../components/articles/BlockNoteEditor';
export { ArticleInfo } from '../components/articles/ArticleInfo';
export { RewriteButton } from '../components/articles/RewriteButton';
export { StreamingBlockIndicator } from '../components/articles/StreamingBlockIndicator';
export { WriterPrompt } from '../components/articles/WriterPrompt';
export { useArticles } from '../hooks/useArticles';
export { useMarkdown } from '../hooks/useMarkdown';
export { useMarkdownPaste } from '../hooks/useMarkdownPaste';
export { usePdfExport } from '../hooks/usePdfExport';
```

**`src/exports/hooks.js`:**
```javascript
// All hooks - both post creator and article editor
export { usePostCreator } from '../hooks/usePostCreator';
export { usePosts } from '../hooks/usePosts';
export { useAI } from '../hooks/useAI';
export { useWriter } from '../hooks/useWriter';
export { useRewriter } from '../hooks/useRewriter';
export { useArticles } from '../hooks/useArticles';
export { useMarkdown } from '../hooks/useMarkdown';
export { useMarkdownPaste } from '../hooks/useMarkdownPaste';
export { usePdfExport } from '../hooks/usePdfExport';
export { useSettings } from '../hooks/useSettings';
export { useUILibrary } from '../hooks/useUILibrary';

// AI adapters (also available via hooks export for convenience)
export { createChromeAIAdapter } from '../ai/adapters/chrome';
export { createOpenAIAdapter } from '../ai/adapters/openai';
export { createGeminiAdapter } from '../ai/adapters/gemini';
export { createBaseAdapter } from '../ai/adapters/base';
```


### Phase 4: Demo Application

#### 4.1 Demo Structure

**`demo/package.json`:**
```json
{
  "name": "demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@reactkits.dev/react-writer": "file:..",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.0",
    "vite": "^7.2.0"
  }
}
```

**`demo/vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

**`demo/src/App.jsx`:**
```jsx
import { useState } from 'react';
import PostCreatorExample from './examples/PostCreatorExample';
import ArticleEditorExample from './examples/ArticleEditorExample';
import WithCustomAdapter from './examples/WithCustomAdapter';
import FullAppExample from './examples/FullAppExample';

function App() {
  const [view, setView] = useState('full-app');

  return (
    <div>
      <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setView('full-app')}>Full App</button>
        <button onClick={() => setView('post-creator')}>Post Creator Only</button>
        <button onClick={() => setView('article')}>Article Editor Only</button>
        <button onClick={() => setView('custom-adapter')}>Custom Adapter</button>
      </nav>
      
      {view === 'full-app' && <FullAppExample />}
      {view === 'post-creator' && <PostCreatorExample />}
      {view === 'article' && <ArticleEditorExample />}
      {view === 'custom-adapter' && <WithCustomAdapter />}
    </div>
  );
}

export default App;
```

#### 4.2 Demo Examples

**`demo/src/examples/PostCreatorExample.jsx`:**
```jsx
import { createPostCreator, tailwindPreset } from '@reactkits.dev/react-writer/posts';

// Using Tailwind preset
const PostCreator = createPostCreator(tailwindPreset);

export default function PostCreatorExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Post Creator Example</h1>
      <PostCreator />
    </div>
  );
}
```

**`demo/src/examples/ArticleEditorExample.jsx`:**
```jsx
import { useState } from 'react';
import { BlockNoteEditor, useArticles } from '@reactkits.dev/react-writer/articles';

export default function ArticleEditorExample() {
  const {
    currentArticleId,
    articles,
    handleNewArticle,
    handleSelectArticle,
    handleSave,
  } = useArticles();

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
        <button onClick={handleNewArticle}>New Article</button>
        <ul>
          {articles.map(article => (
            <li key={article.id}>
              <button onClick={() => handleSelectArticle(article.id)}>
                {article.title || 'Untitled'}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, padding: '20px' }}>
        {currentArticleId && (
          <BlockNoteEditor
            articleId={currentArticleId}
            onSave={handleSave}
            darkMode={false}
          />
        )}
      </main>
    </div>
  );
}
```

**`demo/src/examples/FullAppExample.jsx`:**
```jsx
// Full app example showing both post creator and article editor
// Similar to current App.jsx but using package imports
import { useState } from 'react';
import { createPostCreator } from '@reactkits.dev/react-writer/posts';
import { BlockNoteEditor, useArticles } from '@reactkits.dev/react-writer/articles';

const PostCreator = createPostCreator();

export default function FullAppExample() {
  const [mode, setMode] = useState('articles'); // 'articles' | 'posts'
  const {
    currentArticleId,
    articles,
    handleNewArticle,
    handleSelectArticle,
    handleSave,
  } = useArticles();

  return (
    <div>
      <nav>
        <button onClick={() => setMode('articles')}>Articles</button>
        <button onClick={() => setMode('posts')}>Posts</button>
      </nav>
      
      {mode === 'articles' && (
        <div style={{ display: 'flex' }}>
          <aside>
            <button onClick={handleNewArticle}>New Article</button>
            {/* Article list */}
          </aside>
          <main>
            {currentArticleId && (
              <BlockNoteEditor
                articleId={currentArticleId}
                onSave={handleSave}
              />
            )}
          </main>
        </div>
      )}
      
      {mode === 'posts' && <PostCreator />}
    </div>
  );
}
```

**`demo/src/examples/WithCustomAdapter.jsx`:**
```jsx
import { createPostCreator, mantinePreset } from '@reactkits.dev/react-writer/posts';
import { createOpenAIAdapter } from '@reactkits.dev/react-writer/hooks';

const openAIAdapter = createOpenAIAdapter({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
});

// Using Mantine preset
const PostCreator = createPostCreator(mantinePreset);

export default function WithCustomAdapter() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Post Creator with OpenAI (Mantine UI)</h1>
      <PostCreator aiAdapter={openAIAdapter} />
    </div>
  );
}
```

### Phase 5: Storage Refactoring

#### 5.1 Move db.js to storage/idb.js

**Current:** `src/db.js`
**New:** `src/storage/idb.js`

**Changes:**
- Rename database from `'NanoEditorDB'` to `'Writer'` (already done)
- Export as `createIDBAdapter()` function
- Implement storage adapter interface

**`src/storage/idb.js`:**
```javascript
import { openDB } from 'idb';

const DB_NAME = 'Writer';
const DB_VERSION = 5;

// ... existing implementation ...

export const createIDBAdapter = () => {
  // Return storage adapter interface
  return {
    createArticle: async () => { /* ... */ },
    saveArticle: async (id, content, title) => { /* ... */ },
    loadArticle: async (id) => { /* ... */ },
    getAllArticles: async () => { /* ... */ },
    deleteArticle: async (id) => { /* ... */ },
    createPost: async () => { /* ... */ },
    savePost: async (post) => { /* ... */ },
    getPost: async (id) => { /* ... */ },
    getAllPosts: async () => { /* ... */ },
    deletePost: async (id) => { /* ... */ },
  };
};
```

#### 5.2 Create Storage Adapter Interface

**`src/storage/adapter.js`:**
```javascript
/**
 * Storage adapter interface
 * Implement this interface to provide custom storage backends
 */
export const StorageAdapter = {
  // Article operations
  createArticle: async () => {},
  saveArticle: async (id, content, title) => {},
  loadArticle: async (id) => {},
  getAllArticles: async () => {},
  deleteArticle: async (id) => {},
  
  // Post operations
  createPost: async () => {},
  savePost: async (post) => {},
  getPost: async (id) => {},
  getAllPosts: async () => {},
  deletePost: async (id) => {},
};
```

### Phase 6: TypeScript Support

#### 6.1 Add TypeScript Definitions

**`tsconfig.json`:**
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
    "strict": false,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "demo", "stories", "**/*.stories.*", "**/*.test.*"]
}
```

**Note:** Since the codebase is currently JavaScript, we'll use JSDoc comments for type hints and generate `.d.ts` files using `vite-plugin-dts`.

### Phase 7: Development Workflow

#### 7.1 Development Scripts

**Package Scripts:**
- `npm run dev` - Run Storybook + Demo concurrently
- `npm run storybook` - Run Storybook only
- `npm run dev:demo` - Run demo app only
- `npm run build` - Build package
- `npm run build:storybook` - Build Storybook for deployment

#### 7.2 Development Workflow

1. **Component Development:**
   - Create/update component in `src/components/`
   - Create/update story colocated with component (e.g., `src/components/posts/PostCreator.stories.jsx`)
   - View in Storybook: `npm run storybook`
   - Test in demo: `npm run dev:demo`

2. **Hook Development:**
   - Create/update hook in `src/hooks/`
   - Create/update story colocated with hook (e.g., `src/hooks/usePostCreator.stories.jsx`)
   - Document usage in Storybook

3. **Integration Testing:**
   - Add example to `demo/src/examples/`
   - Test full integration flow
   - Update demo navigation if needed

## File Migration Checklist

### Source Code Organization
- [ ] Create `src/index.js` (main entry point)
- [ ] Create `src/presets/` folder
- [ ] Create `src/presets/tailwind.jsx` (Tailwind preset)
- [ ] Create `src/presets/mantine.jsx` (Mantine preset)
- [ ] Create `src/presets/index.js` (preset exports)
- [ ] Refactor components to use preset system (remove hardcoded UI)
- [ ] Create `src/exports/` folder
- [ ] Create `src/exports/posts.js` (post creator exports + presets)
- [ ] Create `src/exports/articles.js` (article editor exports)
- [ ] Create `src/exports/hooks.js` (all hooks + AI adapters)
- [ ] Move `src/db.js` → `src/storage/idb.js`
- [ ] Create `src/storage/adapter.js` (interface)
- [ ] Update all imports to use new paths
- [ ] Ensure article editor components are exported
- [ ] Ensure article hooks are exported

### Demo Application
- [ ] Create `demo/` folder
- [ ] Move `src/App.jsx` → `demo/src/App.jsx`
- [ ] Move `src/main.jsx` → `demo/src/main.jsx`
- [ ] Move `src/Shell.jsx` → `demo/src/Shell.jsx`
- [ ] Move `index.html` → `demo/index.html`
- [ ] Move `public/` → `demo/public/`
- [ ] Create `demo/package.json`
- [ ] Create `demo/vite.config.ts`
- [ ] Update demo imports to use package

### Storybook
- [ ] Install Storybook
- [ ] Create `.storybook/main.ts` (configured for colocated stories)
- [ ] Create `.storybook/preview.ts`
- [ ] Create stories colocated with components/hooks:
  - [ ] `src/hooks/*.stories.jsx` for all hooks
  - [ ] `src/components/posts/*.stories.jsx` for post components
  - [ ] `src/components/articles/*.stories.jsx` for article components
  - [ ] `src/ai/adapters/*.stories.jsx` for AI adapters
- [ ] Move existing stories from `src/stories/` to colocated locations

### Configuration
- [ ] Update `package.json` with new structure
- [ ] Update `vite.config.js` for library mode
- [ ] Create `tsconfig.json` for type generation
- [ ] Update `.gitignore` for new structure

### Documentation
- [ ] Update `README.md` with package usage
- [ ] Add Storybook deployment instructions
- [ ] Add demo deployment instructions
- [ ] Document all exports and subpaths

## Testing Strategy

### Storybook Testing
- Visual regression testing with Chromatic
- Interaction testing with Storybook play functions
- Accessibility testing with axe-core

### Demo Testing
- Manual testing of integration examples
- Cross-browser testing
- Performance testing

### Package Testing
- Build verification
- Type checking
- Export verification
- Tree-shaking verification

## Deployment

### Storybook
- Deploy to Chromatic or Vercel
- URL: `https://storybook.react-writer.dev`
- Auto-deploy on main branch push

### Demo
- Deploy to Vercel
- URL: `https://demo.react-writer.dev`
- Auto-deploy on main branch push

### Package
- Publish to npm
- Package name: `@reactkits.dev/react-writer`
- Version: Semantic versioning

## Timeline

1. **Week 1**: Restructure source code and create demo folder
2. **Week 2**: Set up Storybook and create stories
3. **Week 3**: Configure build system and package.json
4. **Week 4**: Testing, documentation, and deployment

## Feature Coverage

### Post Creator Features (Included)
- ✅ `usePostCreator` hook - Post generation logic
- ✅ `usePosts` hook - Posts management
- ✅ `PostCreator` component - Main post creator UI
- ✅ `AIAssistantToggle` component - AI toggle button
- ✅ `AIOptionsPanel` component - AI options panel
- ✅ `PostSettings` component - Settings management
- ✅ `createPostCreator` factory - Component factory pattern
- ✅ Post storage operations (via storage adapter)
- ✅ AI adapter integration (Chrome, OpenAI, Gemini)

### Article Editor Features (Included)
- ✅ `BlockNoteEditor` component - Full BlockNote editor
- ✅ `ArticleInfo` component - Article metadata display
- ✅ `RewriteButton` component - AI rewrite for blocks
- ✅ `StreamingBlockIndicator` component - AI generation indicator
- ✅ `WriterPrompt` component - AI writing prompts
- ✅ `useArticles` hook - Article CRUD operations
- ✅ `useMarkdown` hook - Markdown handling
- ✅ `useMarkdownPaste` hook - Markdown paste support
- ✅ `usePdfExport` hook - PDF export functionality
- ✅ Article storage operations (via storage adapter)
- ✅ AI integration for article editing

### Shared Features
- ✅ AI adapters (Chrome, OpenAI, Gemini)
- ✅ Storage adapter interface (idb default implementation)
- ✅ Database: 'Writer' (IndexedDB)
- ✅ Both features use same storage adapter
- ✅ Both features use same AI adapters
- ✅ **Headless UI architecture** - No hardcoded UI dependencies
- ✅ **Preset system** - Tailwind and Mantine presets included
- ✅ **Custom presets** - Users can provide their own UI components

## Success Criteria

- [ ] Package builds successfully with `npm run build`
- [ ] All exports work correctly via subpath imports
- [ ] Storybook runs and documents all components/hooks (both features)
- [ ] Demo application works with local package (both features)
- [ ] TypeScript definitions are generated
- [ ] Bundle size is optimized (< 50KB gzipped for each feature)
- [ ] Tree-shaking works correctly
- [ ] All existing functionality preserved (post creator + article editor)
- [ ] Article editor components are properly exported
- [ ] Article editor hooks are properly exported
- [ ] Both features can be used independently or together
- [ ] **Headless UI implemented** - No hardcoded UI library dependencies
- [ ] **Tailwind preset works** - Can use package with Tailwind CSS only
- [ ] **Mantine preset works** - Can use package with Mantine (optional peer dependency)
- [ ] **Custom presets work** - Users can provide their own UI components
- [ ] Presets are properly exported and documented
