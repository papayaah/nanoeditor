import { Editor } from '@tiptap/core'
import { 
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  LinkIcon,
  CodeIcon,
  ListIcon,
  ListOrderedIcon,
  CheckSquareIcon,
  QuoteIcon,
  ImageIcon,
  TableIcon,
  UndoIcon,
  RedoIcon,
  SparklesIcon,
  PaletteIcon,
  TypeIcon
} from 'lucide-preact'
import { useState } from 'preact/hooks'
import { AIStatus } from '../utils/chromeAI'

interface ToolbarProps {
  editor: Editor
  aiStatus: AIStatus
}

interface ColorOption {
  name: string
  value: string
  class: string
}

export function Toolbar({ editor, aiStatus }: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHeadingMenu, setShowHeadingMenu] = useState(false)

  const colors: ColorOption[] = [
    { name: 'Default', value: '#37352f', class: 'bg-gray-800' },
    { name: 'Gray', value: '#9b9a97', class: 'bg-gray-400' },
    { name: 'Brown', value: '#64473a', class: 'bg-amber-700' },
    { name: 'Orange', value: '#d9730d', class: 'bg-orange-500' },
    { name: 'Yellow', value: '#dfab01', class: 'bg-yellow-500' },
    { name: 'Green', value: '#0f7b6c', class: 'bg-green-600' },
    { name: 'Blue', value: '#0b6e99', class: 'bg-blue-600' },
    { name: 'Purple', value: '#6940a5', class: 'bg-purple-600' },
    { name: 'Pink', value: '#ad1a72', class: 'bg-pink-600' },
    { name: 'Red', value: '#e03e3e', class: 'bg-red-600' },
  ]

  const highlightColors: ColorOption[] = [
    { name: 'Default', value: '#fff2cc', class: 'bg-yellow-100' },
    { name: 'Gray', value: '#f1f1ef', class: 'bg-gray-100' },
    { name: 'Brown', value: '#f4eeee', class: 'bg-amber-100' },
    { name: 'Orange', value: '#faebdd', class: 'bg-orange-100' },
    { name: 'Yellow', value: '#fbf3db', class: 'bg-yellow-100' },
    { name: 'Green', value: '#ddedea', class: 'bg-green-100' },
    { name: 'Blue', value: '#ddebf1', class: 'bg-blue-100' },
    { name: 'Purple', value: '#eae4f2', class: 'bg-purple-100' },
    { name: 'Pink', value: '#f4dfeb', class: 'bg-pink-100' },
    { name: 'Red', value: '#fbe4e4', class: 'bg-red-100' },
  ]

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setShowColorPicker(false)
  }

  const setHighlightColor = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run()
    setShowColorPicker(false)
  }

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run()
    setShowHeadingMenu(false)
  }

  return (
    <div class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-4xl mx-auto px-6 py-3">
        <div class="flex items-center space-x-1 flex-wrap gap-2">
          {/* Undo/Redo */}
          <div class="flex items-center border-r border-gray-200 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              class="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <UndoIcon size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              class="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <RedoIcon size={16} />
            </button>
          </div>

          {/* Headings */}
          <div class="relative">
            <button
              onClick={() => setShowHeadingMenu(!showHeadingMenu)}
              class={`btn-ghost flex items-center space-x-1 ${
                editor.isActive('heading') ? 'bg-blue-50 text-blue-600' : ''
              }`}
              title="Headings"
            >
              <TypeIcon size={16} />
              <span class="text-xs">▼</span>
            </button>
            
            {showHeadingMenu && (
              <div class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-40">
                <button
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  class={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                    editor.isActive('paragraph') ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  Normal text
                </button>
                {([1, 2, 3, 4, 5, 6] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setHeading(level)}
                    class={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      editor.isActive('heading', { level }) ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    style={{ fontSize: `${1.5 - (level - 1) * 0.1}em` }}
                  >
                    Heading {level}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            class={`btn-ghost ${editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : ''}`}
            title="Bold (⌘B)"
          >
            <BoldIcon size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            class={`btn-ghost ${editor.isActive('italic') ? 'bg-blue-50 text-blue-600' : ''}`}
            title="Italic (⌘I)"
          >
            <ItalicIcon size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            class={`btn-ghost ${editor.isActive('strike') ? 'bg-blue-50 text-blue-600' : ''}`}
            title="Strikethrough"
          >
            <StrikethroughIcon size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            class={`btn-ghost ${editor.isActive('code') ? 'bg-blue-50 text-blue-600' : ''}`}
            title="Inline code"
          >
            <CodeIcon size={16} />
          </button>

          {/* Color Picker */}
          <div class="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              class="btn-ghost"
              title="Text color"
            >
              <PaletteIcon size={16} />
            </button>

            {showColorPicker && (
              <div class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                <div class="mb-3">
                  <div class="text-xs font-medium text-gray-700 mb-2">Text Color</div>
                  <div class="grid grid-cols-5 gap-1">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setTextColor(color.value)}
                        class={`w-6 h-6 rounded border border-gray-200 ${color.class}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div class="text-xs font-medium text-gray-700 mb-2">Background</div>
                  <div class="grid grid-cols-5 gap-1">
                    {highlightColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setHighlightColor(color.value)}
                        class={`w-6 h-6 rounded border border-gray-200 ${color.class}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lists */}
          <div class="border-l border-gray-200 pl-2 ml-2 flex items-center space-x-1">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              class={`btn-ghost ${editor.isActive('bulletList') ? 'bg-blue-50 text-blue-600' : ''}`}
              title="Bullet list"
            >
              <ListIcon size={16} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              class={`btn-ghost ${editor.isActive('orderedList') ? 'bg-blue-50 text-blue-600' : ''}`}
              title="Numbered list"
            >
              <ListOrderedIcon size={16} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              class={`btn-ghost ${editor.isActive('taskList') ? 'bg-blue-50 text-blue-600' : ''}`}
              title="Task list"
            >
              <CheckSquareIcon size={16} />
            </button>
          </div>

          {/* Block Elements */}
          <div class="border-l border-gray-200 pl-2 ml-2 flex items-center space-x-1">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              class={`btn-ghost ${editor.isActive('blockquote') ? 'bg-blue-50 text-blue-600' : ''}`}
              title="Quote"
            >
              <QuoteIcon size={16} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              class={`btn-ghost ${editor.isActive('codeBlock') ? 'bg-blue-50 text-blue-600' : ''}`}
              title="Code block"
            >
              <CodeIcon size={16} />
            </button>
          </div>

          {/* Media & Links */}
          <div class="border-l border-gray-200 pl-2 ml-2 flex items-center space-x-1">
            <button
              onClick={insertLink}
              class={`btn-ghost ${editor.isActive('link') ? 'bg-blue-50 text-blue-600' : ''}`}
              title="Add link"
            >
              <LinkIcon size={16} />
            </button>

            <button
              onClick={insertImage}
              class="btn-ghost"
              title="Add image"
            >
              <ImageIcon size={16} />
            </button>

            <button
              onClick={insertTable}
              class="btn-ghost"
              title="Add table"
            >
              <TableIcon size={16} />
            </button>
          </div>

          {/* AI Features */}
          {(aiStatus.writerAvailable || aiStatus.rewriterAvailable) && (
            <div class="border-l border-gray-200 pl-2 ml-2">
              <button
                class="btn-ghost text-purple-600 hover:bg-purple-50"
                title="AI Features - Select text or use '/' commands"
              >
                <div class="flex items-center space-x-1">
                  <SparklesIcon size={16} />
                  <span class="text-xs font-medium">AI</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {(showColorPicker || showHeadingMenu) && (
        <div 
          class="fixed inset-0 z-30" 
          onClick={() => {
            setShowColorPicker(false)
            setShowHeadingMenu(false)
          }}
        />
      )}
    </div>
  )
}