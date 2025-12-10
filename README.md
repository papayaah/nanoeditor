# @reactkits.dev/react-writer

Headless AI-powered writing assistant for React. Works with Tailwind, Mantine, or any UI library.

## Features

- **Headless Architecture** - Bring your own UI components
- **AI-Powered** - Uses Chrome's built-in AI Writer/Rewriter APIs
- **BYOK Support** - Bring Your Own Key with OpenAI or Gemini adapters
- **UI Presets** - Ready-to-use presets for Tailwind and Mantine
- **Storybook-First** - Comprehensive component documentation
- **TypeScript Ready** - Full type definitions included

## Installation

```bash
npm install @reactkits.dev/react-writer
```

## Quick Start

### Post Creator

```jsx
import { createPostCreator, tailwindPreset } from '@reactkits.dev/react-writer/posts';
import { usePostEntries } from '@reactkits.dev/react-writer/hooks';

// Create PostCreator with Tailwind styling
const PostCreator = createPostCreator(tailwindPreset);

function App() {
  const { currentEntryId, handleNewEntry, loadEntries } = usePostEntries();

  return (
    <div>
      <button onClick={handleNewEntry}>New Post</button>
      <PostCreator
        currentEntryId={currentEntryId}
        onEntrySaved={loadEntries}
      />
    </div>
  );
}
```

### Custom UI Components

```jsx
import { createPostCreator } from '@reactkits.dev/react-writer/posts';
import { TextField, Button, Card, Chip } from '@mui/material';

// Pass your own components
const PostCreator = createPostCreator({
  Input: TextField,
  Button,
  Card,
  Badge: Chip,
});
```

### AI Adapters

```jsx
import { createAdapter, usePostCreator } from '@reactkits.dev/react-writer/hooks';

// Default (Chrome AI - free, on-device)
const chromeAdapter = createAdapter();

// OpenAI
const openaiAdapter = createAdapter({
  type: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-4',
});

// Gemini
const geminiAdapter = createAdapter({
  type: 'gemini',
  apiKey: 'AIza...',
  model: 'gemini-1.5-flash',
});
```

## Subpath Exports

```jsx
// Main entry
import { PostCreator, usePostCreator } from '@reactkits.dev/react-writer';

// Post Creator specific
import { createPostCreator, tailwindPreset } from '@reactkits.dev/react-writer/posts';

// Article Editor specific
import { BlockNoteEditor, useDocuments } from '@reactkits.dev/react-writer/articles';

// Hooks and adapters
import { useWriter, useRewriter, createAdapter } from '@reactkits.dev/react-writer/hooks';
```

## Available Hooks

| Hook | Description |
|------|-------------|
| `usePostCreator` | Complete post creation logic with AI generation |
| `usePostEntries` | CRUD operations for post entries |
| `useDocuments` | Document CRUD operations |
| `useWriter` | Chrome AI Writer API integration |
| `useRewriter` | Chrome AI Rewriter API integration |
| `useAI` | Check Chrome AI availability |
| `useMarkdown` | Markdown preview toggle |
| `useSettings` | UI settings management |

## Development

```bash
# Install dependencies
npm install

# Start Storybook
npm run storybook

# Start demo app
npm run dev:demo

# Build library
npm run build
```

## Requirements

- React 18+ or 19+
- Chrome 131+ for built-in AI features (optional)

## Optional Peer Dependencies

For the article editor with BlockNote:
```bash
npm install @blocknote/core @blocknote/react @blocknote/mantine @mantine/core @mantine/hooks
```

## License

MIT License
