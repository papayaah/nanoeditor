# Quick Start: Choosing Your UI Theme

## TL;DR

**For most users:** Edit one line in `src/ui/index.js` and you're done!

```javascript
// src/ui/index.js - Change this ONE line:
export * from './implementations/native';      // ← Change 'native' to your choice
```

Options: `native`, `mantine`, `mui`, or `tailwind`

---

## Step-by-Step

### 1. Choose Your Theme

| Theme | Look | Dependencies | Best For |
|-------|------|--------------|----------|
| **native** | Simple, clean | None ✅ | Minimal apps, full control |
| **mantine** | Modern, polished | @mantine/core | Quick, beautiful UIs |
| **mui** | Material Design | @mui/material | Google-style apps |
| **tailwind** | Utility-first | tailwindcss | Custom designs |

### 2. Install Dependencies (if needed)

```bash
# Native - No installation needed! ✅

# Mantine
npm install @mantine/core @mantine/hooks

# Material-UI  
npm install @mui/material @emotion/react @emotion/styled

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

### 3. Update src/ui/index.js

```javascript
// Pick ONE of these:

export * from './implementations/native';      // No dependencies
export * from './implementations/mantine';     // Modern & polished
export * from './implementations/mui';         // Material Design
export * from './implementations/tailwind';    // Utility-first
```

### 4. Done! 🎉

Your app now uses the selected UI theme. No other code changes needed.

---

## Visual Comparison

### Native HTML/CSS
```
┌─────────────┐
│  Generate   │  ← Simple, flat button
└─────────────┘
```
- Pros: No dependencies, lightweight, full control
- Cons: Basic styling, more work to customize

### Mantine UI
```
╭─────────────╮
│  Generate   │  ← Rounded, violet, modern
╰─────────────╯
```
- Pros: Beautiful out-of-box, smooth animations
- Cons: Adds ~200KB to bundle

### Material-UI
```
┌─────────────┐
│  GENERATE   │  ← Material Design, blue, elevated
└─────────────┘
```
- Pros: Google Material Design, comprehensive
- Cons: Larger bundle size

### Tailwind CSS
```
┌─────────────┐
│  Generate   │  ← Clean, blue, utility-based
└─────────────┘
```
- Pros: Highly customizable, utility-first
- Cons: Requires Tailwind setup

---

## Testing Themes in Storybook

Want to see all themes before choosing?

```bash
npm run storybook
```

1. Open any PostCreator story
2. Click **"UI Theme"** dropdown in toolbar
3. Switch between themes to compare
4. Choose your favorite!

---

## Advanced: Runtime Theme Switching

Want users to switch themes on the fly?

```javascript
import { PostCreator } from './components/posts/PostCreator';

function App() {
  const [theme, setTheme] = useState('native');
  
  return (
    <PostCreator 
      currentEntryId="123"
      uiTheme={theme}  // ← Pass theme as prop
    />
  );
}
```

**Warning:** This bundles ALL themes. Only use if you need runtime switching.

---

## Need Help?

- See `THEME_SWITCHING_GUIDE.md` for detailed documentation
- See `UI_THEME_IMPLEMENTATION.md` for technical details
- Check Storybook for live examples
