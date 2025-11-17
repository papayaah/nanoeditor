# NPM Package Preparation Guide

This guide walks you through preparing Nano Editor components for NPM package distribution.

## Current Status

✅ Storybook configured and ready
✅ Component stories created
✅ Documentation written
⏳ Package configuration needed
⏳ Build setup needed

## Steps to Prepare for NPM

### 1. Update package.json

Add the following fields to `package.json`:

```json
{
  "name": "@yourusername/nano-editor",
  "version": "1.0.0",
  "description": "AI-powered document editor and social post creator components",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./DocumentEditor": {
      "import": "./dist/DocumentEditor.mjs",
      "require": "./dist/DocumentEditor.js"
    },
    "./PostCreator": {
      "import": "./dist/PostCreator.mjs",
      "require": "./dist/PostCreator.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "react",
    "editor",
    "blocknote",
    "ai",
    "chrome-ai",
    "social-media",
    "post-creator",
    "rich-text-editor"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/nano-editor"
  },
  "bugs": {
    "url": "https://github.com/yourusername/nano-editor/issues"
  },
  "homepage": "https://github.com/yourusername/nano-editor#readme",
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@mantine/core": "^8.0.0",
    "@mantine/hooks": "^8.0.0",
    "@blocknote/core": "^0.41.0",
    "@blocknote/react": "^0.41.0",
    "@blocknote/mantine": "^0.41.0"
  },
  "peerDependenciesMeta": {
    "@blocknote/xl-pdf-exporter": {
      "optional": true
    }
  }
}
```

### 2. Create Build Configuration

You'll need to set up a build process to bundle the components. Options:

#### Option A: Using Vite Library Mode

Create `vite.config.lib.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        DocumentEditor: resolve(__dirname, 'src/components/documents/DocumentEditor.jsx'),
        PostCreator: resolve(__dirname, 'src/components/posts/PostCreator.jsx'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@mantine/core',
        '@mantine/hooks',
        '@blocknote/core',
        '@blocknote/react',
        '@blocknote/mantine',
        'dexie',
        'lucide-react',
        'react-markdown',
      ],
    },
  },
});
```

Add build script to package.json:
```json
{
  "scripts": {
    "build:lib": "vite build --config vite.config.lib.js"
  }
}
```

#### Option B: Using tsup

```bash
npm install -D tsup
```

Create `tsup.config.js`:

```js
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.js',
    DocumentEditor: 'src/components/documents/DocumentEditor.jsx',
    PostCreator: 'src/components/posts/PostCreator.jsx',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@mantine/core',
    '@mantine/hooks',
    '@blocknote/core',
    '@blocknote/react',
    '@blocknote/mantine',
  ],
});
```

### 3. Create Entry Point

Create `src/index.js`:

```js
export { default as DocumentEditor } from './components/documents/DocumentEditor';
export { PostCreator } from './components/posts/PostCreator';

// Export hooks if needed
export { useDocuments } from './hooks/useDocuments';
export { usePostEntries } from './hooks/usePostEntries';
export { useAI } from './hooks/useAI';
export { useWriter } from './hooks/useWriter';
export { useRewriter } from './hooks/useRewriter';
```

### 4. Update README for NPM

Create a comprehensive README with:

- Installation instructions
- Peer dependencies
- Basic usage examples
- Link to Storybook documentation
- Browser requirements (Chrome AI)
- API documentation

Example:

```markdown
# Nano Editor Components

AI-powered React components for document editing and social post creation.

## Installation

\`\`\`bash
npm install @yourusername/nano-editor
\`\`\`

## Peer Dependencies

\`\`\`bash
npm install react react-dom @mantine/core @mantine/hooks
npm install @blocknote/core @blocknote/react @blocknote/mantine
npm install dexie lucide-react react-markdown
\`\`\`

## Usage

See [Storybook Documentation](https://your-storybook-url.com) for interactive examples.

### DocumentEditor

\`\`\`jsx
import { DocumentEditor } from '@yourusername/nano-editor';
import '@yourusername/nano-editor/styles.css';

function App() {
  return (
    <DocumentEditor
      docId="doc-1"
      onSave={(content) => console.log(content)}
      darkMode={false}
    />
  );
}
\`\`\`

### PostCreator

\`\`\`jsx
import { PostCreator } from '@yourusername/nano-editor';

function App() {
  return (
    <PostCreator
      currentEntryId="entry-1"
      onEntrySaved={() => console.log('Saved')}
      darkMode={false}
    />
  );
}
\`\`\`

## Browser Requirements

Requires Chrome with built-in AI APIs enabled.

## Documentation

- [Storybook](https://your-storybook-url.com)
- [GitHub](https://github.com/yourusername/nano-editor)
```

### 5. Deploy Storybook

Deploy your Storybook to showcase the components:

```bash
# Build Storybook
npm run build-storybook

# Deploy to Vercel
npx vercel storybook-static

# Or deploy to Netlify
npx netlify deploy --dir=storybook-static --prod
```

Update package.json with Storybook URL:
```json
{
  "homepage": "https://your-storybook.vercel.app"
}
```

### 6. Test the Package Locally

Before publishing, test locally:

```bash
# Build the package
npm run build:lib

# Create a tarball
npm pack

# In another project, install the tarball
npm install /path/to/nano-editor-1.0.0.tgz
```

### 7. Publish to NPM

```bash
# Login to NPM
npm login

# Publish (first time)
npm publish --access public

# Publish updates
npm version patch  # or minor, or major
npm publish
```

### 8. Post-Publication

- Add NPM badge to README
- Update documentation with NPM install command
- Share on social media
- Submit to component libraries (e.g., React Component Libraries)

## Checklist

Before publishing:

- [ ] All peer dependencies documented
- [ ] Build process configured
- [ ] Entry point created
- [ ] README updated with installation and usage
- [ ] Storybook deployed and linked
- [ ] Package tested locally
- [ ] Version number set correctly
- [ ] License file included
- [ ] .npmignore or files field configured
- [ ] Repository URL added
- [ ] Keywords added for discoverability

## Maintenance

After publishing:

- Monitor GitHub issues
- Keep dependencies updated
- Add new stories for new features
- Version according to semver
- Maintain changelog

## Resources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Storybook Deployment](https://storybook.js.org/docs/react/sharing/publish-storybook)
