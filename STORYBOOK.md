# Storybook Documentation

This project uses Storybook to showcase and document the Nano Editor components for NPM package distribution.

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Start Storybook development server
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

Storybook will run at `http://localhost:6006`

## Available Stories

### DocumentEditor Component

Located in `src/components/documents/DocumentEditor.stories.jsx`

**Stories:**
- **Light Mode** - Default editor appearance
- **Dark Mode** - Editor with dark theme
- **With Initial Content** - Pre-populated editor demonstrating formatting

**Features Demonstrated:**
- Rich text formatting toolbar
- AI-powered rewriting (requires Chrome AI)
- AI-powered content continuation
- Image upload support
- Markdown paste support
- PDF export capability

### PostCreator Component

Located in `src/components/posts/PostCreator.stories.jsx`

**Stories:**
- **Light Mode** - Default post creator appearance
- **Dark Mode** - Post creator with dark theme
- **With Instructions** - Includes usage guide
- **Interactive Demo** - Shows settings panel and state management

**Features Demonstrated:**
- AI-powered post generation (3 variations)
- Customizable tone, format, and length
- Style presets (humorous, professional, etc.)
- Submission history tracking
- Regeneration with different settings
- Copy to clipboard functionality

## Component Props

### DocumentEditor

```jsx
<DocumentEditor
  docId={string}           // Required: Unique document identifier
  onSave={function}        // Required: Callback when content changes
  onExportPdf={ref}        // Optional: Ref for PDF export function
  darkMode={boolean}       // Optional: Enable dark mode
/>
```

### PostCreator

```jsx
<PostCreator
  currentEntryId={string}      // Required: Current entry identifier
  onEntrySaved={function}      // Optional: Callback when entry is saved
  onNewEntry={function}        // Optional: Callback to create new entry
  onSettingsExport={function}  // Optional: Callback to export settings
  darkMode={boolean}           // Optional: Enable dark mode
/>
```

## Browser Requirements

Both components require Chrome browser with built-in AI APIs:

1. **Chrome Canary** or **Chrome Dev** (version 127+)
2. Enable AI features in `chrome://flags`:
   - `#prompt-api-for-gemini-nano`
   - `#optimization-guide-on-device-model`
3. Download AI model when prompted

## Customization

### Adding New Stories

Create a new `.stories.jsx` file in the component directory:

```jsx
import YourComponent from './YourComponent';

export default {
  title: 'Components/YourComponent',
  component: YourComponent,
};

export const Default = {
  args: {
    // your props
  },
};
```

### Styling

Storybook automatically imports:
- `@mantine/core/styles.css` - Mantine UI styles
- `src/styles.css` - Global styles
- `src/mantine-override.css` - Mantine customizations

Component-specific CSS is imported in the stories.

## Deployment

### Build Static Storybook

```bash
npm run build-storybook
```

This creates a `storybook-static` directory that can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Example: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel storybook-static
```

## NPM Package Preparation

When preparing for NPM package distribution:

1. **Update package.json** with proper exports:
```json
{
  "exports": {
    "./DocumentEditor": "./src/components/documents/DocumentEditor.jsx",
    "./PostCreator": "./src/components/posts/PostCreator.jsx"
  }
}
```

2. **Document peer dependencies** (React, Mantine, BlockNote, etc.)

3. **Include Storybook URL** in package README

4. **Add usage examples** from stories to documentation

## Troubleshooting

### Storybook won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Components not rendering

- Check that all peer dependencies are installed
- Verify Chrome AI APIs are available
- Check browser console for errors

### Styles not loading

- Ensure CSS imports are in `.storybook/preview.js`
- Check that component CSS files exist
- Verify Mantine provider is wrapping components

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [BlockNote Documentation](https://www.blocknotejs.org/)
- [Mantine Documentation](https://mantine.dev/)
- [Chrome AI APIs](https://developer.chrome.com/docs/ai)
