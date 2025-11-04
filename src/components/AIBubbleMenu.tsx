import { useRef, useState, useEffect } from 'preact/hooks'
import { Editor } from '@tiptap/core'
import { 
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  HighlighterIcon,
  LinkIcon,
  SparklesIcon,
  VolumeXIcon,
  Volume2Icon,
  ZapIcon,
  ExpandIcon,
  ShrinkIcon
} from 'lucide-preact'
import { RewriterCreateOptions, AIStatus } from '../utils/chromeAI'
import { AIRewriteModal } from './AIRewriteModal'

interface AIBubbleMenuProps {
  editor: Editor
  aiStatus: AIStatus
}

interface RewriteOption {
  label: string
  icon: any
  options: RewriterCreateOptions
  description: string
}

export function AIBubbleMenu({ editor, aiStatus }: AIBubbleMenuProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showAIMenu, setShowAIMenu] = useState(false)

  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [aiPromptPosition, setAIPromptPosition] = useState({ top: 0, left: 0 })
  const [aiPrompt, setAIPrompt] = useState('')
  const [showRewriteModal, setShowRewriteModal] = useState(false)
  const [currentRewriteOptions, setCurrentRewriteOptions] = useState<RewriterCreateOptions | null>(null)
  const [currentCustomPrompt, setCurrentCustomPrompt] = useState('')
  const [originalText, setOriginalText] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const aiPromptRef = useRef<HTMLInputElement>(null)



  const rewriteOptions: RewriteOption[] = [
    {
      label: 'Professional',
      icon: Volume2Icon,
      options: { tone: 'more-formal', format: 'as-is', length: 'as-is' },
      description: 'Make it more professional'
    },
    {
      label: 'Casual',
      icon: VolumeXIcon,
      options: { tone: 'more-casual', format: 'as-is', length: 'as-is' },
      description: 'Make it more casual'
    },
    {
      label: 'Shorter',
      icon: ShrinkIcon,
      options: { tone: 'as-is', format: 'as-is', length: 'shorter' },
      description: 'Make it more concise'
    },
    {
      label: 'Longer',
      icon: ExpandIcon,
      options: { tone: 'as-is', format: 'as-is', length: 'longer' },
      description: 'Add more detail'
    },
    {
      label: 'Fix Grammar',
      icon: ZapIcon,
      options: { tone: 'as-is', format: 'as-is', length: 'as-is' },
      description: 'Fix grammar and spelling'
    }
  ]

  const handleRewrite = (options: RewriterCreateOptions) => {
    if (!aiStatus.rewriterAvailable) {
      alert('AI Rewriter is not available')
      return
    }

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    )

    if (!selectedText.trim()) {
      alert('Please select some text to rewrite')
      return
    }

    // Store the original text and rewrite options
    setOriginalText(selectedText)
    setCurrentRewriteOptions(options)
    setCurrentCustomPrompt('')
    setShowAIMenu(false)
    setShowRewriteModal(true)
  }

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'strike':
        editor.chain().focus().toggleStrike().run()
        break
      case 'highlight':
        editor.chain().focus().toggleHighlight().run()
        break
      case 'link':
        const url = prompt('Enter URL:')
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
        break
    }
  }

  const handleCustomRewrite = () => {
    if (!aiStatus.rewriterAvailable || !aiPrompt.trim()) return

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    )

    if (!selectedText.trim()) return

    // Store the original text and custom prompt
    setOriginalText(selectedText)
    setCurrentRewriteOptions({ 
      tone: 'as-is', 
      format: 'as-is', 
      length: 'as-is' 
    })
    setCurrentCustomPrompt(aiPrompt)
    setShowAIMenu(false)
    setShowRewriteModal(true)
  }

  const handleAcceptRewrite = (rewrittenText: string) => {
    // Replace the selected text with the rewritten text
    editor.chain()
      .focus()
      .deleteSelection()
      .insertContent(rewrittenText)
      .run()
    
    // Close modal and reset state
    setShowRewriteModal(false)
    setOriginalText('')
    setCurrentRewriteOptions(null)
    setCurrentCustomPrompt('')
    setAIPrompt('')
  }

  const handleCancelRewrite = () => {
    setShowRewriteModal(false)
    setOriginalText('')
    setCurrentRewriteOptions(null)
    setCurrentCustomPrompt('')
    setAIPrompt('')
  }

  const handleRegenerateRewrite = () => {
    // Modal will handle regeneration internally
  }

  useEffect(() => {
    const handleSelectionChange = () => {
      const { selection } = editor.state
      const { empty } = selection

      if (empty) {
        setIsVisible(false)
        setShowAIMenu(false)
        return
      }

      // Add a small delay to handle double-click selections properly
      setTimeout(() => {
        const currentSelection = editor.state.selection
        if (currentSelection.empty) return

        // Get the coordinates of the selection
        const { view } = editor
        const start = view.coordsAtPos(currentSelection.from)
        const end = view.coordsAtPos(currentSelection.to)
        
        // Get viewport dimensions
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        
        // Convert to viewport coordinates
        const selectionTop = Math.min(start.top, end.top) - window.scrollY
        const selectionBottom = Math.max(start.bottom, end.bottom) - window.scrollY
        const selectionLeft = (start.left + end.left) / 2 - window.scrollX
        
        // Constrain to viewport bounds and position menus
        const menuHeight = 60
        const menuWidth = 300
        
        // For the formatting menu - prefer above selection, but ensure it's visible
        let menuTop: number
        let menuLeft: number
        
        if (selectionTop >= menuHeight + 20) {
          // Enough space above - position above selection
          menuTop = Math.max(10, selectionTop - menuHeight - 10)
        } else if (selectionBottom + menuHeight + 20 <= viewportHeight) {
          // Not enough space above but space below - position below
          menuTop = Math.min(viewportHeight - menuHeight - 10, selectionBottom + 10)
        } else {
          // Selection too large for viewport - position at top
          menuTop = 10
        }
        
        // Constrain horizontally
        menuLeft = Math.max(10, Math.min(selectionLeft - menuWidth / 2, viewportWidth - menuWidth - 10))

        setPosition({
          top: menuTop,
          left: menuLeft
        })

        // Position the AI prompt below the main menu
        const aiPromptTop = menuTop + menuHeight + 5
        const aiPromptLeft = menuLeft
        
        setAIPromptPosition({
          top: aiPromptTop,
          left: aiPromptLeft
        })

        setIsVisible(true)
      }, 50) // Small delay to ensure selection is stable
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAIMenu(false)
        setIsVisible(false)
        setShowAIMenu(false)
        // Clean up states
        setOriginalText('')
        setShowRewriteModal(false)
        setCurrentRewriteOptions(null)
        setCurrentCustomPrompt('')
        setAIPrompt('')
      }
    }

    editor.on('selectionUpdate', handleSelectionChange)
    editor.on('update', handleSelectionChange)
    document.addEventListener('mousedown', handleClickOutside)
    // No scroll listener needed for fixed positioning
    
    return () => {
      editor.off('selectionUpdate', handleSelectionChange)
      editor.off('update', handleSelectionChange)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editor])

  // Clean up when becoming invisible
  useEffect(() => {
    if (!isVisible) {
      setShowAIMenu(false)
      setOriginalText('')
      setShowRewriteModal(false)
      setCurrentRewriteOptions(null)
      setCurrentCustomPrompt('')
      setAIPrompt('')
    }
  }, [isVisible])

  if (!isVisible) return null



  return (
    <>
      {/* Formatting Menu (on top) */}
      <div 
        ref={menuRef}
        class="fixed z-[100] animate-fade-in"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`,
          transform: 'translateX(-50%)'
        }}
      >
      {showAIMenu ? (
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg min-w-64 bubble-menu">
          <div class="p-2 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Rewrite with AI</span>
              <button
                onClick={() => setShowAIMenu(false)}
                class="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
          </div>
          
          <div class="p-1">
            {rewriteOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleRewrite(option.options)}
                class="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-purple-600">
                  <option.icon size={14} />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div class="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg flex items-center bubble-menu">
          {/* Text Formatting Buttons */}
          <button
            onClick={() => formatText('bold')}
            class={`p-2 hover:bg-gray-50 border-r border-gray-100 first:rounded-l-lg transition-colors ${
              editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            title="Bold"
          >
            <BoldIcon size={16} />
          </button>
          
          <button
            onClick={() => formatText('italic')}
            class={`p-2 hover:bg-gray-50 border-r border-gray-100 transition-colors ${
              editor.isActive('italic') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            title="Italic"
          >
            <ItalicIcon size={16} />
          </button>
          
          <button
            onClick={() => formatText('strike')}
            class={`p-2 hover:bg-gray-50 border-r border-gray-100 transition-colors ${
              editor.isActive('strike') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            title="Strikethrough"
          >
            <StrikethroughIcon size={16} />
          </button>
          
          <button
            onClick={() => formatText('highlight')}
            class={`p-2 hover:bg-gray-50 border-r border-gray-100 transition-colors ${
              editor.isActive('highlight') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            title="Highlight"
          >
            <HighlighterIcon size={16} />
          </button>
          
          <button
            onClick={() => formatText('link')}
            class={`p-2 hover:bg-gray-50 border-r border-gray-100 transition-colors ${
              editor.isActive('link') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            title="Link"
          >
            <LinkIcon size={16} />
          </button>

          {/* AI Rewrite Button */}
          {aiStatus.rewriterAvailable && (
            <button
              onClick={() => setShowAIMenu(true)}
              class="p-2 hover:bg-purple-50 text-purple-600 rounded-r-lg transition-colors border-l border-gray-100"
              title="Rewrite with AI"
            >
              <div class="flex items-center space-x-1">
                <SparklesIcon size={16} />
                <span class="text-xs font-medium">AI</span>
              </div>
            </button>
          )}
        </div>
      )}
      </div>

      {/* AI Prompt (below selection) */}
      {aiStatus.rewriterAvailable && (
        <div 
          class="fixed z-[99] bg-white border border-purple-200 rounded-lg shadow-lg animate-fade-in space-prompt"
          style={{ 
            top: `${aiPromptPosition.top}px`, 
            left: `${aiPromptPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div class="flex items-center p-2">
            <div class="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mr-2">
              <SparklesIcon size={12} class="text-purple-600" />
            </div>
            <input
              ref={aiPromptRef}
              type="text"
              value={aiPrompt}
              onChange={(e) => setAIPrompt((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiPrompt.trim()) {
                  e.preventDefault()
                  handleCustomRewrite()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  setAIPrompt('')
                }
              }}
              placeholder="Rewrite with custom prompt..."
              class="flex-1 text-sm bg-transparent outline-none"
            />
            {aiPrompt && (
              <button
                onClick={handleCustomRewrite}
                class="ml-2 text-purple-600 hover:text-purple-800"
              >
                <SparklesIcon size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Rewrite Modal */}
      {showRewriteModal && currentRewriteOptions && (
        <AIRewriteModal
          isOpen={showRewriteModal}
          originalText={originalText}
          rewriteOptions={currentRewriteOptions}
          customPrompt={currentCustomPrompt}
          onAccept={handleAcceptRewrite}
          onCancel={handleCancelRewrite}
          onRegenerate={handleRegenerateRewrite}
        />
      )}
    </>
  )
}