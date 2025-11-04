import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { textblockTypeInputRule, wrappingInputRule, InputRule } from '@tiptap/core'
import { useEffect, useState, useRef } from 'preact/hooks'
import { AIBubbleMenu } from './AIBubbleMenu'
import { AIFloatingMenu } from './AIFloatingMenu'
import { Toolbar } from './Toolbar'
import { getAIStatus, AIStatus } from '../utils/chromeAI'
import { SpaceAIExtension } from './SpaceAIExtension'

// Custom extension for markdown shortcuts
const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',
  
  addInputRules() {
    return [
      // Heading shortcuts
      textblockTypeInputRule({
        find: /^# $/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 1 }),
      }),
      textblockTypeInputRule({
        find: /^## $/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 2 }),
      }),
      textblockTypeInputRule({
        find: /^### $/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 3 }),
      }),
      textblockTypeInputRule({
        find: /^#### $/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 4 }),
      }),
      textblockTypeInputRule({
        find: /^##### $/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 5 }),
      }),
      textblockTypeInputRule({
        find: /^###### $/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 6 }),
      }),
      
      // Blockquote
      wrappingInputRule({
        find: /^> $/,
        type: this.editor.schema.nodes.blockquote,
      }),
      
      // Code block
      textblockTypeInputRule({
        find: /^``` $/,
        type: this.editor.schema.nodes.codeBlock,
      }),
      
      // Bullet list
      wrappingInputRule({
        find: /^[-*+] $/,
        type: this.editor.schema.nodes.bulletList,
      }),
      
      // Ordered list
      wrappingInputRule({
        find: /^(\d+)\. $/,
        type: this.editor.schema.nodes.orderedList,
      }),
      
      // Task list
      wrappingInputRule({
        find: /^\[\s?\] $/,
        type: this.editor.schema.nodes.taskList,
      }),
      
      // Horizontal rule
      new InputRule({
        find: /^---$/,
        handler: ({ range, commands }) => {
          commands.deleteRange(range)
          commands.insertContent({ type: 'horizontalRule' })
        },
      }),
      new InputRule({
        find: /^\*\*\*$/,
        handler: ({ range, commands }) => {
          commands.deleteRange(range)
          commands.insertContent({ type: 'horizontalRule' })
        },
      }),
    ]
  },
})

interface EditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  editable?: boolean
}

export function Editor({ 
  content = '', 
  onChange, 
  placeholder = "Start writing... Type '/' for commands or select text for AI features",
  editable = true 
}: EditorProps) {
  const [aiStatus, setAIStatus] = useState<AIStatus>({
    writerAvailable: false,
    rewriterAvailable: false,
    writerCapabilities: null,
    rewriterCapabilities: null
  })
  const [showSpaceAIPrompt, setShowSpaceAIPrompt] = useState(false)
  const [spaceAIPosition, setSpaceAIPosition] = useState({ top: 0, left: 0 })
  const [spaceAIInsertAt, setSpaceAIInsertAt] = useState(0)
  const aiFloatingMenuRef = useRef<any>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      MarkdownShortcuts,
      SpaceAIExtension.configure({
        onSpacePressed: (position, insertAt) => {
          const newPosition = {
            top: position.top,
            left: position.left
          }
          setSpaceAIPosition(newPosition)
          setSpaceAIInsertAt(insertAt)
          setShowSpaceAIPrompt(true)
        }
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: false,
      }),
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
      
      // Hide space AI prompt when there's a text selection (bubble menu should show instead)
      if (!editor.state.selection.empty && showSpaceAIPrompt) {
        setShowSpaceAIPrompt(false)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none',
      },
    },
  })

  useEffect(() => {
    // Check AI capabilities on mount
    const checkAI = async () => {
      try {
        const status = await getAIStatus()
        setAIStatus(status)
      } catch (error) {
        console.warn('AI not available:', error)
      }
    }
    
    checkAI()
  }, [])

  if (!editor) {
    return (
      <div class="flex items-center justify-center h-64">
        <div class="spinner"></div>
        <span class="ml-2 text-gray-600">Loading editor...</span>
      </div>
    )
  }



  return (
    <div class="relative">
      <Toolbar editor={editor} aiStatus={aiStatus} />
      
      <div class="relative min-h-screen bg-white">
        {/* Floating Menu for empty lines */}
        <AIFloatingMenu 
          ref={aiFloatingMenuRef}
          editor={editor} 
          aiStatus={aiStatus}
          showSpacePrompt={showSpaceAIPrompt}
          spacePromptPosition={spaceAIPosition}
          spaceInsertAt={spaceAIInsertAt}
          onCloseSpacePrompt={() => setShowSpaceAIPrompt(false)}
        />
        
        {/* Bubble Menu for text selection - hide when space prompt is showing */}
        {!showSpaceAIPrompt && (
          <AIBubbleMenu editor={editor} aiStatus={aiStatus} />
        )}
        
        {/* Main Editor */}
        <div class="max-w-4xl mx-auto px-6 py-8">
          <EditorContent 
            editor={editor} 
            class="focus-within:outline-none min-h-screen"
          />
        </div>
      </div>
      
      {/* AI Status Indicator */}
      {(aiStatus.writerAvailable || aiStatus.rewriterAvailable) && (
        <div class="fixed bottom-4 right-4 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm shadow-lg">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>AI Ready</span>
          </div>
        </div>
      )}
    </div>
  )
}