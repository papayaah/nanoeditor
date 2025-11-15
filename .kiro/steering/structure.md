# Project Structure

## Directory Organization

```
src/
├── components/          # React components
│   ├── posts/          # Social post creator feature components
│   ├── BlockNoteEditor.jsx  # Document editor (lazy loaded)
│   ├── Sidebar.jsx     # Navigation for documents and posts
│   ├── SettingsMenu.jsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useDocuments.js # Document CRUD operations
│   ├── usePostEntries.js # Post entries management
│   ├── useAI.js        # Chrome AI integration
│   ├── useWriter.js    # AI writing assistance
│   └── ...
├── db.js               # Dexie database schema and operations
├── App.jsx             # Main app component with routing
├── main.jsx            # React entry point
└── styles.css          # Global styles
```

## Architecture Patterns

### State Management
- Custom hooks for feature-specific state (documents, posts, settings)
- Local state with useState/useEffect
- No external state management library

### Data Layer
- Dexie for IndexedDB operations
- Database schema versioning in `db.js`
- Two main tables: `documents` and `postEntries`

### Component Patterns
- Lazy loading for heavy components (BlockNoteEditor)
- Suspense boundaries with Shell fallback
- Custom hooks extract business logic from components
- Props drilling for shared state (no context)

### Routing
- Simple client-side routing with history API
- Two routes: `/` (document editor) and `/posts` (social post creator)
- No router library

## Key Conventions

- Use `.jsx` extension for React components
- Custom hooks prefixed with `use`
- Database operations in `db.js`
- CSS modules for component-specific styles
- Lazy load CSS with dynamic imports
