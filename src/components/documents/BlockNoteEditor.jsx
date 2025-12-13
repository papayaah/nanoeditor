import { useEffect, useState } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import {
  useCreateBlockNote,
  FormattingToolbar,
  FormattingToolbarController,
  BlockTypeSelect,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton
} from '@blocknote/react';
// NOTE: CSS import removed - consumers must import '@blocknote/mantine/style.css' themselves
// This prevents bundling 200KB+ of CSS into the library
import { loadDocument } from '../../db';
import { WriterPrompt } from './WriterPrompt';
import { RewriteButton } from './RewriteButton';
import { StreamingBlockIndicator } from './StreamingBlockIndicator';
import { useMarkdownPaste } from '../../hooks/useMarkdownPaste';
import { usePdfExport } from '../../hooks/usePdfExport';

/**
 * BlockNoteEditor - The actual editor component with all BlockNote dependencies
 * This is lazy-loaded to improve initial page performance
 *
 * IMPORTANT: Consumers must import '@blocknote/mantine/style.css' in their app
 * to style the editor properly.
 * 
 * @param {string} docId - Document ID to load
 * @param {Function} onSave - Callback when document is saved
 * @param {Function} [onExportPdf] - Callback for PDF export
 * @param {boolean} [darkMode] - Enable dark mode
 * @param {string} [ariaLabel] - Accessible label for screen readers (default: "Document editor")
 */
export default function BlockNoteEditor({ docId, onSave, onExportPdf, darkMode, ariaLabel = 'Document editor' }) {
  const [initialContent, setInitialContent] = useState(undefined);
  const [isReady, setIsReady] = useState(false);
  const [streamingBlockId, setStreamingBlockId] = useState(null);

  useEffect(() => {
    setIsReady(false);
    setInitialContent(undefined);
    loadDocument(docId).then((content) => {
      // Clean up old textInput inline content from database
      const cleanedContent = (content || []).map(block => {
        if (block.content && Array.isArray(block.content)) {
          return {
            ...block,
            content: block.content.filter(item => item.type === 'text')
          };
        }
        return block;
      });
      setInitialContent(cleanedContent);
      setIsReady(true);
    });
  }, [docId]);

  const editor = useCreateBlockNote({
    initialContent: initialContent,
    uploadFile: async (file) => {
      // Convert file to base64 data URL for local storage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent && isReady) {
      editor.replaceBlocks(editor.document, initialContent);
    }
  }, [editor, initialContent, isReady]);

  // Handle paste events to convert markdown
  useMarkdownPaste(editor, isReady);

  // Expose PDF export function
  usePdfExport(editor, isReady, onExportPdf);

  const handleChange = () => {
    if (!editor || !isReady) return;
    const content = editor.document;
    onSave(content);
  };

  if (!isReady) {
    return <div style={{ padding: '60px', color: '#9b9a97' }}>Loading...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <BlockNoteView 
        editor={editor} 
        onChange={handleChange}
        formattingToolbar={false}
        theme={darkMode ? 'dark' : 'light'}
        ariaLabel={ariaLabel}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key="blockTypeSelect" />
              <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
              <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
              <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
              <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
              <TextAlignButton textAlignment="left" key="textAlignLeftButton" />
              <TextAlignButton textAlignment="center" key="textAlignCenterButton" />
              <TextAlignButton textAlignment="right" key="textAlignRightButton" />
              <ColorStyleButton key="colorStyleButton" />
              <NestBlockButton key="nestBlockButton" />
              <UnnestBlockButton key="unnestBlockButton" />
              <CreateLinkButton key="createLinkButton" />
              <RewriteButton key="rewriteButton" onStreamingBlock={setStreamingBlockId} />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
      
      <StreamingBlockIndicator editor={editor} streamingBlockId={streamingBlockId} />
      
      <WriterPrompt 
        editor={editor} 
        isReady={isReady} 
        onSave={onSave} 
        currentDocId={docId}
        onStreamingBlock={setStreamingBlockId}
      />
    </div>
  );
}
