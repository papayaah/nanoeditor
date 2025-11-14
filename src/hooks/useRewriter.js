import { useState, useEffect } from 'react';

export const useRewriter = () => {
  const [rewriterAvailable, setRewriterAvailable] = useState(false);

  // Check if Chrome AI Rewriter is available
  useEffect(() => {
    const checkAI = async () => {
      try {
        if (typeof self !== 'undefined' && 'Rewriter' in self) {
          const availability = await self.Rewriter.availability();
          const isAvailable = availability === 'available' || availability === 'downloadable';
          setRewriterAvailable(isAvailable);
        }
      } catch (error) {
        // Silently handle AI availability check errors
      }
    };
    checkAI();
  }, []);

  const rewriteText = async (text, tone, sharedContext, stripEmojis = false, onChunk = null) => {
    if (!rewriterAvailable) {
      throw new Error('Rewriter API is not available');
    }
    
    const availability = await self.Rewriter.availability();
    
    // Create a fresh rewriter instance for this specific generation
    // Each call gets its own instance to ensure fresh, independent results
    let rewriter;
    if (availability === 'available' || availability === 'downloadable') {
      // Rewriter API only accepts 'as-is', 'more-formal', 'more-casual'
      const config = {
        tone: tone,
        format: 'as-is',
        length: 'as-is',
        sharedContext: sharedContext
      };
      
      rewriter = await self.Rewriter.create(config);
    } else {
      throw new Error('Rewriter API is unavailable');
    }

    try {
      // Stream the AI response - text should be just the user's input
      const stream = rewriter.rewriteStreaming(text);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        
        // Strip emojis during streaming if requested
        let displayText = fullText;
        if (stripEmojis) {
          displayText = fullText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
        }
        
        // Call onChunk callback if provided for streaming updates
        if (onChunk) {
          onChunk(displayText);
        }
      }

      // Final emoji stripping if needed
      if (stripEmojis) {
        fullText = fullText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
      }

      return fullText;
    } finally {
      // Always clean up the rewriter instance after use
      if (rewriter && rewriter.destroy) {
        rewriter.destroy();
      }
    }
  };



  return {
    rewriterAvailable,
    rewriteText,
  };
};
