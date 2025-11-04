import { useState, useEffect } from 'preact/hooks'
import { Editor } from './components/Editor'
import { getAIStatus, AIStatus, debugAI, isAIAvailable } from './utils/chromeAI'
import { FileTextIcon, SparklesIcon, AlertCircleIcon } from 'lucide-preact'

export function App() {
  const [content, setContent] = useState('')
  const [aiStatus, setAIStatus] = useState<AIStatus>({
    writerAvailable: false,
    rewriterAvailable: false,
    writerCapabilities: null,
    rewriterCapabilities: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAIWarning, setShowAIWarning] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Early detection of Chrome AI API
        console.log('Checking Chrome AI availability...')
        console.log('Writer in self:', typeof self !== 'undefined' && 'Writer' in self)
        console.log('Rewriter in self:', typeof self !== 'undefined' && 'Rewriter' in self)
        
        if (typeof self !== 'undefined') {
          console.log('Writer object:', self.Writer)
          console.log('Rewriter object:', self.Rewriter)
        } else {
          console.warn('Chrome AI API not found. Make sure you are using Chrome Canary with AI features enabled.')
        }
        
        const status = await getAIStatus()
        setAIStatus(status)
        
        console.log('Final AI status:', status)
        
        // Show warning if AI is not available
        if (!status.writerAvailable && !status.rewriterAvailable) {
          setShowAIWarning(true)
        }
      } catch (error) {
        console.error('Failed to check AI status:', error)
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        setShowAIWarning(true)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    // Auto-save to localStorage
    localStorage.setItem('aieditor-content', newContent)
  }

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('aieditor-content')
    if (savedContent) {
      setContent(savedContent)
    }
  }, [])

  if (isLoading) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="spinner mx-auto mb-4"></div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Loading AI Editor</h2>
          <p class="text-gray-600">Initializing the editor and checking AI capabilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-6xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <FileTextIcon size={24} class="text-blue-600" />
                <h1 class="text-xl font-bold text-gray-900">AI Editor</h1>
              </div>
              {(aiStatus.writerAvailable || aiStatus.rewriterAvailable) && (
                <div class="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  <SparklesIcon size={12} />
                  <span>AI Powered</span>
                </div>
              )}
            </div>
            
            <div class="flex items-center space-x-4">
              {/* Word Count */}
              <div class="text-sm text-gray-500">
                {content ? `${content.replace(/<[^>]*>/g, '').split(' ').filter(w => w).length} words` : '0 words'}
              </div>
              
              {/* Debug AI Button */}
              <button
                onClick={() => {
                  debugAI()
                  console.log('AI Available:', isAIAvailable())
                  console.log('Current AI Status:', aiStatus)
                }}
                class="btn-ghost text-xs"
                title="Debug AI in console"
              >
                Debug AI
              </button>
              
              {/* Export Button */}
              <button
                onClick={() => {
                  const blob = new Blob([content], { type: 'text/html' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'document.html'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                class="btn-secondary text-sm"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* AI Warning Banner */}
      {showAIWarning && (
        <div class="bg-yellow-50 border-b border-yellow-200">
          <div class="max-w-6xl mx-auto px-6 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <AlertCircleIcon size={20} class="text-yellow-600 flex-shrink-0" />
                <div>
                  <p class="text-sm text-yellow-800">
                    <strong>AI features are not available.</strong> 
                    {' '}This editor works best with Chrome's built-in AI. Make sure you're using:
                  </p>
                  <ul class="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                    <li>Chrome Canary (version 127+)</li>
                    <li>Enable chrome://flags/#writer-api-for-gemini-nano</li>
                    <li>Enable chrome://flags/#rewriter-api-for-gemini-nano</li>
                    <li>Restart Chrome and wait for model download</li>
                  </ul>
                  <p class="text-xs text-yellow-700 mt-1">
                    You can still use all the rich text editing features without AI.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIWarning(false)}
                class="text-yellow-600 hover:text-yellow-800 p-1"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main class="min-h-screen bg-white">
        <Editor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your document... Use '/' for commands or select text for AI features"
        />
      </main>

      {/* Footer */}
      <footer class="bg-gray-50 border-t border-gray-200 py-6">
        <div class="max-w-6xl mx-auto px-6">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center space-x-4">
              <span>AI Editor - Notion-like editor with Chrome AI</span>
              <div class="flex items-center space-x-2">
                {aiStatus.writerAvailable && (
                  <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Writer AI Ready
                  </span>
                )}
                {aiStatus.rewriterAvailable && (
                  <span class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Rewriter AI Ready
                  </span>
                )}
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span>Made with ❤️ using Preact & TipTap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}