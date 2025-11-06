# Agent Development Rules

Notion-style document editor built with React, BlockNote, and Dexie. Keep it minimal by using BlockNote's built-in features.

## Core Rules

### Use BlockNote's Built-in Features
- DO NOT implement custom markdown parsing - use `blocksToMarkdownLossy()` and `markdownToBlocks()`
- DO NOT implement custom block manipulation - BlockNote handles drag/drop, selection menus
- DO NOT implement custom formatting menus - BlockNote provides hover menus and slash commands
- DO NOT implement custom inline markdown - BlockNote supports `##`, `*`, `-` natively

### What We Actually Implement
- Document management (create, save, load, delete, switch)
- IndexedDB persistence via Dexie
- UI for document switching (sidebar)
- Toolbar for app-level actions (markdown view, copy)

## Technical Stack

### Key APIs
- `useCreateBlockNote()` - Initialize editor
- `editor.document` - Get current content
- `editor.blocksToMarkdownLossy()` - Convert to markdown
- `BlockNoteView` - Render the editor

### Database Schema
```javascript
documents: {
  id: number (auto-increment),
  title: string,
  content: string (JSON),
  updatedAt: Date
}
```

## Design
- Clean, minimal Notion-inspired design
- Colors: `#37352f` (text), `#f7f7f5` (backgrounds), `#e5e5e5` (borders)
- Max width: 900px, padding: 60px vertical, 96px horizontal
- Sidebar: 260px, collapsible
- System fonts: -apple-system, BlinkMacSystemFont

## Behavior
- Auto-save on every editor change (no debouncing needed)
- Documents sorted by `updatedAt` (most recent first)
- Document titles from first block content, fallback to "Untitled"
- Cannot delete the last document, confirmation before deletion

## Development Rules
1. Check BlockNote documentation first
2. Use BlockNote's API if available
3. Only add custom code if absolutely necessary
4. Keep components under 200 lines
5. Remove code, don't add it
