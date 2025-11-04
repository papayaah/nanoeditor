# Testing Space-Triggered AI Prompt

## How to Test the Space-Triggered AI Feature

The space-triggered AI prompt works exactly like Notion - when you press space after typing text, an AI prompt appears to help you continue writing.

### Prerequisites

1. **Chrome Canary** with AI flags enabled:
   - `chrome://flags/#writer-api-for-gemini-nano` → Enabled
   - `chrome://flags/#rewriter-api-for-gemini-nano` → Enabled
   - Restart Chrome after enabling

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Verify AI is available**:
   - Click "Debug AI" button in the top toolbar
   - Check browser console for AI availability status
   - Or visit `http://localhost:5173/ai-test.html` to test APIs directly

### Testing Steps

#### 1. Basic Space Trigger
1. Open the editor
2. Type some text (e.g., "Hello world")
3. **Press SPACE** after the word "world"
4. ✅ **Expected**: Purple AI prompt appears below your cursor with "Ask AI anything..."

#### 2. Custom AI Prompts
1. Trigger the space prompt (step 1-3 above)
2. Type a custom prompt (e.g., "continue this story about adventure")
3. **Press ENTER**
4. ✅ **Expected**: AI generates content and inserts it at cursor position

#### 3. Quick Continue Writing
1. Type some text
2. Press SPACE to trigger prompt
3. **Press ENTER without typing anything**
4. ✅ **Expected**: AI continues your text with "Continue writing" prompt

#### 4. Multiple Triggers
1. Type text → Space → AI generates
2. Position cursor after generated text
3. Press SPACE again
4. ✅ **Expected**: New AI prompt appears, can generate more content

### What Should Happen

**When Space is Pressed:**
- 🟢 Purple AI prompt box appears below cursor
- 🟢 Input field is auto-focused
- 🟢 Placeholder text shows "Ask AI anything..."
- 🟢 Sparkles icon indicates AI feature

**When Prompt is Submitted:**
- 🟢 Loading indicator appears
- 🟢 AI generates relevant content
- 🟢 Text is inserted at exact cursor position
- 🟢 Prompt disappears after generation

**Keyboard Controls:**
- **ENTER**: Generate AI content
- **ESCAPE**: Close the prompt
- **Type normally**: Custom instruction for AI

### Troubleshooting

#### Space Prompt Not Appearing
1. **Check AI Status**: Use "Debug AI" button
2. **Verify Chrome Version**: Must be Canary 127+
3. **Check Flags**: Both writer flags must be enabled
4. **Console Errors**: Check browser dev tools for errors

#### AI Generation Fails
1. **Model Download**: First use requires model download (wait ~5-10 mins)
2. **Network**: Ensure stable internet connection
3. **Error Messages**: Check console for specific error details

#### Position Issues
1. **Cursor Position**: Make sure cursor is after text, not at beginning of line
2. **Text Selection**: Don't have text selected when pressing space
3. **Scroll Position**: Prompt should follow scroll position

### Example Workflow

```
1. Type: "The weather today is beautiful"
2. Press: SPACE
3. See: [AI Prompt appears]
4. Type: "write about going for a walk"
5. Press: ENTER
6. Result: AI continues with walking-related content
```

### Integration with Other Features

**Works with:**
- ✅ Slash commands (`/` menu)
- ✅ Text selection AI (bubble menu)
- ✅ Markdown shortcuts
- ✅ All text formatting

**Doesn't interfere with:**
- ✅ Normal typing and editing
- ✅ Copy/paste operations
- ✅ Undo/redo functionality

### Performance Notes

- **First Use**: Model download may take several minutes
- **Subsequent Uses**: Should be fast (<2 seconds)
- **Reusable Writer**: Same AI instance used for efficiency
- **Memory Management**: AI instances properly cleaned up

---

**Need Help?**
- Check `ai-test.html` for direct API testing
- Use browser dev tools to inspect errors
- Verify Chrome Canary version and flags
- Test with simple prompts first