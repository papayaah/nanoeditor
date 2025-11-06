# Building a Custom Notion-Style Editor: A Development Journey

## Project Overview

We set out to build a Notion-style document editor using BlockNote, React, and IndexedDB. What seemed like a straightforward task turned into a deep dive into editor internals, event handling, and the challenges of working with complex third-party libraries.

## The Vision

- A clean, minimal Notion-inspired editor
- Custom spacebar-triggered input field for quick text entry
- Custom "Rewrite" button in the formatting toolbar
- Image drag-and-drop support
- Local-first storage with IndexedDB

## Major Challenges & Solutions

### 1. The Spacebar Input Field Saga

**Goal**: Press spacebar on an empty line to show an input field, type text, press Enter to insert it.

**Attempt 1: Using BlockNote's Inline Content**
- Created a custom inline content type using `createReactInlineContentSpec`
- Problem: The inline content stayed in the document even after converting to text
- Issue: `updateBlock` wasn't properly removing the custom inline content
- Result: Multiple input boxes accumulated in the document

**Attempt 2: Detecting Space in onChange**
- Monitored `editor.document` for blocks containing only a space
- Problem: `onChange` fired after the space was already added
- Issue: Required pressing spacebar twice to trigger
- Result: Poor user experience, not responsive enough

**Attempt 3: Intercepting Keydown Events**
- Added event listener to `editor.domElement`
- Problem: `editor.domElement` wasn't available immediately on mount
- Error: "The editor view is not available. Cannot access view['dom']"
- Solution: Added timeout and try-catch to wait for editor to mount

**Attempt 4: Getting Cursor Position**
- Used `window.getSelection().getRangeAt(0).getBoundingClientRect()`
- Problem: After `preventDefault()`, the rect returned all zeros
- Issue: DOM hadn't updated yet, cursor position was invalid
- Solution: Get position BEFORE calling `preventDefault()`

**Attempt 5: Fallback Position Detection**
- When selection rect was invalid, tried `document.activeElement.getBoundingClientRect()`
- Problem: Got the entire editor container (700px+ height)
- Issue: Input appeared at wrong position
- Solution: Insert temporary span at cursor, get its position, remove it

**Final Solution**:
```javascript
// Intercept spacebar before BlockNote processes it
const handleKeyDown = (event) => {
  if (event.key === ' ') {
    const currentBlock = editor.getTextCursorPosition().block;
    const isEmpty = !currentBlock.content || currentBlock.content.length === 0;
    
    if (isEmpty) {
      event.preventDefault(); // Stop space from being added
      
      // Insert temporary span to get exact cursor position
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.textContent = '\u200B'; // Zero-width space
      range.insertNode(span);
      const rect = span.getBoundingClientRect();
      span.remove();
      
      // Show input at cursor position
      setInputPosition({ top: rect.bottom + 5, left: rect.left });
      setShowInput(true);
    }
  }
};
```

### 2. Custom Formatting Toolbar Button

**Goal**: Add a "Rewrite" button with dropdown to the text selection toolbar.

**Attempt 1: Wrong Import Source**
- Imported `FormattingToolbar` from `@blocknote/mantine`
- Error: "does not provide an export named 'FormattingToolbar'"
- Solution: Import from `@blocknote/react` instead

**Attempt 2: Replacing All Buttons**
- Used `FormattingToolbar` as wrapper, only included custom button
- Problem: All default buttons (Bold, Italic, etc.) disappeared
- Issue: We replaced the entire toolbar instead of extending it
- Result: Only "Rewrite" button visible

**Attempt 3: Wrong Context**
- Placed `FormattingToolbarController` outside `BlockNoteView`
- Error: "useBlockNoteEditor was called outside of a BlockNoteContext"
- Solution: Must be child of `BlockNoteView` to access editor context

**Attempt 4: Hover Dropdown Issues**
- Used `onMouseEnter`/`onMouseLeave` for dropdown
- Problem: Moving mouse to dropdown closed it (left the button)
- Solution: Changed to click-based dropdown with click-outside handler

**Final Solution**:
```javascript
<BlockNoteView editor={editor} formattingToolbar={false}>
  <FormattingToolbarController
    formattingToolbar={() => (
      <FormattingToolbar>
        <div style={{ borderLeft: '1px solid #e0e0e0' }} />
        <RewriteButton />
      </FormattingToolbar>
    )}
  />
</BlockNoteView>
```

### 3. Package Version Hell

**Initial State**: Using outdated packages
- Vite 5.4.5 (latest: 7.2.0)
- React 18.3.1 (latest: 19.2.0)
- Various other outdated dependencies

