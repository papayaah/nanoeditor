import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'


interface SpaceAIOptions {
  onSpacePressed: (position: { top: number; left: number }, insertAt: number) => void
}

export const SpaceAIExtension = Extension.create<SpaceAIOptions>({
  name: 'spaceAI',

  addOptions() {
    return {
      onSpacePressed: () => {
        console.log('⚠️ Default onSpacePressed callback called - this should be overridden!')
      },
    }
  },

  onCreate() {
    console.log('🚀 SpaceAI Extension created!')
  },

  addProseMirrorPlugins() {
    console.log('🔧 Adding SpaceAI ProseMirror plugins...')
    
    return [
      new Plugin({
        key: new PluginKey('spaceAI'),
        
        props: {
          handleKeyDown: (view, event) => {
            // Only handle space key
            if (event.key !== ' ') {
              return false
            }

            const { state } = view
            const { selection } = state
            
            if (!selection) return false
            
            const { $from } = selection
            const currentNode = $from.parent
            const currentText = state.doc.textBetween($from.start(), $from.pos)
            
            console.log('🚀 Space detected! Current text:', JSON.stringify(currentText))
            console.log('🎯 Node type:', currentNode.type.name)
            console.log('🎯 Is paragraph?', currentNode.type.name === 'paragraph')
            
            // Check if we're at the start of an empty paragraph or line with only spaces (like Notion)
            const isEmptyParagraph = currentNode.type.name === 'paragraph' && 
              (currentText.trim().length === 0 || currentText === ' ')
            
            console.log('✨ Should trigger AI (empty paragraph)?', isEmptyParagraph)
            
            if (isEmptyParagraph) {
              console.log('✅ Triggering AI prompt!')
              
              // Let the space be inserted first, then show the AI prompt
              setTimeout(() => {
                try {
                  const updatedView = this.editor?.view || view
                  const updatedState = updatedView.state
                  const updatedSelection = updatedState.selection
                  
                  // Get coordinates of the current cursor position
                  const coords = updatedView.coordsAtPos(updatedSelection.from)
                  
                  // Get viewport dimensions
                  const viewportHeight = window.innerHeight
                  const viewportWidth = window.innerWidth
                  
                  // Convert to viewport coordinates and constrain to bounds
                  const promptHeight = 60
                  const promptWidth = 320
                  
                  let viewportTop = coords.top - window.scrollY
                  let viewportLeft = coords.left - window.scrollX
                  
                  // Ensure prompt stays within viewport bounds
                  viewportTop = Math.max(10, Math.min(viewportTop, viewportHeight - promptHeight - 10))
                  viewportLeft = Math.max(10, Math.min(viewportLeft, viewportWidth - promptWidth - 10))
                  
                  const viewportCoords = {
                    top: viewportTop,
                    left: viewportLeft
                  }
                  
                  console.log('📍 Cursor coords (viewport):', viewportCoords)
                  
                  // Call the callback with viewport position and insertion point
                  this.options.onSpacePressed(
                    viewportCoords,
                    updatedSelection.from
                  )
                  
                  console.log('🎉 AI prompt callback called!')
                } catch (error) {
                  console.error('❌ Could not get cursor coordinates:', error)
                }
              }, 10)
            } else {
              console.log('❌ Not triggering - not an empty paragraph')
            }

            return false // Let the space character be inserted normally
          }
        }
      })
    ]
  }
})