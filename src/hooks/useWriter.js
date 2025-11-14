import { useState, useEffect } from 'react';

// Helper functions for localStorage
const getStoredSetting = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const setStoredSetting = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Silently handle localStorage errors
  }
};

export const useWriter = (storagePrefix = 'writer') => {
  const [writerAvailable, setWriterAvailable] = useState(false);
  
  // Load settings from localStorage with defaults and validation
  const [tone, setTone] = useState(() => {
    const stored = getStoredSetting(`${storagePrefix}Tone`, 'casual');
    // Validate tone value
    if (!['casual', 'neutral', 'formal'].includes(stored)) {
      return 'casual';
    }
    return stored;
  });
  
  const [format, setFormat] = useState(() => {
    const stored = getStoredSetting(`${storagePrefix}Format`, 'plain-text');
    // Validate format value - default to plain-text for social media
    if (!['plain-text', 'markdown'].includes(stored)) {
      return 'plain-text';
    }
    return stored;
  });
  
  const [length, setLength] = useState(() => {
    const stored = getStoredSetting(`${storagePrefix}Length`, 'short');
    // Validate length value
    if (!['short', 'medium', 'long'].includes(stored)) {
      return 'short';
    }
    return stored;
  });
  


  // Save settings to localStorage whenever they change
  useEffect(() => {
    setStoredSetting(`${storagePrefix}Tone`, tone);
  }, [tone, storagePrefix]);

  useEffect(() => {
    setStoredSetting(`${storagePrefix}Format`, format);
  }, [format, storagePrefix]);

  useEffect(() => {
    setStoredSetting(`${storagePrefix}Length`, length);
  }, [length, storagePrefix]);

  // Check if Chrome AI Writer is available
  useEffect(() => {
    const checkAI = async () => {
      try {
        if (typeof self !== 'undefined' && 'Writer' in self) {
          const availability = await self.Writer.availability();
          const isAvailable = availability === 'available' || availability === 'downloadable';
          setWriterAvailable(isAvailable);
        }
      } catch (error) {
        // Silently handle AI availability check errors
      }
    };
    checkAI();
  }, []);

  const generateText = async (prompt, sharedContext = '', stripEmojis = false, onChunk = null) => {
    if (!writerAvailable) {
      throw new Error('Writer API is not available');
    }
    
    const availability = await self.Writer.availability();
    
    // Create a fresh writer instance for this specific generation
    // Each call gets its own instance to ensure fresh, independent results
    let writer;
    if (availability === 'available' || availability === 'downloadable') {
      writer = await self.Writer.create({
        tone: tone,
        format: format,
        length: length,
        sharedContext: sharedContext,
        outputLanguage: 'en'
      });
    } else {
      throw new Error('Writer API is unavailable');
    }

    try {
      // Stream the AI response - prompt should be just the user's text
      const stream = writer.writeStreaming(prompt);
      
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
      // Always clean up the writer instance after use
      if (writer && writer.destroy) {
        writer.destroy();
      }
    }
  };



  return {
    writerAvailable,
    tone,
    setTone,
    format,
    setFormat,
    length,
    setLength,
    generateText,
  };
};
