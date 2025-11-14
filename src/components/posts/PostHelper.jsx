import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, RefreshCw, HelpCircle } from 'lucide-react';
import { useRewriter } from '../../hooks/useRewriter';
import { useWriter } from '../../hooks/useWriter';
import './PostHelper.css';

export const PostHelper = ({ onNewPost, onSettingsExport }) => {
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState([]); // Array of { id, text, suggestions: ['', '', ''], isGenerating }
  const [copiedId, setCopiedId] = useState(null);
  const [lastGeneratedText, setLastGeneratedText] = useState('');

  // Handle new post from sidebar
  useEffect(() => {
    if (onNewPost) {
      window.handleNewPost = () => {
        setInputText('');
        setHistory([]);
        setLastGeneratedText('');
      };
    }
    return () => {
      if (window.handleNewPost) {
        delete window.handleNewPost;
      }
    };
  }, [onNewPost]);
  const [tone, setTone] = useState(() => {
    try {
      const stored = localStorage.getItem('postHelperTone');
      // Migrate old values to new format
      if (stored === 'casual') return 'more-casual';
      if (stored === 'formal') return 'more-formal';
      if (stored === 'neutral') return 'as-is';
      return stored || 'more-casual';
    } catch {
      return 'more-casual';
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

  const {
    writerAvailable,
    tone: writerTone,
    setTone: setWriterTone,
    format,
    setFormat,
    length,
    setLength,
    generateText,
  } = useWriter('postHelper');

  const aiAvailable = apiMode === 'writer' ? writerAvailable : rewriterAvailable;
  
  // Track if any generation is in progress
  const isGenerating = history.length > 0 && history[0].isGenerating;

  // Convert length values when switching between APIs
  useEffect(() => {
    if (apiMode === 'writer') {
      // Convert Rewriter lengths to Writer lengths
      if (length === 'shorter') setLength('short');
      else if (length === 'longer') setLength('long');
      else if (length === 'as-is') setLength('medium');
      else if (!['short', 'medium', 'long'].includes(length)) {
        setLength('short');
      }
    } else {
      // Convert Writer lengths to Rewriter lengths
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

  // Generate suggestions when user completes a sentence and stops typing
  useEffect(() => {
    const trimmedText = inputText.trim();
    
    // Don't do anything if text doesn't end with punctuation
    if (!trimmedText || !/[.!?]$/.test(trimmedText)) {
      return;
    }

    // Don't regenerate if the text hasn't actually changed
    if (trimmedText === lastGeneratedText) {
      return;
    }

    // Debounce: wait for user to stop typing for 2 seconds
    const timeoutId = setTimeout(() => {
      generateSuggestions(trimmedText);
      setLastGeneratedText(trimmedText);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [inputText, lastGeneratedText]);

  const generateSuggestions = async (text, regenerateEntryId = null) => {
    if (!aiAvailable) return;

    try {
      // Create new history entry with skeleton or update existing one
      const entryId = regenerateEntryId || Date.now();
      const newEntry = {
        id: entryId,
        text: text,
        suggestions: ['', '', ''],
        isGenerating: true,
        settings: {
          apiMode,
          tone,
          writerTone,
          format,
          length,
          style,
          customStyle,
          useEmoticons,
          stream,
        },
      };

      if (regenerateEntryId) {
        // Update existing entry
        setHistory(prev => 
          prev.map(entry => 
            entry.id === regenerateEntryId ? newEntry : entry
          )
        );
      } else {
        // Add to history at the top
        setHistory(prev => [newEntry, ...prev]);
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
        
        const sharedContext = `${emoticonInstruction} This is a social post. ${styleInstruction}`;
        
        // Wrap the user's text to make it clear it's content to rewrite, not a question to answer
        const prompts = [
          `Rewrite this text: "${text}"`,
          `Rephrase this: "${text}"`,
          `Make this more engaging: "${text}"`
        ];

        console.log('=== Writer API ===');
        console.log('Shared Context:', sharedContext);
        console.log('User Text:', text);
        console.log('Settings:', { tone: writerTone, length, format });

        // Start all 3 generations in parallel
        // Note: Chrome AI API queues these internally, so they complete sequentially
        const results = await Promise.all(
          prompts.map((prompt, index) => 
            generateText(prompt, sharedContext, !useEmoticons, stream ? (streamedText) => {
              setHistory(prev => 
                prev.map(entry => 
                  entry.id === entryId
                    ? {
                        ...entry,
                        suggestions: entry.suggestions.map((s, i) => 
                          i === index ? streamedText.trim() : s
                        ),
                      }
                    : entry
                )
              );
            } : null)
          )
        );

        // If streaming is off, update with final results
        if (!stream) {
          setHistory(prev => 
            prev.map(entry => 
              entry.id === entryId
                ? {
                    ...entry,
                    suggestions: results.map(r => r.trim()),
                  }
                : entry
            )
          );
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
              setHistory(prev => 
                prev.map(entry => 
                  entry.id === entryId
                    ? {
                        ...entry,
                        suggestions: entry.suggestions.map((s, i) => 
                          i === index ? streamedText.trim() : s
                        ),
                      }
                    : entry
                )
              );
            } : null);
          })
        );

        console.log('Rewriter results:', results);

        // If streaming is off, update with final results
        if (!stream) {
          setHistory(prev => 
            prev.map(entry => 
              entry.id === entryId
                ? {
                    ...entry,
                    suggestions: results.map(r => r.trim()),
                  }
                : entry
            )
          );
        }
      }

      // Mark as complete
      setHistory(prev => 
        prev.map(entry => 
          entry.id === entryId ? { ...entry, isGenerating: false } : entry
        )
      );
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const handleCopy = (text, entryId, index) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${entryId}-${index}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = async (entry) => {
    if (isGenerating) return;

    // Only restore settings if useCurrentSettings is false
    if (!useCurrentSettings) {
      const savedSettings = entry.settings;
      if (savedSettings) {
        setApiMode(savedSettings.apiMode);
        setTone(savedSettings.tone);
        if (savedSettings.format) setFormat(savedSettings.format);
        setLength(savedSettings.length);
        if (savedSettings.style) setStyle(savedSettings.style);
        if (savedSettings.customStyle) setCustomStyle(savedSettings.customStyle);
        setUseEmoticons(savedSettings.useEmoticons);
        setStream(savedSettings.stream);
        
        // Wait a tick for state to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    // If useCurrentSettings is true, just use whatever is currently in the sidebar

    // Regenerate with the same text and entry ID
    generateSuggestions(entry.text, entry.id);
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
    <div className="editor-container">
      <div className="editor-wrapper">
        <div className="post-helper-content">

        <div className="current-input-row">
          <div className="current-input">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && inputText.trim()) {
                  e.preventDefault();
                  const trimmedText = inputText.trim();
                  if (trimmedText && trimmedText !== lastGeneratedText) {
                    generateSuggestions(trimmedText);
                    setLastGeneratedText(trimmedText);
                  }
                }
              }}
              placeholder="Type your sentence here. Press Enter or end with . ! ? to get suggestions..."
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
                {inputText.trim() && !/[.!?]$/.test(inputText.trim()) && (
                  <span>Press Enter or end with punctuation to get suggestions</span>
                )}
              </div>
            </div>
          </div>
          <div className="current-suggestions-placeholder">
            {history.length === 0 && (
              <div className="post-empty">
                <Sparkles size={32} color="#e5e5e5" />
                <p>Suggestions will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="post-history">
          {history.map((entry) => (
            <div key={entry.id} className="history-row">
              <div className="history-text-item">
                <p>{entry.text}</p>
                <div className="history-text-meta">
                  <span className="char-count">
                    {entry.text.length} chars
                  </span>
                  <span className="word-count">
                    {entry.text.trim().split(/\s+/).length} words
                  </span>
                </div>
                {entry.settings && (
                  <div className="entry-settings">
                    <span className="setting-badge">{entry.settings.apiMode === 'writer' ? 'Writer' : 'Rewriter'}</span>
                    <span className="setting-badge">{entry.settings.tone}</span>
                    {entry.settings.apiMode === 'writer' && (
                      <span className="setting-badge">{entry.settings.length}</span>
                    )}
                    <span className="setting-badge">{entry.settings.useEmoticons ? 'With Emojis' : 'No Emojis'}</span>
                  </div>
                )}
                <div className="regenerate-controls">
                  <button
                    onClick={() => handleRegenerate(entry)}
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
              </div>
              <div className="history-suggestions-item">
                <div className="suggestions-grid">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="suggestion-card">
                      {entry.suggestions[index] ? (
                        <>
                          <p>{entry.suggestions[index]}</p>
                          <div className="suggestion-meta">
                            <span className="char-count">
                              {entry.suggestions[index].length} chars
                            </span>
                            <span className="word-count">
                              {entry.suggestions[index].trim().split(/\s+/).length} words
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(entry.suggestions[index], entry.id, index)}
                            className="copy-btn"
                            aria-label="Copy suggestion"
                          >
                            {copiedId === `${entry.id}-${index}` ? (
                              <Check size={16} color="#10b981" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="suggestion-skeleton">
                          <div className="skeleton-line"></div>
                          <div className="skeleton-line short"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};
