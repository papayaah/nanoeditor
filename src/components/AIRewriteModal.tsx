import { useRef, useState, useEffect } from 'preact/hooks'
import { X, RefreshCw, Check } from 'lucide-preact'
import { RewriterCreateOptions, createRewriter } from '../utils/chromeAI'

interface AIRewriteModalProps {
  isOpen: boolean
  originalText: string
  rewriteOptions: RewriterCreateOptions
  customPrompt?: string
  onAccept: (rewrittenText: string) => void
  onCancel: () => void
  onRegenerate: () => void
}

export function AIRewriteModal({ 
  isOpen, 
  originalText, 
  rewriteOptions, 
  customPrompt,
  onAccept, 
  onCancel, 
  onRegenerate 
}: AIRewriteModalProps) {
  const [streamingText, setStreamingText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const streamingRef = useRef<HTMLDivElement>(null)

  // Stream the rewrite when modal opens or regenerates
  useEffect(() => {
    if (isOpen && originalText) {
      startRewrite()
    }
  }, [isOpen, originalText, rewriteOptions, customPrompt])

  // Auto-scroll to bottom as text streams
  useEffect(() => {
    if (streamingRef.current) {
      streamingRef.current.scrollTop = streamingRef.current.scrollHeight
    }
  }, [streamingText])

  const startRewrite = async () => {
    setIsGenerating(true)
    setIsComplete(false)
    setError(null)
    setStreamingText('')

    try {
      // Use real Chrome AI streaming
      const rewriter = await createRewriter(rewriteOptions)
      const stream = rewriter.rewriteStreaming(originalText, customPrompt ? { context: customPrompt } : undefined)
      
      let fullText = ''
      
      for await (const chunk of stream) {
        fullText = chunk // Chrome AI streams the full text so far, not chunks
        setStreamingText(fullText)
      }
      
      // Clean up
      if (rewriter.destroy) {
        rewriter.destroy()
      }
      
      setIsGenerating(false)
      setIsComplete(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rewrite text')
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    onRegenerate()
    startRewrite()
  }

  const handleAccept = () => {
    if (streamingText) {
      onAccept(streamingText)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 modal-backdrop"
      onClick={onCancel}
    >
      <div 
        ref={modalRef}
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col rewrite-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div class="flex items-center justify-between p-4 modal-header">
          <div class="flex items-center space-x-2">
            <button
              onClick={onCancel}
              class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} class="text-gray-600" />
            </button>
            <h3 class="text-lg font-semibold text-gray-900">
              {customPrompt ? 'Rewrite with custom prompt' : 'Improve writing'}
            </h3>
          </div>
          
          <button
            onClick={onCancel}
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} class="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-hidden ai-progress">
          <div 
            ref={streamingRef}
            class="h-full p-6 overflow-y-auto"
          >
            {error ? (
              <div class="text-red-600 bg-red-50 p-4 rounded-lg">
                <p class="font-medium">Error rewriting text:</p>
                <p class="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <div class="prose prose-lg max-w-none">
                <div class="whitespace-pre-wrap rewrite-content">
                  {streamingText}
                  {isGenerating && (
                    <span class="streaming-cursor" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center space-x-2">
            {isComplete && !error && (
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 rounded-lg transition-colors disabled:opacity-50 btn-regenerate"
              >
                <RefreshCw size={16} class={isGenerating ? 'animate-spin' : ''} />
                <span>Regenerate</span>
              </button>
            )}
            
            {isGenerating && (
              <div class="flex items-center space-x-2 text-sm text-gray-600">
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>AI is rewriting...</span>
              </div>
            )}
          </div>

          <div class="flex items-center space-x-2">
            <button
              onClick={onCancel}
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleAccept}
              disabled={!isComplete || !streamingText || isGenerating}
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors btn-accept"
            >
              <Check size={16} />
              <span>Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}