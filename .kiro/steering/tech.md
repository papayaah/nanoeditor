# Tech Stack

## Core Technologies

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **BlockNote** - Rich text editor framework
- **Dexie** - IndexedDB wrapper for local storage
- **Mantine** - UI component library (used by BlockNote)
- **Lucide React** - Icon library

## Key Libraries

- `@blocknote/react` - React bindings for BlockNote editor
- `@blocknote/mantine` - Mantine theme for BlockNote
- `@blocknote/xl-pdf-exporter` - PDF export functionality
- `@react-pdf/renderer` - PDF generation
- `dexie` - IndexedDB database

## Build System

Vite configuration includes:
- React plugin with Fast Refresh
- CSS code splitting
- Bundle visualization
- Console/debugger removal in production
- esbuild minification

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Browser APIs

- Chrome Built-in AI APIs (`window.ai`)
- IndexedDB for local storage
- File API for image uploads
