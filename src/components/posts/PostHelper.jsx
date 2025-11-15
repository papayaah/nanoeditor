import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, RefreshCw, HelpCircle } from 'lucide-react';
import { useRewriter } from '../../hooks/useRewriter';
import { useWriter } from '../../hooks/useWriter';
import { getAllPostEntries, savePostEntry } from '../../hooks/usePostEntries';
import './PostHelper.css';

export const PostHelper = ({ 
  currentEntryId,
  onEntrySaved,
  onSettingsExport,
  onNewEntry,
  darkMode
}) => {
  const [inputText, setInputText] = useState('');
  const [currentEntry, setCurrentEntry] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [lastGeneratedText, setLastGeneratedText] = useState('');

  // Load current entry when it changes
  useEffect(() => {
    const loadCurrentEntry = async () => {
      if (!currentEntryId) {
        setCurrentEntry(null);
        setInputText('');
        setLastGeneratedText('');
        return;
      }
      
      const allEntries = await getAllPostEntries();
      const entry = allEntries.find(e => e.id === currentEntryId);
      
      if (entry) {
        setCurrentEntry(entry);
        setInputText(entry.text || '');
        setLastGeneratedText(entry.text || '');
        
        // Restore settings from entry if they exist
        if (entry.settings) {
          const savedSettings = entry.settings;
          if (savedSettings.apiMode) setApiMode(savedSettings.apiMode);
          if (savedSettings.tone) setTone(savedSettings.tone);
          if (savedSettings.format) setFormat(savedSettings.format);
          if (savedSettings.length) setLength(savedSettings.length);
          if (savedSettings.style) setStyle(savedSettings.style);
          if (savedSettings.customStyle !== undefined) setCustomStyle(savedSettings.customStyle);
          if (savedSettings.useEmoticons !== undefined) setUseEmoticons(savedSettings.useEmoticons);
          if (savedSettings.stream !== undefined) setStream(savedSettings.stream);
        }
      } else {
        setCurrentEntry(null);
        setInputText('');
        setLastGeneratedText('');
      }
    };
    
    loadCurrentEntry();
  }, [currentEntryId]);

  // Save entry when it changes
  useEffect(() => {
    const saveCurrentEntry = async () => {
      if (!currentEntry || !currentEntryId) return;
      
      // Only save if entry has content
      if (currentEntry.text || (currentEntry.suggestions && currentEntry.suggestions.some(s => s && s.trim().length > 0))) {
        await savePostEntry(currentEntry);
        if (onEntrySaved) {
          onEntrySaved();
        }
      }
    };
    
    if (currentEntry && !currentEntry.isGenerating) {
      // Debounce saves
      const timeoutId = setTimeout(() => {
        saveCurrentEntry();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentEntry, currentEntryId, onEntrySaved]);

  // Don't update currentEntry.text while typing - only update when submitting
  // This keeps the original submission text separate from the input text area
  const [tone, setTone] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperTone');
      const apiMode = localStorage.getItem('postHelperApiMode') || 'writer';
      
      // If no stored value, use default based on API mode
      if (!stored) {
        return apiMode === 'writer' ? 'neutral' : 'as-is';
      }
      
      // Validate stored value based on current API mode
      if (apiMode === 'writer') {
        if (['casual', 'neutral', 'formal'].includes(stored)) {
          return stored;
        }
        // Migrate from Rewriter format
        if (stored === 'more-casual') return 'casual';
        if (stored === 'more-formal') return 'formal';
        if (stored === 'as-is') return 'neutral';
        return 'neutral';
      } else {
        if (['more-casual', 'as-is', 'more-formal'].includes(stored)) {
          return stored;
        }
        // Migrate from Writer format
        if (stored === 'casual') return 'more-casual';
        if (stored === 'formal') return 'more-formal';
        if (stored === 'neutral') return 'as-is';
        return 'as-is';
      }
    } catch {
      const apiMode = localStorage.getItem('postHelperApiMode') || 'writer';
      return apiMode === 'writer' ? 'neutral' : 'as-is';
    }
  });
  const [useEmoticons, setUseEmoticons] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperEmoticons');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const [temperature, setTemperature] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperTemperature');
      return stored || '0.7';
    } catch {
      return '0.7';
    }
  });
  const [topP, setTopP] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperTopP');
      return stored || '0.9';
    } catch {
      return '0.9';
    }
  });
  const [seed, setSeed] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperSeed');
      return stored || '';
    } catch {
      return '';
    }
  });
  const [stream, setStream] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperStream');
      return stored !== 'false';
    } catch {
      return true;
    }
  });
  const [apiMode, setApiMode] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperApiMode');
      return stored || 'writer';
    } catch {
      return 'writer';
    }
  });
  const [style, setStyle] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperStyle');
      return stored || 'default';
    } catch {
      return 'default';
    }
  });
  const [customStyle, setCustomStyle] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperCustomStyle');
      return stored || '';
    } catch {
      return '';
    }
  });
  const [useCurrentSettings, setUseCurrentSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperUseCurrentSettings');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  
  const {
    rewriterAvailable,
    rewriteText,
  } = useRewriter();

  // Manage format and length separately to support both APIs
  const [format, setFormat] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperFormat');
      const apiMode = localStorage.getItem('postHelperApiMode') || 'writer';
      if (!stored) {
        return apiMode === 'writer' ? 'markdown' : 'as-is';
      }
      // Validate based on API mode
      if (apiMode === 'writer') {
        return ['markdown', 'plain-text'].includes(stored) ? stored : 'markdown';
      } else {
        return ['as-is', 'markdown', 'plain-text'].includes(stored) ? stored : 'as-is';
      }
    } catch {
      const apiMode = localStorage.getItem('postHelperApiMode') || 'writer';
      return apiMode === 'writer' ? 'markdown' : 'as-is';
    }
  });

  const [length, setLength] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperLength');
      const apiMode = localStorage.getItem('postHelperApiMode') || 'writer';
      if (!stored) {
        return apiMode === 'writer' ? 'short' : 'as-is';
      }
      // Validate based on API mode
      if (apiMode === 'writer') {
        return ['short', 'medium', 'long'].includes(stored) ? stored : 'short';
      } else {
        return ['shorter', 'as-is', 'longer'].includes(stored) ? stored : 'as-is';
      }
    } catch {
      const apiMode = localStorage.getItem('postHelperApiMode') || 'writer';
      return apiMode === 'writer' ? 'short' : 'as-is';
    }
  });

  const {
    writerAvailable,
    tone: writerTone,
    setTone: setWriterTone,
    format: writerFormat,
    setFormat: setWriterFormat,
    length: writerLength,
    setLength: setWriterLength,
    generateText,
  } = useWriter('postHelper');

  // Sync format and length with Writer hook when in Writer mode
  useEffect(() => {
    if (apiMode === 'writer') {
      if (format !== writerFormat) {
        setWriterFormat(format);
      }
      if (length !== writerLength) {
        setWriterLength(length);
      }
    }
  }, [apiMode, format, length, writerFormat, writerLength, setWriterFormat, setWriterLength]);

  const aiAvailable = apiMode === 'writer' ? writerAvailable : rewriterAvailable;
  
  // Track if any generation is in progress
  const isGenerating = currentEntry?.isGenerating || false;

  // Save format and length to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('postHelperFormat', format);
    } catch {}
  }, [format]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperLength', length);
    } catch {}
  }, [length]);

  // Convert values when switching between APIs
  useEffect(() => {
    if (apiMode === 'writer') {
      // Convert Rewriter values to Writer values
      
      // Convert tone
      if (tone === 'more-casual') setTone('casual');
      else if (tone === 'more-formal') setTone('formal');
      else if (tone === 'as-is') setTone('neutral');
      else if (!['casual', 'neutral', 'formal'].includes(tone)) {
        setTone('neutral');
      }
      
      // Convert format
      if (format === 'as-is') setFormat('markdown');
      else if (!['markdown', 'plain-text'].includes(format)) {
        setFormat('markdown');
      }
      
      // Convert length
      if (length === 'shorter') setLength('short');
      else if (length === 'longer') setLength('long');
      else if (length === 'as-is') setLength('medium');
      else if (!['short', 'medium', 'long'].includes(length)) {
        setLength('short');
      }
    } else {
      // Convert Writer values to Rewriter values
      
      // Convert tone
      if (tone === 'casual') setTone('more-casual');
      else if (tone === 'formal') setTone('more-formal');
      else if (tone === 'neutral') setTone('as-is');
      else if (!['more-casual', 'as-is', 'more-formal'].includes(tone)) {
        setTone('as-is');
      }
      
      // Convert format
      if (!['as-is', 'markdown', 'plain-text'].includes(format)) {
        setFormat('as-is');
      }
      
      // Convert length
      if (length === 'short') setLength('shorter');
      else if (length === 'long') setLength('longer');
      else if (length === 'medium') setLength('as-is');
      else if (!['shorter', 'as-is', 'longer'].includes(length)) {
        setLength('as-is');
      }
    }
  }, [apiMode]);

  // Export settings to parent
  useEffect(() => {
    if (onSettingsExport) {
      onSettingsExport({
        apiMode, setApiMode,
        tone, setTone,
        format, setFormat,
        length, setLength,
        style, setStyle,
        customStyle, setCustomStyle,
        useEmoticons, setUseEmoticons,
        stream, setStream,
        temperature, setTemperature,
        topP, setTopP,
        seed, setSeed,
        useCurrentSettings, setUseCurrentSettings,
        isGenerating
      });
    }
  }, [apiMode, tone, format, length, style, customStyle, useEmoticons, stream, temperature, topP, seed, useCurrentSettings, isGenerating, onSettingsExport]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('postHelperTone', tone);
    } catch {}
  }, [tone]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperEmoticons', useEmoticons.toString());
    } catch {}
  }, [useEmoticons]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperTemperature', temperature);
    } catch {}
  }, [temperature]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperTopP', topP);
    } catch {}
  }, [topP]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperSeed', seed);
    } catch {}
  }, [seed]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperStream', stream.toString());
    } catch {}
  }, [stream]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperApiMode', apiMode);
    } catch {}
  }, [apiMode]);



  useEffect(() => {
    try {
      localStorage.setItem('postHelperStyle', style);
    } catch {}
  }, [style]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperCustomStyle', customStyle);
    } catch {}
  }, [customStyle]);

  useEffect(() => {
    try {
      localStorage.setItem('postHelperUseCurrentSettings', useCurrentSettings.toString());
    } catch {}
  }, [useCurrentSettings]);

  // Sync Writer API tone with PostHelper tone
  useEffect(() => {
    if (apiMode === 'writer') {
      // Map Rewriter tones to Writer tones
      const writerToneMap = {
        'more-casual': 'casual',
        'as-is': 'neutral',
        'more-formal': 'formal'
      };
      setWriterTone(writerToneMap[tone] || 'casual');
    }
  }, [tone, apiMode, setWriterTone]);

  // Manual submission only - no automatic triggers

  const generateSuggestions = async (text, targetEntryId = null, forceNewSubmission = false) => {
    if (!aiAvailable) return;

    // Use provided entryId or currentEntryId
    const entryId = targetEntryId || currentEntryId;
    if (!entryId) return;
    
    // Create generation ID at the start so it's accessible in callbacks
    const newGenerationId = Date.now();

    try {
      // Load the entry we're generating for (could be current or new)
      const loadedEntries = await getAllPostEntries();
      let entryToUpdate = loadedEntries.find(e => e.id === entryId);
      
      // If entry doesn't exist, create a new one
      if (!entryToUpdate) {
        entryToUpdate = {
          id: entryId,
          text: '',
          suggestions: [],
          settings: {},
          isGenerating: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      // Store multiple submissions - each submission has text, settings, and generations
      // Structure: submissions = [{ id, text, settings, generations: [{ suggestions, isGenerating, timestamp }], timestamp }, ...]
      const existingSubmissions = Array.isArray(entryToUpdate.submissions) ? entryToUpdate.submissions : [];
      
      // If we have old-style data, convert to new format
      if (!existingSubmissions.length && entryToUpdate.text && Array.isArray(entryToUpdate.suggestions) && entryToUpdate.suggestions.some(s => s && s.trim())) {
        existingSubmissions.push({
          id: Date.now() - 1000,
          text: entryToUpdate.text,
          settings: entryToUpdate.settings || {},
          generations: [{
            id: Date.now() - 500,
            suggestions: entryToUpdate.suggestions,
            isGenerating: false,
            timestamp: entryToUpdate.updatedAt || new Date()
          }],
          timestamp: entryToUpdate.updatedAt || new Date()
        });
      }
      
      // Get current settings
      const currentSettings = {
        apiMode,
        tone,
        writerTone,
        format,
        length,
        style,
        customStyle,
        useEmoticons,
        stream,
      };
      
      // Determine if we should create a new submission
      // Rule 1: Cmd+Enter/Shift+Enter always creates new submission (forceNewSubmission = true)
      // Rule 3: Regenerate with same settings adds generation to existing submission (forceNewSubmission = false)
      // Rule 4: Regenerate with new settings creates new submission (forceNewSubmission = true)
      const lastSubmission = existingSubmissions[0];
      let shouldCreateNewSubmission = forceNewSubmission;
      
      // Normalize settings for comparison (exclude writerTone since it's derived from tone)
      const normalizeSettings = (settings) => {
        const normalized = { ...settings };
        delete normalized.writerTone;
        return normalized;
      };
      
      // If not forced, check if settings changed from last submission
      if (!shouldCreateNewSubmission && lastSubmission) {
        shouldCreateNewSubmission = 
          JSON.stringify(normalizeSettings(lastSubmission.settings)) !== 
          JSON.stringify(normalizeSettings(currentSettings));
      }
      
      const newGenerationId = Date.now();
      
      if (shouldCreateNewSubmission) {
        // Create a new submission (Rule 1: Cmd+Enter/Shift+Enter, Rule 4: Regenerate with new settings)
        const newSubmission = {
          id: Date.now(),
          text: text,
          settings: currentSettings,
          generations: [{
            id: newGenerationId,
            suggestions: ['', '', ''],
            isGenerating: true,
            timestamp: new Date()
          }],
          timestamp: new Date()
        };
        
        const updatedSubmissions = [newSubmission, ...existingSubmissions];
        
        const updatedEntry = {
          ...entryToUpdate,
          id: entryId,
          text: text, // Keep for backward compatibility
          submissions: updatedSubmissions,
          // Keep old format for backward compatibility
          suggestions: newSubmission.generations[0].suggestions,
          isGenerating: true,
          settings: currentSettings,
        };
        
        await savePostEntry(updatedEntry);
        
        // Reload from database to ensure we have the latest data
        const reloadedEntries = await getAllPostEntries();
        const reloadedEntry = reloadedEntries.find(e => e.id === entryId);
        
        if (entryId === currentEntryId && reloadedEntry) {
          setCurrentEntry(reloadedEntry);
        }
        
        // Notify parent to refresh entries list
        if (onEntrySaved) {
          onEntrySaved();
        }
      } else {
        // Add a new generation to the existing submission (Rule 3: Regenerate with same settings)
        const updatedSubmissions = existingSubmissions.map((submission, index) => {
          if (index === 0) {
            // Add new generation to the first (most recent) submission
            return {
              ...submission,
              generations: [{
                id: newGenerationId,
                suggestions: ['', '', ''],
                isGenerating: true,
                timestamp: new Date()
              }, ...submission.generations]
            };
          }
          return submission;
        });
        
        const updatedEntry = {
          ...entryToUpdate,
          id: entryId,
          submissions: updatedSubmissions,
          // Keep old format for backward compatibility
          suggestions: updatedSubmissions[0].generations[0].suggestions,
          isGenerating: true,
          settings: currentSettings,
        };
        
        await savePostEntry(updatedEntry);
        
        // Reload from database to ensure we have the latest data
        const reloadedEntries = await getAllPostEntries();
        const reloadedEntry = reloadedEntries.find(e => e.id === entryId);
        
        if (entryId === currentEntryId && reloadedEntry) {
          setCurrentEntry(reloadedEntry);
        }
        
        // Notify parent to refresh entries list
        if (onEntrySaved) {
          onEntrySaved();
        }
      }

      if (apiMode === 'writer') {
        // Use Writer API - generates more varied content
        const emoticonInstruction = useEmoticons
          ? 'Emoticons are allowed.'
          : 'No emoticons or emojis.';
        
        // Build style instruction
        const styleInstructions = {
          default: '',
          humorous: 'Write in a humorous and funny way that makes people laugh.',
          witty: 'Write in a witty and clever way with smart wordplay.',
          sarcastic: 'Rewrite in a sarcastic and ironic tone.',
          inspirational: 'Write in an inspirational way that uplifts and motivates.',
          motivational: 'Write in a motivational way that encourages action.',
          dramatic: 'Write in a dramatic and intense way.',
          mysterious: 'Write in a mysterious and intriguing way.',
          scary: 'Write in a scary and suspenseful way.',
          angry: 'Write in an angry and passionate way.',
          excited: 'Write in an excited and enthusiastic way.',
          calm: 'Write in a calm and peaceful way.',
          professional: 'Write in a professional and polished way.',
          friendly: 'Write in a friendly and approachable way.',
          persuasive: 'Write in a persuasive way that convinces readers.',
          storytelling: 'Write in a storytelling narrative style.',
          educational: 'Write in an educational and informative way.',
          controversial: 'Write in a controversial way that sparks debate.',
          clickbait: 'Write in a clickbait style that creates curiosity.',
        };
        
        const styleInstruction = style === 'custom' && customStyle.trim()
          ? customStyle.trim()
          : (styleInstructions[style] || '');
        
        const sharedContext = `${emoticonInstruction} You will rewrite what the user provides for social media. ${styleInstruction}`;
        
        // Wrap the user's text to make it clear it's content to rewrite, not a question to answer
        const prompts = [
          `Rewrite this text: "${text}"`,
          `Rephrase this: "${text}"`,
          `Make this more engaging: "${text}"`
        ];

        console.log('=== Writer API ===');
        console.log('Shared Context:', sharedContext);
        console.log('User Text:', text);
        console.log('Settings:', { tone: writerTone, length: writerLength, format: writerFormat });
        console.log('Local state:', { tone, length, format });

        // Ensure Writer hook state is synced before generating
        if (format !== writerFormat) {
          setWriterFormat(format);
        }
        if (length !== writerLength) {
          setWriterLength(length);
        }
        // Wait a tick for state to sync
        await new Promise(resolve => setTimeout(resolve, 50));

        // Start all 3 generations in parallel
        // Note: Chrome AI API queues these internally, so they complete sequentially
        const results = await Promise.all(
          prompts.map(async (prompt, index) => {
            try {
              return await generateText(prompt, sharedContext, !useEmoticons, stream ? (streamedText) => {
              // Update the current generation during streaming (in submissions structure)
              if (entryId === currentEntryId) {
                setCurrentEntry(prev => {
                  if (prev && prev.id === entryId) {
                    const submissions = Array.isArray(prev.submissions) ? prev.submissions : [];
                    const updatedSubmissions = submissions.map((submission, subIndex) => {
                      if (subIndex === 0) {
                        // Update the first (most recent) submission
                        const generations = Array.isArray(submission.generations) ? submission.generations : [];
                        const updatedGenerations = generations.map(gen => {
                          if (gen.id === newGenerationId) {
                            const currentSuggestions = Array.isArray(gen.suggestions) ? gen.suggestions : ['', '', ''];
                            return {
                              ...gen,
                              suggestions: currentSuggestions.map((s, i) => 
                                i === index ? streamedText.trim() : s
                              ),
                            };
                          }
                          return gen;
                        });
                        return {
                          ...submission,
                          generations: updatedGenerations
                        };
                      }
                      return submission;
                    });
                    return {
                      ...prev,
                      submissions: updatedSubmissions,
                      suggestions: updatedSubmissions[0]?.generations[0]?.suggestions || ['', '', '']
                    };
                  }
                  return prev;
                });
              }
              
              // Also save to database
              getAllPostEntries().then(entries => {
                const entry = entries.find(e => e.id === entryId);
                if (entry) {
                  const submissions = Array.isArray(entry.submissions) ? entry.submissions : [];
                  const updatedSubmissions = submissions.map((submission, subIndex) => {
                    if (subIndex === 0) {
                      const generations = Array.isArray(submission.generations) ? submission.generations : [];
                      const updatedGenerations = generations.map(gen => {
                        if (gen.id === newGenerationId) {
                          const currentSuggestions = Array.isArray(gen.suggestions) ? gen.suggestions : ['', '', ''];
                          return {
                            ...gen,
                            suggestions: currentSuggestions.map((s, i) => 
                              i === index ? streamedText.trim() : s
                            ),
                          };
                        }
                        return gen;
                      });
                      return {
                        ...submission,
                        generations: updatedGenerations
                      };
                    }
                    return submission;
                  });
                  const updatedEntry = {
                    ...entry,
                    submissions: updatedSubmissions,
                    suggestions: updatedSubmissions[0]?.generations[0]?.suggestions || ['', '', '']
                  };
                  savePostEntry(updatedEntry);
                }
              });
            } : null);
            } catch (error) {
              console.error(`Error generating suggestion ${index + 1}:`, error);
              return '';
            }
          })
        );

        console.log('Writer API results:', results);

        // Update entry with results - update the current generation in submissions structure
        const updateEntryWithResults = async () => {
          const allEntries = await getAllPostEntries();
          const entry = allEntries.find(e => e.id === entryId);
          if (entry) {
            const newSuggestions = results.map(r => (r || '').trim());
            const submissions = Array.isArray(entry.submissions) ? entry.submissions : [];
            const updatedSubmissions = submissions.map((submission, subIndex) => {
              if (subIndex === 0) {
                // Update the first (most recent) submission
                const generations = Array.isArray(submission.generations) ? submission.generations : [];
                const updatedGenerations = generations.map(gen => {
                  if (gen.id === newGenerationId) {
                    return {
                      ...gen,
                      suggestions: newSuggestions,
                      isGenerating: false
                    };
                  }
                  return gen;
                });
                return {
                  ...submission,
                  generations: updatedGenerations
                };
              }
              return submission;
            });
            
            const updatedEntry = {
              ...entry,
              text: text, // Keep for backward compatibility
              submissions: updatedSubmissions,
              suggestions: updatedSubmissions[0]?.generations[0]?.suggestions || newSuggestions,
              isGenerating: false
            };
            await savePostEntry(updatedEntry);
            
            // Only update currentEntry if this is the current entry
            if (entryId === currentEntryId) {
              setCurrentEntry(updatedEntry);
            }
            
            // Reload entries list
            if (onEntrySaved) {
              onEntrySaved();
            }
          }
        };

        // If streaming is off, update with final results
        if (!stream) {
          await updateEntryWithResults();
        } else {
          // For streaming, ensure we update with final results after streaming completes
          await updateEntryWithResults();
        }
      } else {
        // Use Rewriter API
        const emoticonInstruction = useEmoticons
          ? 'You should include relevant emojis to make it engaging.'
          : 'You must NOT include any emojis, emoticons, or unicode symbols. Use only plain text.';
        
        // Build style instruction for Rewriter
        const styleInstructions = {
          default: '',
          humorous: 'Make it humorous and funny.',
          witty: 'Make it witty and clever.',
          sarcastic: 'Make it sarcastic and ironic.',
          inspirational: 'Make it inspirational and uplifting.',
          motivational: 'Make it motivational and encouraging.',
          dramatic: 'Make it dramatic and intense.',
          mysterious: 'Make it mysterious and intriguing.',
          scary: 'Make it scary and suspenseful.',
          angry: 'Make it angry and passionate.',
          excited: 'Make it excited and enthusiastic.',
          calm: 'Make it calm and peaceful.',
          professional: 'Make it professional and polished.',
          friendly: 'Make it friendly and approachable.',
          persuasive: 'Make it persuasive and convincing.',
          storytelling: 'Make it narrative and story-like.',
          educational: 'Make it educational and informative.',
          controversial: 'Make it controversial and debate-sparking.',
          clickbait: 'Make it clickbait-style and curiosity-inducing.',
        };
        
        const styleInstruction = style === 'custom' && customStyle.trim()
          ? customStyle.trim()
          : (styleInstructions[style] || '');
        
        const sharedContext = `This is for a social media post. You will rewrite what the user provides for social media. ${styleInstruction} ${emoticonInstruction}`;

        console.log('=== Rewriter API ===');
        console.log('Shared Context:', sharedContext);
        console.log('User Text:', text);
        console.log('Settings:', { tone, format, length });

        // Note: Chrome AI API queues these internally, so they complete sequentially
        const results = await Promise.all(
          [0, 1, 2].map((index) => {
            console.log(`Starting Rewriter generation ${index + 1}`);
            return rewriteText(text, tone, format, length, sharedContext, !useEmoticons, stream ? (streamedText) => {
              // Update the current generation during streaming (in submissions structure)
              if (entryId === currentEntryId) {
                setCurrentEntry(prev => {
                  if (prev && prev.id === entryId) {
                    const submissions = Array.isArray(prev.submissions) ? prev.submissions : [];
                    const updatedSubmissions = submissions.map((submission, subIndex) => {
                      if (subIndex === 0) {
                        // Update the first (most recent) submission
                        const generations = Array.isArray(submission.generations) ? submission.generations : [];
                        const updatedGenerations = generations.map(gen => {
                          if (gen.id === newGenerationId) {
                            const currentSuggestions = Array.isArray(gen.suggestions) ? gen.suggestions : ['', '', ''];
                            return {
                              ...gen,
                              suggestions: currentSuggestions.map((s, i) => 
                                i === index ? streamedText.trim() : s
                              ),
                            };
                          }
                          return gen;
                        });
                        return {
                          ...submission,
                          generations: updatedGenerations
                        };
                      }
                      return submission;
                    });
                    return {
                      ...prev,
                      submissions: updatedSubmissions,
                      suggestions: updatedSubmissions[0]?.generations[0]?.suggestions || ['', '', '']
                    };
                  }
                  return prev;
                });
              }
              
              // Also save to database
              getAllPostEntries().then(entries => {
                const entry = entries.find(e => e.id === entryId);
                if (entry) {
                  const submissions = Array.isArray(entry.submissions) ? entry.submissions : [];
                  const updatedSubmissions = submissions.map((submission, subIndex) => {
                    if (subIndex === 0) {
                      const generations = Array.isArray(submission.generations) ? submission.generations : [];
                      const updatedGenerations = generations.map(gen => {
                        if (gen.id === newGenerationId) {
                          const currentSuggestions = Array.isArray(gen.suggestions) ? gen.suggestions : ['', '', ''];
                          return {
                            ...gen,
                            suggestions: currentSuggestions.map((s, i) => 
                              i === index ? streamedText.trim() : s
                            ),
                          };
                        }
                        return gen;
                      });
                      return {
                        ...submission,
                        generations: updatedGenerations
                      };
                    }
                    return submission;
                  });
                  const updatedEntry = {
                    ...entry,
                    submissions: updatedSubmissions,
                    suggestions: updatedSubmissions[0]?.generations[0]?.suggestions || ['', '', '']
                  };
                  savePostEntry(updatedEntry);
                }
              });
            } : null);
          })
        );

        console.log('Rewriter results:', results);

        // Update entry with results - update the current generation in submissions structure
        const updateEntryWithResults = async () => {
          const allEntries = await getAllPostEntries();
          const entry = allEntries.find(e => e.id === entryId);
          if (entry) {
            const newSuggestions = results.map(r => (r || '').trim());
            const submissions = Array.isArray(entry.submissions) ? entry.submissions : [];
            const updatedSubmissions = submissions.map((submission, subIndex) => {
              if (subIndex === 0) {
                // Update the first (most recent) submission
                const generations = Array.isArray(submission.generations) ? submission.generations : [];
                const updatedGenerations = generations.map(gen => {
                  if (gen.id === newGenerationId) {
                    return {
                      ...gen,
                      suggestions: newSuggestions,
                      isGenerating: false
                    };
                  }
                  return gen;
                });
                return {
                  ...submission,
                  generations: updatedGenerations
                };
              }
              return submission;
            });
            
            const updatedEntry = {
              ...entry,
              text: text, // Keep for backward compatibility
              submissions: updatedSubmissions,
              suggestions: updatedSubmissions[0]?.generations[0]?.suggestions || newSuggestions,
              isGenerating: false
            };
            await savePostEntry(updatedEntry);
            
            // Only update currentEntry if this is the current entry
            if (entryId === currentEntryId) {
              setCurrentEntry(updatedEntry);
            }
            
            // Reload entries list
            if (onEntrySaved) {
              onEntrySaved();
            }
          }
        };

        // If streaming is off, update with final results
        if (!stream) {
          await updateEntryWithResults();
        } else {
          // For streaming, ensure we update with final results after streaming completes
          await updateEntryWithResults();
        }
      }

      // Mark generation as complete in submissions structure
      const finalEntries = await getAllPostEntries();
      const entry = finalEntries.find(e => e.id === entryId);
      if (entry) {
        const submissions = Array.isArray(entry.submissions) ? entry.submissions : [];
        const updatedSubmissions = submissions.map((submission, subIndex) => {
          if (subIndex === 0) {
            // Update the first (most recent) submission
            const generations = Array.isArray(submission.generations) ? submission.generations : [];
            const updatedGenerations = generations.map(gen => {
              if (gen.id === newGenerationId) {
                return { ...gen, isGenerating: false };
              }
              return gen;
            });
            return {
              ...submission,
              generations: updatedGenerations
            };
          }
          return submission;
        });
        
        const updatedEntry = {
          ...entry,
          submissions: updatedSubmissions,
          isGenerating: updatedSubmissions[0]?.generations.some(gen => gen.isGenerating) || false
        };
        await savePostEntry(updatedEntry);
        
        // Only update currentEntry if this is the current entry
        if (entryId === currentEntryId) {
          setCurrentEntry(updatedEntry);
        }
        
        // Reload entries list
        if (onEntrySaved) {
          onEntrySaved();
        }
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      // Mark as not generating on error
      setCurrentEntry(prev => {
        if (prev && prev.id === entryId) {
          return { ...prev, isGenerating: false };
        }
        return prev;
      });
    }
  };

  const handleCopy = (text, entryId, index) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${entryId}-${index}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = async () => {
    if (isGenerating || !currentEntry) return;

    // Rule 3: Regenerate with same settings - adds new generation to existing submission
    // Rule 4: Regenerate with new settings - creates new submission within same post
    let forceNewSubmission = false;
    
    if (useCurrentSettings) {
      // If "Use current settings" is checked, compare current settings with last submission's settings
      const allEntries = await getAllPostEntries();
      const entry = allEntries.find(e => e.id === currentEntryId);
      if (entry) {
        const existingSubmissions = Array.isArray(entry.submissions) ? entry.submissions : [];
        const lastSubmission = existingSubmissions[0];
        
        if (lastSubmission) {
          const currentSettings = {
            apiMode,
            tone,
            writerTone,
            format,
            length,
            style,
            customStyle,
            useEmoticons,
            stream,
          };
          
          // Normalize settings for comparison (exclude writerTone since it's derived from tone)
          const normalizeSettings = (settings) => {
            const normalized = { ...settings };
            delete normalized.writerTone;
            return normalized;
          };
          
          // Check if any settings have changed from last submission
          const settingsChanged = 
            JSON.stringify(normalizeSettings(lastSubmission.settings)) !== 
            JSON.stringify(normalizeSettings(currentSettings));
          
          if (settingsChanged) {
            // Rule 4: Settings changed - create new submission within same post
            forceNewSubmission = true;
          }
          // If settings haven't changed, just add a new generation (forceNewSubmission stays false)
        }
      }
    } else {
      // If "Use current settings" is unchecked, restore original settings from last submission
      const allEntries = await getAllPostEntries();
      const entry = allEntries.find(e => e.id === currentEntryId);
      if (entry) {
        const existingSubmissions = Array.isArray(entry.submissions) ? entry.submissions : [];
        const lastSubmission = existingSubmissions[0];
        
        if (lastSubmission && lastSubmission.settings) {
          const savedSettings = lastSubmission.settings;
          setApiMode(savedSettings.apiMode);
          setTone(savedSettings.tone);
          if (savedSettings.format) setFormat(savedSettings.format);
          setLength(savedSettings.length);
          if (savedSettings.style) setStyle(savedSettings.style);
          if (savedSettings.customStyle !== undefined) setCustomStyle(savedSettings.customStyle);
          setUseEmoticons(savedSettings.useEmoticons);
          setStream(savedSettings.stream);
          
          // Wait a tick for state to update
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      // Just add a new generation (forceNewSubmission stays false)
    }

    // Always regenerate within the same post (never create new sidebar entry)
    // Rule 2: New sidebar entry only happens when user clicks "New" button
    // Get text from last submission, or fall back to currentEntry.text or inputText
    const allEntries = await getAllPostEntries();
    const entry = allEntries.find(e => e.id === currentEntryId);
    let textToRegenerate = currentEntry.text || inputText.trim();
    
    if (entry) {
      const existingSubmissions = Array.isArray(entry.submissions) ? entry.submissions : [];
      const lastSubmission = existingSubmissions[0];
      if (lastSubmission && lastSubmission.text) {
        textToRegenerate = lastSubmission.text;
      }
    }
    
    generateSuggestions(textToRegenerate, currentEntryId, forceNewSubmission);
  };

  if (!aiAvailable) {
    return (
      <div className="post-helper">
        <div className="post-helper-unavailable">
          <Sparkles size={48} color="#e5e5e5" />
          <h2>Chrome AI Not Available</h2>
          <p>This feature requires Chrome's built-in AI ({apiMode === 'writer' ? 'Writer' : 'Rewriter'} API).</p>
          <p>Please use Chrome Canary or Dev with AI features enabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-helper">
      <div className="editor-container">
        <div className="editor-wrapper">
          <div className="post-helper-content">

        <div className="current-input-row">
          <div className="current-input">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.shiftKey || e.metaKey) && inputText.trim()) {
                  e.preventDefault();
                  const trimmedText = inputText.trim();
                  if (trimmedText) {
                    // Rule 1: Cmd+Enter/Shift+Enter always creates a new submission within the same post
                    // Don't create a new sidebar entry - only "New Post" button does that
                    generateSuggestions(trimmedText, currentEntryId, true);
                    setLastGeneratedText(trimmedText);
                  }
                }
              }}
              placeholder="Type your text here. Press Shift+Enter or Cmd+Enter to generate suggestions..."
              rows={4}
              disabled={isGenerating}
            />
            <div className="input-meta">
              <div className="input-counts">
                <span className="char-count">
                  {inputText.length} chars
                </span>
                <span className="word-count">
                  {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
                </span>
              </div>
              <div className="post-hint">
                {inputText.trim() && (
                  <span>Press Shift+Enter or Cmd+Enter to generate suggestions</span>
                )}
              </div>
            </div>
          </div>
            <div className="current-suggestions-placeholder">
            {!currentEntry && (
              <div className="post-empty">
                <Sparkles size={32} color="#e5e5e5" />
                <p>Suggestions will appear here</p>
              </div>
            )}
          </div>
        </div>

        {currentEntry && (() => {
          // Get all submissions (most recent first)
          const submissions = Array.isArray(currentEntry.submissions) ? currentEntry.submissions : [];
          
          // Convert old format to new format for display
          let displaySubmissions = [...submissions];
          if (displaySubmissions.length === 0) {
            // Fallback to old format if no submissions
            if (currentEntry.text && (
              (Array.isArray(currentEntry.generations) && currentEntry.generations.length > 0) ||
              (currentEntry.suggestions && currentEntry.suggestions.some(s => s && s.trim()))
            )) {
              displaySubmissions = [{
                id: 'legacy',
                text: currentEntry.text,
                settings: currentEntry.settings || {},
                generations: Array.isArray(currentEntry.generations) && currentEntry.generations.length > 0
                  ? currentEntry.generations
                  : (currentEntry.suggestions ? [{
                      id: 'legacy-gen',
                      suggestions: currentEntry.suggestions,
                      isGenerating: currentEntry.isGenerating,
                      timestamp: currentEntry.updatedAt || new Date()
                    }] : []),
                timestamp: currentEntry.updatedAt || new Date()
              }];
            }
          }
          
          const hasContent = currentEntry.isGenerating || 
            displaySubmissions.length > 0 ||
            (currentEntry.text?.trim());
          
          // Get the most recent submission for regenerate controls
          const lastSubmission = displaySubmissions[0];
          const displaySettings = lastSubmission?.settings || currentEntry.settings;
          
          return hasContent && (
            <div className="post-history">
              {/* Display each submission separately */}
              {displaySubmissions.map((submission, submissionIndex) => {
                const generations = Array.isArray(submission.generations) ? submission.generations : [];
                const hasGenerations = generations.some(gen => 
                  gen.suggestions?.some(s => s && s.trim()) || gen.isGenerating
                );
                
                return (
                  <div key={submission.id || submissionIndex}>
                    {submissionIndex > 0 && (
                      <div className="submission-divider">
                        <div className="submission-divider-line"></div>
                        <span className="submission-divider-label">Previous Submission</span>
                        <div className="submission-divider-line"></div>
                      </div>
                    )}
                    <div className="history-row">
                    <div className="history-text-item">
                      {submission.text?.trim() && (
                        <>
                          <p>{submission.text}</p>
                          <div className="history-text-meta">
                            <span className="char-count">
                              {submission.text.length} chars
                            </span>
                            <span className="word-count">
                              {submission.text.trim().split(/\s+/).length} words
                            </span>
                          </div>
                        </>
                      )}
                      {submission.settings && (
                        <div className="entry-settings">
                          <span className="setting-badge">{submission.settings.apiMode === 'writer' ? 'Writer' : 'Rewriter'}</span>
                          <span className="setting-badge">{submission.settings.tone}</span>
                          {submission.settings.apiMode === 'writer' && (
                            <span className="setting-badge">{submission.settings.length}</span>
                          )}
                          <span className="setting-badge">{submission.settings.useEmoticons ? 'With Emojis' : 'No Emojis'}</span>
                        </div>
                      )}
                      {/* Only show regenerate controls on the most recent submission */}
                      {submissionIndex === 0 && (
                        <div className="regenerate-controls">
                          <button
                            onClick={handleRegenerate}
                            className="regenerate-btn"
                            disabled={isGenerating}
                          >
                            <RefreshCw size={14} />
                            Regenerate
                          </button>
                          <label className="use-current-checkbox">
                            <input
                              type="checkbox"
                              checked={useCurrentSettings}
                              onChange={(e) => setUseCurrentSettings(e.target.checked)}
                              disabled={isGenerating}
                            />
                            <span className="checkbox-label-text">
                              Use current settings
                              <span className="tooltip-wrapper">
                                <HelpCircle size={12} className="help-icon" />
                                <span className="tooltip-text">When checked, regenerate uses current sidebar settings instead of original settings</span>
                              </span>
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="history-suggestions-item">
                      {/* Display all generations for this submission */}
                      {hasGenerations && generations.map((generation, genIndex) => (
                        <div key={generation.id || genIndex} className="generation-group">
                          {genIndex > 0 && <div className="generation-divider"></div>}
                          <div className="suggestions-grid">
                            {[0, 1, 2].map((index) => (
                              <div key={index} className="suggestion-card">
                                {generation.suggestions && generation.suggestions[index] ? (
                                  <>
                                    <p>{generation.suggestions[index]}</p>
                                    <div className="suggestion-meta">
                                      <span className="char-count">
                                        {generation.suggestions[index].length} chars
                                      </span>
                                      <span className="word-count">
                                        {generation.suggestions[index].trim().split(/\s+/).length} words
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleCopy(generation.suggestions[index], currentEntry.id, `${generation.id}-${index}`)}
                                      className="copy-btn"
                                      aria-label="Copy suggestion"
                                    >
                                      {copiedId === `${currentEntry.id}-${generation.id}-${index}` ? (
                                        <Check size={16} color="#10b981" />
                                      ) : (
                                        <Copy size={16} />
                                      )}
                                    </button>
                                  </>
                                ) : generation.isGenerating ? (
                                  <div className="suggestion-skeleton">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        </div>
      </div>
      </div>
    </div>
  );
};
