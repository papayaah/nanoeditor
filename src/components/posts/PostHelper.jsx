import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, ArrowLeft, HelpCircle, RefreshCw } from 'lucide-react';
import { useRewriter } from '../../hooks/useRewriter';
import { useWriter } from '../../hooks/useWriter';
import './PostHelper.css';

export const PostHelper = ({ onNavigate }) => {
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState([]); // Array of { id, text, suggestions: ['', '', ''], isGenerating }
  const [copiedId, setCopiedId] = useState(null);
  const [lastGeneratedText, setLastGeneratedText] = useState('');
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

  // Initialize Writer API length on first load
  useEffect(() => {
    if (apiMode === 'writer' && !['short', 'medium', 'long'].includes(length)) {
      setLength('short');
    }
  }, [apiMode, length, setLength]);

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
        console.log('Settings:', { tone, format: 'as-is', length: 'as-is' });

        // Note: Chrome AI API queues these internally, so they complete sequentially
        const results = await Promise.all(
          [0, 1, 2].map((index) => {
            console.log(`Starting Rewriter generation ${index + 1}`);
            return rewriteText(text, tone, sharedContext, !useEmoticons, stream ? (streamedText) => {
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

    // Restore settings from this entry
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
    <div className="post-helper">
      {onNavigate && (
        <button 
          onClick={() => onNavigate('/')} 
          className="back-btn"
          aria-label="Back to editor"
          title="Back to Document Editor"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="post-helper-header">
        <div className="post-helper-title">
          <Sparkles size={24} color="#a78bfa" />
          <h1>Social Media Post Helper</h1>
        </div>
        <p>Write your sentence and get AI-powered suggestions for social media</p>
      </div>

      <div className="post-helper-settings">
        <div className="settings-row">
          <div className="setting-group">
            <label htmlFor="post-api-mode">
              API Mode
              <span className="tooltip-icon" title="Writer API generates more varied and creative suggestions. Rewriter API produces more consistent rewrites.">
                <HelpCircle size={14} />
              </span>
            </label>
            <select 
              id="post-api-mode"
              value={apiMode} 
              onChange={(e) => setApiMode(e.target.value)}
              disabled={isGenerating}
            >
              <option value="writer">Writer (More Varied)</option>
              <option value="rewriter">Rewriter (Consistent)</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="post-tone">Tone</label>
            <select 
              id="post-tone"
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
              disabled={isGenerating}
            >
              <option value="more-casual">Casual</option>
              <option value="as-is">Neutral</option>
              <option value="more-formal">Formal</option>
            </select>
          </div>

          {apiMode === 'writer' && (
            <>
              <div className="setting-group">
                <label htmlFor="post-format">Format</label>
                <select 
                  id="post-format"
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="plain-text">Plain Text</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>

              <div className="setting-group">
                <label htmlFor="post-length">Length</label>
                <select 
                  id="post-length"
                  value={length} 
                  onChange={(e) => setLength(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </>
          )}

          <div className="setting-group">
            <label htmlFor="post-style">Style</label>
            <select 
              id="post-style"
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
              disabled={isGenerating}
            >
              <option value="default">Default</option>
              <option value="humorous">Humorous</option>
              <option value="witty">Witty</option>
              <option value="sarcastic">Sarcastic</option>
              <option value="inspirational">Inspirational</option>
              <option value="motivational">Motivational</option>
              <option value="dramatic">Dramatic</option>
              <option value="mysterious">Mysterious</option>
              <option value="scary">Scary</option>
              <option value="angry">Angry</option>
              <option value="excited">Excited</option>
              <option value="calm">Calm</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="persuasive">Persuasive</option>
              <option value="storytelling">Storytelling</option>
              <option value="educational">Educational</option>
              <option value="controversial">Controversial</option>
              <option value="clickbait">Clickbait</option>
              <option value="custom">Custom...</option>
            </select>
          </div>

          {style === 'custom' && (
            <div className="setting-group custom-style-input">
              <label htmlFor="post-custom-style">Custom Style</label>
              <input
                id="post-custom-style"
                type="text"
                placeholder="e.g., Make it poetic and romantic"
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          )}

          <div className="setting-group">
            <label htmlFor="post-emoticons">Emoticons</label>
            <select 
              id="post-emoticons"
              value={useEmoticons ? 'yes' : 'no'} 
              onChange={(e) => setUseEmoticons(e.target.value === 'yes')}
              disabled={isGenerating}
            >
              <option value="no">No Emojis</option>
              <option value="yes">With Emojis</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="post-stream">
              Stream
              <span className="tooltip-icon" title="Enable real-time streaming of AI responses. When on, you see text appear as it's generated. When off, you see complete results only.">
                <HelpCircle size={14} />
              </span>
            </label>
            <select 
              id="post-stream"
              value={stream ? 'yes' : 'no'} 
              onChange={(e) => setStream(e.target.value === 'yes')}
              disabled={isGenerating}
            >
              <option value="yes">On</option>
              <option value="no">Off</option>
            </select>
          </div>
        </div>

        <div className="settings-row">
          <div className="setting-group">
            <label htmlFor="post-temperature">
              Temperature
              <span className="tooltip-icon" title="Controls randomness. Higher values (0.8-1.0) make output more creative and varied. Lower values (0.1-0.3) make it more focused and deterministic.">
                <HelpCircle size={14} />
              </span>
            </label>
            <input
              id="post-temperature"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="setting-group">
            <label htmlFor="post-topP">
              Top P
              <span className="tooltip-icon" title="Nucleus sampling. Controls diversity by limiting to top probability tokens. 0.9 means consider tokens that make up 90% of probability mass.">
                <HelpCircle size={14} />
              </span>
            </label>
            <input
              id="post-topP"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={topP}
              onChange={(e) => setTopP(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="setting-group">
            <label htmlFor="post-seed">
              Seed
              <span className="tooltip-icon" title="Random seed for reproducibility. Same seed with same input produces same output. Leave empty for random results.">
                <HelpCircle size={14} />
              </span>
            </label>
            <input
              id="post-seed"
              type="text"
              placeholder="Optional"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>
      </div>

      <div className="post-helper-content">
        <div className="post-helper-columns-header">
          <h3>Your Text</h3>
          <h3>AI Suggestions</h3>
        </div>

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
                <button
                  onClick={() => handleRegenerate(entry)}
                  className="regenerate-btn"
                  disabled={isGenerating}
                  title="Regenerate with same settings"
                >
                  <RefreshCw size={14} />
                  Regenerate
                </button>
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
  );
};
