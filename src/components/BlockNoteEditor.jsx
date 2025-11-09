import { useEffect, useState } from 'react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
} from '@blocknote/react';
import { loadDocument } from '../db';
import { WriterPrompt } from './WriterPrompt';
import { StreamingBlockIndicator } from './StreamingBlockIndicator';
import { RewriteButton } from './RewriteButton';

export function BlockNoteEditor({ docId, onSave, darkMode, editorRef }) {
  const [initialContent, setInitialContent] = useState(undefined);
  const [isReady, setIsReady] = useState(false);
  const [streamingBlockId, setStreamingBlockId] = useState(null);

  useEffect(() => {
    setIsReady(false);
    setInitialContent(undefined);
    loadDocument(docId).then((content) => {
      setInitialContent(content || []);
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

  // Expose editor instance to parent
  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  useEffect(() => {
    if (editor && initialContent && isReady) {
      editor.replaceBlocks(editor.document, initialContent);
    }
  }, [editor, initialContent, isReady]);

  const handleChange = () => {
    if (!editor || !isReady) return;
    onSave(editor.document);
  };

  if (!isReady) {
    return <div style={{ padding: '60px', color: '#9b9a97' }}>Loading...</div>;
  }

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'visible' }}>
      <BlockNoteView 
        editor={editor} 
        onChange={handleChange}
        formattingToolbar={false}
        theme={darkMode ? 'dark' : 'light'}
        className="blocknote-no-scroll"
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
      <StreamingBlockIndicator 
        editor={editor} 
        streamingBlockId={streamingBlockId} 
      />
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