**Challenge**: Updating to React 19 and Vite 7
- React 19 has breaking changes
- Had to update all @types packages
- Vite 7 required plugin updates

**Solution**: Systematic update of all packages
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "vite": "^7.2.0",
  "@vitejs/plugin-react": "^5.1.0"
}
```

### 4. Image Upload Configuration

**Problem**: Dragging images opened them in new tab instead of embedding
- BlockNote requires explicit `uploadFile` handler
- Without it, browser's default drag behavior takes over

**Solution**: Convert images to base64 and store in IndexedDB
```javascript
const editor = useCreateBlockNote({
  uploadFile: async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },
});
```

### 5. Database Schema Evolution

**Challenge**: Old data with deprecated inline content types
- Initially used `textInput` inline content
- Later removed it for simpler approach
- Old documents had `textInput` nodes that caused errors

**Error**: "node type textInput not found in schema"

**Solution**: Filter out unknown content types on load
```javascript
const cleanedContent = (content || []).map(block => {
  if (block.content && Array.isArray(block.content)) {
    return {
      ...block,
      content: block.content.filter(item => item.type === 'text')
    };
  }
  return block;
});
```

## Key Learnings

### 1. Third-Party Library Integration
- Always check which package exports what (React vs Mantine vs Core)
- Read the actual source code when docs are unclear
- Version compatibility matters - keep dependencies updated

### 2. Event Handling in Rich Text Editors
- Rich text editors have complex event handling
- Use capture phase (`addEventListener(..., true)`) to intercept before editor
- `preventDefault()` timing is critical for cursor position
- DOM updates aren't synchronous - use `requestAnimationFrame` or timeouts

### 3. Position Calculation
- `getBoundingClientRect()` on selections can be unreliable
- Temporary DOM elements are a reliable way to get exact positions
- Always account for scroll position and viewport boundaries
- Smart positioning (above/below based on available space) improves UX

### 4. React State Management
- Event listeners need access to latest state
- Use refs for values that shouldn't trigger re-renders
- Click-outside handlers need proper cleanup
- State updates in event handlers can be tricky with closures

### 5. BlockNote Specifics
- BlockNote uses TipTap under the hood (ProseMirror-based)
- Custom inline content is powerful but complex
- Formatting toolbar must be inside BlockNoteView
- Schema changes require data migration strategy

## What Worked Well

1. **Minimal Code Philosophy**: Leveraging BlockNote's built-in features kept code simple
2. **IndexedDB with Dexie**: Fast, reliable local storage
3. **Auto-save on Change**: No debouncing needed, IndexedDB is fast enough
4. **Base64 Image Storage**: Simple solution for local-first approach

## What We'd Do Differently

1. **Start with BlockNote Examples**: Would have saved time on toolbar customization
2. **Version Lock Earlier**: Updating mid-project caused unnecessary issues
3. **Test Event Handling First**: Should have prototyped spacebar trigger before building UI
4. **Schema Versioning**: Should have planned for data migration from the start

## Technical Debt & Future Improvements

1. **Remove Debug Logs**: Console.logs throughout the code for debugging
2. **Error Boundaries**: Add proper error handling for editor crashes
3. **Migration System**: Proper versioning for database schema changes
4. **TypeScript**: Would catch many of the import/export issues earlier
5. **Testing**: E2E tests for complex interactions like spacebar trigger
6. **Performance**: Monitor IndexedDB size with base64 images

## Conclusion

Building a custom editor on top of BlockNote was more challenging than expected. The main difficulties came from:
- Working around BlockNote's event handling
- Getting precise cursor positions
- Understanding the component hierarchy requirements
- Managing state across complex interactions

However, the end result is a clean, functional editor that feels responsive and intuitive. The key was persistence, debugging systematically, and not being afraid to try multiple approaches until finding what works.

The journey taught us that modern rich text editors are incredibly complex, and libraries like BlockNote do an amazing job of abstracting that complexity. When you need to go beyond the provided APIs, you're entering territory where you need to understand the underlying architecture deeply.

## Stats

- **Development Time**: Multiple sessions over several days
- **Major Refactors**: 5+ complete rewrites of spacebar trigger
- **Lines of Code**: ~500 lines for core editor functionality
- **Dependencies**: 6 main packages (BlockNote, React, Dexie, Mantine)
- **Bugs Fixed**: 20+ significant issues
- **Approaches Tried**: 10+ different implementation strategies

---

*This document serves as both a technical reference and a reminder that building great software often requires trying many approaches before finding the right one.*
