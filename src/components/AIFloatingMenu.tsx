import { useRef, useState, useEffect } from 'preact/hooks'
import { forwardRef } from 'preact/compat'
import { Editor } from '@tiptap/core'

import { 
  TypeIcon, 
  Heading1Icon, 
  Heading2Icon, 
  Heading3Icon,
  ListIcon,
  CheckSquareIcon,
  ImageIcon,
  TableIcon,
  CodeIcon,
  QuoteIcon,
  MinusIcon,
  SparklesIcon
} from 'lucide-preact'
import { AIStatus, getOrCreateWriter } from '../utils/chromeAI'
import { marked } from 'marked'

interface AIFloatingMenuProps {
  editor: Editor
  aiStatus: AIStatus
  showSpacePrompt?: boolean
  spacePromptPosition?: { top: number; left: number }
  spaceInsertAt?: number
  onCloseSpacePrompt?: () => void
}

interface MenuItem {
  title: string
  description: string
  icon: any
  command: () => void
  keywords: string[]
  category: 'basic' | 'ai' | 'media' | 'advanced'
}

export const AIFloatingMenu = forwardRef<any, AIFloatingMenuProps>(({ 
  editor, 
  aiStatus, 
  showSpacePrompt = false,
  spacePromptPosition = { top: 0, left: 0 },
  spaceInsertAt = 0,
  onCloseSpacePrompt
}: AIFloatingMenuProps, _ref: any) => {
  const [isVisible, setIsVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [spacePromptText, setSpacePromptText] = useState('')
  const [generationPosition, setGenerationPosition] = useState({ top: 0, left: 0 })
  const menuContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const spacePromptRef = useRef<HTMLInputElement>(null)

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0

  const clamp = (value: number, min: number, max: number) => {
    if (max <= min) return min
    return Math.min(Math.max(value, min), max)
  }


  const menuItems: MenuItem[] = [
    // Basic blocks
    {
      title: 'Text',
      description: 'Start writing with plain text',
      icon: TypeIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().insertContent('<p></p>').run()
        })
      },
      keywords: ['text', 'paragraph', 'p'],
      category: 'basic'
    },
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: Heading1Icon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        })
      },
      keywords: ['h1', 'heading', 'title'],
      category: 'basic'
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: Heading2Icon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        })
      },
      keywords: ['h2', 'heading', 'subtitle'],
      category: 'basic'
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: Heading3Icon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        })
      },
      keywords: ['h3', 'heading'],
      category: 'basic'
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: ListIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleBulletList().run()
        })
      },
      keywords: ['list', 'bullet', 'ul'],
      category: 'basic'
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: ListIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleOrderedList().run()
        })
      },
      keywords: ['list', 'numbered', 'ordered', 'ol'],
      category: 'basic'
    },
    {
      title: 'To-do List',
      description: 'Track tasks with a to-do list',
      icon: CheckSquareIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleTaskList().run()
        })
      },
      keywords: ['todo', 'task', 'check', 'checkbox'],
      category: 'basic'
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: QuoteIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleBlockquote().run()
        })
      },
      keywords: ['quote', 'blockquote'],
      category: 'basic'
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks',
      icon: MinusIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().setHorizontalRule().run()
        })
      },
      keywords: ['divider', 'hr', 'line'],
      category: 'basic'
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet',
      icon: CodeIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().toggleCodeBlock().run()
        })
      },
      keywords: ['code', 'codeblock'],
      category: 'advanced'
    },
    {
      title: 'Table',
      description: 'Create a table',
      icon: TableIcon,
      command: () => {
        removeSlashAndExecute(() => {
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        })
      },
      keywords: ['table'],
      category: 'advanced'
    },
    {
      title: 'Image',
      description: 'Upload an image',
      icon: ImageIcon,
      command: () => {
        removeSlashAndExecute(() => {
          const url = prompt('Enter image URL:')
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        })
      },
      keywords: ['image', 'picture', 'photo'],
      category: 'media'
    },
    // AI-powered items
    ...(aiStatus.writerAvailable ? [
      {
        title: 'Write with AI',
        description: 'Generate content using AI',
        icon: SparklesIcon,
        command: () => {
          const prompt = search.replace('/', '').trim() || 'Write a paragraph about'
          removeSlashAndExecute(async () => {
            await handleAIGeneration(prompt)
          })
        },
        keywords: ['ai', 'write', 'generate', 'create'],
        category: 'ai' as const
      },
      {
        title: 'Continue writing',
        description: 'Continue the current text with AI',
        icon: SparklesIcon,
        command: () => {
          const currentText = editor.getText()
          const lastParagraph = currentText.split('\n').pop() || ''
          removeSlashAndExecute(async () => {
            await handleAIGeneration(`Continue this text: "${lastParagraph}"`)
          })
        },
        keywords: ['continue', 'ai', 'extend'],
        category: 'ai' as const
      },
      {
        title: 'Summarize',
        description: 'Create a summary with AI',
        icon: SparklesIcon,
        command: () => {
          const prompt = `Create a summary about: ${search.replace('/', '').trim()}`
          removeSlashAndExecute(async () => {
            await handleAIGeneration(prompt)
          })
        },
        keywords: ['summary', 'summarize', 'ai'],
        category: 'ai' as const
      },
      {
        title: 'Explain',
        description: 'Explain a topic with AI',
        icon: SparklesIcon,
        command: () => {
          const topic = search.replace('/', '').trim() || 'a topic'
          const prompt = `Explain ${topic} in simple terms`
          removeSlashAndExecute(async () => {
            await handleAIGeneration(prompt)
          })
        },
        keywords: ['explain', 'definition', 'ai'],
        category: 'ai' as const
      }
    ] : [])
  ]

  const filteredItems = menuItems.filter(item => {
    const searchTerm = search.toLowerCase().replace('/', '')
    if (!searchTerm) return true
    
    return item.title.toLowerCase().includes(searchTerm) ||
           item.description.toLowerCase().includes(searchTerm) ||
           item.keywords.some(keyword => keyword.includes(searchTerm))
  })

  const closeMenu = () => {
    setIsVisible(false)
    setSearch('')
    setSelectedIndex(0)
  }

  const removeSlashAndExecute = async (commandFn: () => void | Promise<void>) => {
    // Remove the slash character that triggered the menu
    const { view } = editor
    const { selection } = view.state
    const { $from } = selection
    
    if ($from.nodeBefore?.textContent?.endsWith('/')) {
      const slashPos = $from.pos - 1
      editor.chain().focus().deleteRange({ from: slashPos, to: $from.pos }).run()
    }
    
    // Execute the command
    await commandFn()
    closeMenu()
  }

  const closeSpacePrompt = () => {
    onCloseSpacePrompt?.()
    setSpacePromptText('')
  }

  // Focus space prompt when it appears
  useEffect(() => {
    console.log('🎯 Space prompt effect triggered:', { showSpacePrompt, position: spacePromptPosition })
    if (showSpacePrompt) {
      console.log('✅ Space prompt should be visible!')
      if (spacePromptRef.current) {
        console.log('✅ Focusing space prompt input')
        setTimeout(() => spacePromptRef.current?.focus(), 10)
      } else {
        console.log('❌ Space prompt ref not found')
      }
    }
  }, [showSpacePrompt, spacePromptPosition])

  const handleAIGeneration = async (prompt: string, insertPosition?: number) => {
    // Prevent double generation
    if (isGenerating) {
      console.warn('AI generation already in progress, ignoring duplicate request')
      return
    }

    if (!aiStatus.writerAvailable) {
      console.warn('AI Writer not available:', aiStatus)
      editor.chain().focus().insertContent('<p><em>AI Writer is not available. Please check Chrome AI settings.</em></p>').run()
      return
    }

    console.log('🎯 Starting AI generation with prompt:', prompt)

    // Store the generation position before starting
    const { view } = editor
    const currentPos = insertPosition !== undefined ? insertPosition : view.state.selection.from
    const coords = view.coordsAtPos(currentPos)
    
    // Get viewport dimensions
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // Convert to viewport coordinates and constrain to bounds
    const menuHeight = 60
    const menuWidth = 200
    
    let viewportTop = coords.top - window.scrollY
    let viewportLeft = coords.left - window.scrollX
    
    // Ensure generation indicator stays within viewport bounds
    viewportTop = Math.max(10, Math.min(viewportTop, viewportHeight - menuHeight - 10))
    viewportLeft = Math.max(10, Math.min(viewportLeft, viewportWidth - menuWidth - 10))
    
    const genPosition = {
      top: viewportTop,
      left: viewportLeft
    }
    setGenerationPosition(genPosition)

    setIsGenerating(true)
    closeMenu()
    closeSpacePrompt()

    try {
      console.log('Generating text with prompt:', prompt)

      // Get AI writer instance
      const writer = await getOrCreateWriter({
        tone: 'neutral',
        format: 'markdown',
        length: 'medium'
      })

      // Use streaming for better user experience
      const stream = writer.writeStreaming(prompt, {
        context: editor.getText() || 'General writing'
      })
      
      let accumulatedText = ''
      
      // Stream the text chunks as they arrive (just accumulate, don't display)
      for await (const chunk of stream) {
        accumulatedText += chunk
      }

      // Insert final content after streaming is complete
      try {
        // Convert final markdown to HTML
        const htmlContent = marked.parse(accumulatedText)
        
        // Insert the formatted content at the cursor position
        editor.chain()
          .focus()
          .setTextSelection(currentPos)
          .insertContent(htmlContent + ' ')
          .run()
      } catch (error) {
        console.warn('Markdown parsing failed:', error)
        // Fallback to plain text
        editor.chain()
          .focus()
          .setTextSelection(currentPos)
          .insertContent(accumulatedText + ' ')
          .run()
      }

      console.log('Generated result:', accumulatedText)
    } catch (error) {
      console.error('AI generation failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        aiStatus
      })
      
      // No cleanup needed since we don't insert placeholder text
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      editor.chain().focus().insertContent(`<p><em>AI generation failed: ${errorMessage}</em></p>`).run()
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const handleUpdate = () => {
      const { selection } = editor.state
      const { empty, $from } = selection
      
      if (!empty) {
        setIsVisible(false)
        // Also close space prompt when text is selected (bubble menu should show instead)
        if (showSpacePrompt) {
          closeSpacePrompt()
        }
        return
      }
      
      // Only show slash menu when there's actually a "/" character
      const textBefore = $from.nodeBefore?.textContent || ''
      const isAfterSlash = textBefore.endsWith('/')
      
      if (isAfterSlash) {
        const { view } = editor
        const coords = view.coordsAtPos($from.pos)
        
        // Get viewport dimensions
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        
        // Convert to viewport coordinates and constrain to bounds
        const menuHeight = 200 // approximate menu height
        const menuWidth = 320  // approximate menu width
        
        let viewportTop = coords.top - window.scrollY
        let viewportLeft = coords.left - window.scrollX
        
        // Ensure menu stays within viewport bounds
        viewportTop = Math.max(10, Math.min(viewportTop, viewportHeight - menuHeight - 10))
        viewportLeft = Math.max(10, Math.min(viewportLeft, viewportWidth - menuWidth - 10))
        
        setPosition({ 
          top: viewportTop, 
          left: viewportLeft 
        })
        setIsVisible(true)
        
        const slashIndex = textBefore.lastIndexOf('/')
        setSearch(textBefore.substring(slashIndex))
      } else {
        setIsVisible(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible && !showSpacePrompt) return

      // Handle space prompt keys
      if (showSpacePrompt) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault()
            handleAIGeneration(spacePromptText || 'Continue writing', spaceInsertAt)
            break
          case 'Escape':
            event.preventDefault()
            closeSpacePrompt()
            break
        }
        return
      }

      // Handle menu keys
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
          break
        case 'Enter':
          event.preventDefault()
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].command()
          }
          break
        case 'Escape':
          event.preventDefault()
          closeMenu()
          break
      }
    }

    // No scroll handler needed for fixed positioning

    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setIsVisible(false)
        setSearch('')
        setSelectedIndex(0)
      }
    }

    editor.on('selectionUpdate', handleUpdate)
    editor.on('update', handleUpdate)
    document.addEventListener('keydown', handleKeyDown)
    // No scroll listener needed for fixed positioning
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      editor.off('selectionUpdate', handleUpdate)
      editor.off('update', handleUpdate)
      document.removeEventListener('keydown', handleKeyDown)
      // No scroll listener cleanup needed
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editor, isVisible, filteredItems, selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  console.log('🎯 AIFloatingMenu render check:', { 
    isVisible, 
    isGenerating, 
    showSpacePrompt,
    spacePromptPosition,
    aiAvailable: aiStatus.writerAvailable 
  })
  
  if (!isVisible && !isGenerating && !showSpacePrompt) {
    return null
  }

  // AI is currently generating content
  if (isGenerating) {
    const safeGenTop = clamp(generationPosition.top + 24, 12, viewportHeight ? viewportHeight - 80 : generationPosition.top + 24)
    const safeGenLeft = clamp(generationPosition.left, 12, viewportWidth ? viewportWidth - 240 : generationPosition.left)

    // Use viewport coordinates directly (already converted)
    return (
      <div 
        class="fixed z-[90] bg-white border border-gray-200 rounded-lg shadow-lg p-4 bubble-menu"
        style={{ top: `${safeGenTop}px`, left: `${safeGenLeft}px` }}
      >
        <div class="flex items-center space-x-2">
          <div class="spinner"></div>
          <span class="text-sm text-gray-600">AI is writing...</span>
        </div>
      </div>
    )
  }

  // Space-triggered AI prompt (like Notion) - PRIORITY RENDER with absolute positioning to stay anchored to text
  if (showSpacePrompt) {
    const safeSpaceTop = clamp(spacePromptPosition.top + 24, 12, viewportHeight ? viewportHeight - 140 : spacePromptPosition.top + 24)
    const safeSpaceLeft = clamp(spacePromptPosition.left, 12, viewportWidth ? viewportWidth - 330 : spacePromptPosition.left)

    return (
      <div 
        class="fixed z-[95] bg-white border border-purple-200 rounded-lg shadow-lg p-3 animate-fade-in w-80 max-w-sm space-prompt"
        style={{ 
          top: `${safeSpaceTop}px`, 
          left: `${safeSpaceLeft}px`
        }}
      >
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
            <SparklesIcon size={14} class="text-purple-600" />
          </div>
          <input
            ref={spacePromptRef}
            type="text"
            value={spacePromptText}
            onChange={(e) => setSpacePromptText((e.target as HTMLInputElement).value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                await handleAIGeneration(spacePromptText || 'Continue writing', spaceInsertAt)
              } else if (e.key === 'Escape') {
                e.preventDefault()
                closeSpacePrompt()
              }
            }}
            placeholder="Ask AI anything..."
            class="flex-1 text-sm bg-transparent outline-none ai-prompt-input"
            autoFocus
          />
          <button
            onClick={async () => await handleAIGeneration(spacePromptText || 'Continue writing', spaceInsertAt)}
            class="text-purple-600 hover:text-purple-800 p-1"
            disabled={isGenerating}
          >
            <SparklesIcon size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={menuContainerRef}
      class="fixed z-[90] bg-white border border-gray-200 rounded-lg shadow-lg min-w-80 max-w-96 animate-fade-in bubble-menu ai-floating-menu"
      style={{ 
        top: `${clamp(position.top + 24, 12, viewportHeight ? viewportHeight - 320 : position.top + 24)}px`, 
        left: `${clamp(position.left, 12, viewportWidth ? viewportWidth - 320 : position.left)}px`
      }}
    >
      {search.startsWith('/') && (
        <div class="p-3 border-b border-gray-100">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            placeholder="Search for blocks..."
            class="w-full text-sm bg-transparent outline-none ai-prompt-input"
            autoFocus
          />
        </div>
      )}
      
      <div class="max-h-64 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div class="p-3 text-sm text-gray-500 text-center">
            No blocks found
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <button
              key={item.title}
              onClick={item.command}
              class={`w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === filteredItems.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div class={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
                item.category === 'ai' ? 'bg-purple-100 text-purple-600' :
                item.category === 'media' ? 'bg-green-100 text-green-600' :
                item.category === 'advanced' ? 'bg-orange-100 text-orange-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <item.icon size={16} />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </div>
                <div class="text-xs text-gray-500 truncate">
                  {item.description}
                </div>
              </div>
              {item.category === 'ai' && (
                <SparklesIcon size={12} class="text-purple-400 flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
})