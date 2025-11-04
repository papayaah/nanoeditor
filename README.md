# AI Editor - Notion-like Editor with Chrome AI

A powerful, Notion-inspired editor built with Preact and TipTap that integrates Chrome's built-in AI APIs for intelligent writing assistance.

## Features

### ✨ AI-Powered Writing
- **AI Writer**: Generate content using Chrome's built-in AI
- **AI Rewriter**: Improve, formalize, shorten, or extend existing text
- **Smart Suggestions**: Context-aware writing assistance
- **Multiple Tones**: Professional, casual, or neutral writing styles

### 📝 Rich Text Editing
- **Markdown Shortcuts**: Type `#` for headings, `-` for lists, etc.
- **Live Formatting**: Automatic conversion as you type
- **Rich Formatting**: Bold, italic, strikethrough, highlighting, colors
- **Smart Lists**: Bullet lists, numbered lists, and task lists
- **Tables**: Full table support with resizing
- **Code Blocks**: Syntax highlighting for code
- **Images & Links**: Easy media insertion
- **Blockquotes**: Beautiful quote formatting

### 🎯 Notion-like Experience
- **Slash Commands**: Type `/` to access all blocks and AI features
- **Hover Menus**: Format text with floating toolbars
- **Block-based**: Clean, structured document editing
- **Auto-save**: Content automatically saved to localStorage

## Setup Instructions

### Prerequisites

You need Chrome Canary with AI features enabled:

1. **Install Chrome Canary** (version 127 or later)
2. **Enable AI Features** in `chrome://flags/`:
   - `#writer-api-for-gemini-nano` → Enabled  
   - `#rewriter-api-for-gemini-nano` → Enabled
3. **Restart Chrome Canary**
4. **Wait for Model Download** (this happens automatically in the background)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd aieditor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing AI Availability

Open `ai-test.html` in Chrome Canary to verify AI APIs are working:

```bash
# Serve the test file
open ai-test.html
```

## Usage

### Basic Editing

1. **Start Writing**: Click in the editor and start typing
2. **Use Markdown**: Type shortcuts like `#` for headings, `*` for bold
3. **Format Text**: Select text to see formatting options

### Slash Commands

Type `/` anywhere to access:

- **Basic Blocks**: Headings, lists, quotes, dividers
- **Media**: Images, tables, code blocks  
- **AI Features**: Write with AI, continue writing, summarize, explain

### AI Features

#### Text Generation
1. Type `/` and select "Write with AI"
2. Or type your prompt after `/` (e.g., `/write a paragraph about space exploration`)
3. AI will generate relevant content

#### Text Rewriting  
1. Select any text in the document
2. Click the AI button (✨) in the bubble menu
3. Choose rewrite option:
   - **Professional**: Make more formal
   - **Casual**: Make more friendly
   - **Shorter**: Make more concise
   - **Longer**: Add more detail
   - **Improve**: Enhance clarity
   - **Fix Grammar**: Correct errors

### Keyboard Shortcuts

- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic  
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Y` - Redo
- `/` - Open command menu
- `Enter` - Create new paragraph
- `Shift + Enter` - Line break

## Architecture

### Tech Stack
- **Frontend**: Preact + TypeScript
- **Editor**: TipTap (ProseMirror-based)
- **Styling**: Tailwind CSS
- **AI**: Chrome's Built-in AI APIs
- **Build Tool**: Vite

### Key Components

- `Editor.tsx` - Main editor component with TipTap integration
- `AIFloatingMenu.tsx` - Slash command interface
- `AIBubbleMenu.tsx` - Text selection toolbar with AI features
- `Toolbar.tsx` - Main formatting toolbar
- `chromeAI.ts` - Chrome AI API integration utilities

### AI Integration

The app uses Chrome's experimental AI APIs:
- **Writer API**: For content generation
- **Rewriter API**: For text improvement and style changes

## Development

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Browser Compatibility

- **Supported**: Chrome Canary 127+ with AI flags enabled
- **Limited**: Other Chrome versions (no AI features)
- **Not Supported**: Other browsers

## Troubleshooting

### AI Features Not Working

1. **Check Browser**: Ensure you're using Chrome Canary 127+
2. **Verify Flags**: Both AI flags must be enabled in `chrome://flags/`
3. **Restart Browser**: Required after enabling flags
4. **Model Download**: Wait for Gemini Nano model to download (may take time)
5. **Test Manually**: Use `ai-test.html` to verify API availability
6. **Check Console**: Use "Debug AI" button for detailed logs

### Common Issues

- **"AI not available" message**: AI flags not enabled or model not downloaded
- **Slow AI responses**: Model still downloading or processing
- **Empty AI responses**: Try different prompts or check network connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- [TipTap](https://tiptap.dev/) - Excellent rich text editor framework
- [Preact](https://preactjs.com/) - Fast React alternative  
- [Chrome AI](https://developer.chrome.com/docs/ai/) - Built-in AI capabilities
- [Notion](https://notion.so/) - Inspiration for the user experience

---

**Note**: This project uses experimental Chrome AI APIs that may change. Always test with the latest Chrome Canary version.