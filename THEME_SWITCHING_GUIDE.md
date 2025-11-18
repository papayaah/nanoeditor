# Theme Switching Guide

## How It Works

The PostCreator component uses an **adapter pattern** to support multiple UI libraries without being tied to any specific one.

### Architecture

```
PostCreator Component
       ↓
   UI Adapter (selects implementation)
       ↓
┌──────┴──────┬──────────┬──────────┐
│   Native    │ Mantine  │   MUI    │ Tailwind
│  HTML/CSS   │    UI    │          │   CSS
└─────────────┴──────────┴──────────┴──────────┘
```

Each implementation provides the same interface:
- `Button`, `IconButton`, `Textarea`, `TextInput`, `Select`, `Switch`, `Menu`, `Modal`

## For End Users (Production)

### Option 1: Build-Time Selection (Recommended)

**Step 1:** Choose your UI library

Edit `src/ui/index.js`:

```javascript
// Option A: Native HTML/CSS (no dependencies)
export * from './implementations/native';

// Option B: Mantine UI (requires @mantine/core)
// export * from './implementations/mantine';

// Option C: Material-UI (requires @mui/material)
// export * from './implementations/mui';

// Option D: Tailwind CSS (requires Tailwind setup)
// export * from './implementations/tailwind';
```

**Step 2:** Install dependencies (if needed)

```bash
# For Mantine UI
npm install @mantine/core @mantine/hooks

# For Material-UI
npm install @mui/material @emotion/react @emotion/styled

# For Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

**Step 3:** Use the component normally

```javascript
import { PostCreator } from './components/posts/PostCreator';

function App() {
  return <PostCreator currentEntryId="123" />;
}
```

The component will automatically use the UI library you selected in `src/ui/index.js`.

### Option 2: Runtime Selection (For Multi-Theme Apps)

If you want to let users switch themes at runtime:

```javascript
import { PostCreator } from './components/posts/PostCreator';
import { useState } from 'react';

function App() {
  const [theme, setTheme] = useState('native');
  
  return (
    <>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="native">Native</option>
        <option value="mantine">Mantine</option>
        <option value="mui">Material-UI</option>
        <option value="tailwind">Tailwind</option>
      </select>
      
      <PostCreator 
        currentEntryId="123"
        uiTheme={theme}
      />
    </>
  );
}
```

**Note:** This bundles ALL UI libraries, increasing bundle size. Only use if you truly need runtime switching.

## For Developers (Storybook)

In Storybook, theme switching is automatic via the toolbar:

1. Run `npm run storybook`
2. Open any PostCreator story
3. Click the **"UI Theme"** dropdown in the toolbar
4. Select: Native, Mantine, Material-UI, or Tailwind
5. Watch the components transform!

## What Changes When You Switch Themes?

### Visual Differences

**Native HTML/CSS:**
- Simple, flat buttons
- Basic borders and shadows
- Minimal styling
- Lightweight (no dependencies)

**Mantine UI:**
- Rounded, modern buttons
- Violet/purple color scheme
- Smooth animations
- Polished look

**Material-UI:**
- Google Material Design
- Elevation/shadow system
- Blue color scheme
- Ripple effects

**Tailwind CSS:**
- Utility-first approach
- Blue color scheme
- Clean, modern look
- Highly customizable

### Code Example

The same component code works with all themes:

```javascript
// This button looks different in each theme
<UI.Button onClick={handleClick} disabled={isLoading}>
  Generate
</UI.Button>
```

**Native:** Plain HTML `<button>` with CSS classes
**Mantine:** `<MantineButton>` component
**MUI:** `<MuiButton>` component  
**Tailwind:** HTML `<button>` with Tailwind classes

## Adding Your Own Theme

Want to add a custom theme or another UI library?

**Step 1:** Create a new implementation folder

```bash
mkdir src/ui/implementations/myui
```

**Step 2:** Implement the required components

Create files matching this interface:
- `Button.jsx`
- `IconButton.jsx`
- `Textarea.jsx`
- `TextInput.jsx`
- `Select.jsx`
- `Switch.jsx`
- `Menu.jsx`
- `Modal.jsx`
- `index.js`

**Step 3:** Export from index.js

```javascript
// src/ui/implementations/myui/index.js
export { Button } from './Button';
export { IconButton } from './IconButton';
// ... etc
```

**Step 4:** Use it

```javascript
// src/ui/index.js
export * from './implementations/myui';
```

## Benefits of This Approach

1. **No Vendor Lock-in** - Switch UI libraries anytime
2. **Gradual Migration** - Migrate components one at a time
3. **Testing** - Test with different UI libraries
4. **Flexibility** - Use different UIs in different parts of your app
5. **Bundle Size** - Only bundle what you use (with build-time selection)

## FAQ

**Q: Which theme should I use?**
A: 
- **Native** - If you want minimal dependencies and full control
- **Mantine** - If you want modern, polished components out of the box
- **MUI** - If you're building a Material Design app
- **Tailwind** - If you prefer utility-first CSS and customization

**Q: Can I mix themes?**
A: Yes! You can use different themes for different components by passing different `uiTheme` props.

**Q: Does this increase bundle size?**
A: Only if you use runtime switching. With build-time selection (recommended), only your chosen UI library is bundled.

**Q: Can I customize the themes?**
A: Yes! Each implementation is just a wrapper. You can modify the files in `src/ui/implementations/[theme]/` to customize styling.

**Q: What if I want to use a different UI library?**
A: Follow the "Adding Your Own Theme" section above. The adapter pattern makes it easy to add any UI library.
