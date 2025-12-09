/**
 * createPostCreator - Minimal Component Mapping
 * 
 * Users just pass their UI components directly - no adapter needed!
 * 
 * @example Material-UI
 * import { TextField, Button, Card } from "@mui/material";
 * export const PostCreator = createPostCreator({
 *   Input: TextField,
 *   Button,
 *   Card
 * });
 * 
 * @example Shadcn/UI
 * import { Input, Button, Card } from "@/components/ui";
 * export const PostCreator = createPostCreator({ Input, Button, Card });
 * 
 * @example Mantine
 * import { Textarea, Button, Card } from "@mantine/core";
 * export const PostCreator = createPostCreator({
 *   Input: Textarea,
 *   Button,
 *   Card
 * });
 */

import { forwardRef, useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { usePostCreator } from '../../hooks/usePostCreator';
import { AIAssistantToggle } from './AIAssistantToggle';
import { AIOptionsPanel } from './AIOptionsPanel';
import ReactMarkdown from 'react-markdown';
import './PostCreator.css';

// Default components (vanilla HTML)
const DefaultInput = forwardRef(({ value, onChange, multiline, minRows, ...props }, ref) => (
  <textarea
    ref={ref}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...props}
  />
));
DefaultInput.displayName = 'DefaultInput';

const DefaultButton = ({ children, onClick, ...props }) => (
  <button onClick={onClick} {...props}>{children}</button>
);

const DefaultCard = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const DefaultBadge = ({ children, ...props }) => (
  <span {...props}>{children}</span>
);

/**
 * Auto-detect component type based on name or properties
 */
const detectComponentType = (component) => {
  if (!component) return null;
  
  const name = component.displayName || component.name || '';
  const lowerName = name.toLowerCase();
  
  // Input detection
  if (lowerName.includes('textarea') || 
      lowerName.includes('textfield') || 
      lowerName.includes('input')) {
    return 'Input';
  }
  
  // Button detection
  if (lowerName.includes('button')) {
    return 'Button';
  }
  
  // Card detection
  if (lowerName.includes('card') || 
      lowerName.includes('paper') || 
      lowerName.includes('box')) {
    return 'Card';
  }
  
  // Badge detection
  if (lowerName.includes('badge') || 
      lowerName.includes('chip') || 
      lowerName.includes('tag')) {
    return 'Badge';
  }
  
  return null;
};

/**
 * Create a PostCreator with custom components
 * 
 * Auto-detects component types by name!
 * 
 * @example Auto-detection (no keys needed!)
 * createPostCreator({ TextField, Button, Card })
 * 
 * @example Explicit mapping
 * createPostCreator({ Input: TextField, Button, Card })
 * 
 * @example Default (vanilla HTML)
 * createPostCreator() // Uses native HTML elements
 */
export const createPostCreator = (components = {}) => {
  const UI = {
    Input: DefaultInput,
    Button: DefaultButton,
    Card: DefaultCard,
    Badge: DefaultBadge,
  };
  
  // Auto-detect or use explicit mapping
  Object.entries(components).forEach(([key, component]) => {
    // If key is a known type, use it directly
    if (['Input', 'Button', 'Card', 'Badge'].includes(key)) {
      UI[key] = component;
    } else {
      // Auto-detect based on component name
      const detectedType = detectComponentType(component);
      if (detectedType) {
        UI[detectedType] = component;
      }
    }
  });

  // Normalize component props to work with any UI library
  const normalizeInputProps = (props) => {
    const { value, onChange, onKeyDown, placeholder, disabled, ref } = props;
    
    // Handle different onChange signatures
    const handleChange = (e) => {
      const newValue = e?.target?.value ?? e;
      onChange(newValue);
    };

    return {
      value,
      onChange: handleChange,
      onKeyDown,
      placeholder,
      disabled,
      ref,
      // Common prop names across libraries
      multiline: true,
      rows: 3,
      minRows: 3,
    };
  };

  const normalizeButtonProps = (props) => {
    const { children, onClick, disabled, variant } = props;
    return {
      children,
      onClick,
      disabled,
      variant: variant || 'primary',
      color: variant === 'primary' ? 'primary' : 'default',
    };
  };

  // Return the PostCreator component
  return function PostCreator({ 
    currentEntryId,
    onEntrySaved,
    onSettingsExport,
    darkMode,
    // UI Library props
    uiLibrary,
    setUILibrary,
    availableLibraries,
  }) {
    const logic = usePostCreator({
      currentEntryId,
      onEntrySaved,
      onSettingsExport,
    });

    const [showAIPanel, setShowAIPanel] = useState(false);

    if (!logic.aiAvailable) {
      return (
        <div className="post-creator">
          <div className="post-creator-unavailable">
            <Sparkles size={48} color="#e5e5e5" />
            <h2>Chrome AI Not Available</h2>
            <p>This feature requires Chrome's built-in AI.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="post-creator" data-theme={darkMode ? 'dark' : 'light'}>
        <div className="editor-container">
          <div className="editor-wrapper">
            <div className="post-creator-content">
              
              {/* Input Section */}
              <div className="current-input-row">
                <div className="current-input">
                  <div className="input-header">
                    <AIAssistantToggle 
                      isActive={showAIPanel}
                      onToggle={() => setShowAIPanel(!showAIPanel)}
                      disabled={logic.isGenerating}
                    />
                  </div>
                  <UI.Input
                    {...normalizeInputProps({
                      ref: logic.textareaRef,
                      value: logic.inputText,
                      onChange: logic.setInputText,
                      onKeyDown: logic.handleKeyDown,
                      placeholder: "What would you like to post?",
                      disabled: logic.isGenerating,
                    })}
                  />
                  
                  <div className="input-meta">
                    <div className="input-counts">
                      <span className="char-count">{logic.charCount} chars</span>
                      <span className="word-count">{logic.wordCount} words</span>
                    </div>
                    
                    <UI.Button
                      {...normalizeButtonProps({
                        onClick: logic.handleSubmit,
                        disabled: !logic.inputText.trim() || logic.isGenerating,
                        variant: 'primary',
                      })}
                    >
                      Generate
                    </UI.Button>
                  </div>
                  
                  {/* AI Options Panel */}
                  {showAIPanel && (
                    <AIOptionsPanel
                      {...logic.settings}
                      isGenerating={logic.isGenerating}
                      uiLibrary={uiLibrary}
                      setUILibrary={setUILibrary}
                      availableLibraries={availableLibraries}
                    />
                  )}
                </div>
                
                {/* Empty state */}
                <div className="current-suggestions-placeholder">
                  {!logic.currentEntry && (
                    <div className="post-empty">
                      <Sparkles size={32} color="#e5e5e5" />
                      <p>Suggestions will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* History Section */}
              {logic.currentEntry && (() => {
                const submissions = Array.isArray(logic.currentEntry.submissions) 
                  ? logic.currentEntry.submissions 
                  : [];
                
                const hasContent = logic.currentEntry.isGenerating || submissions.length > 0;
                
                return hasContent && (
                  <div className="post-history">
                    {submissions.map((submission, submissionIndex) => {
                      const generations = Array.isArray(submission.generations) ? submission.generations : [];
                      
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
                                  <p className="submission-text">{submission.text}</p>
                                  <div className="history-text-meta">
                                    <span className="char-count">{submission.text.length} chars</span>
                                    <span className="word-count">
                                      {submission.text.trim().split(/\s+/).length} words
                                    </span>
                                  </div>
                                </>
                              )}
                              
                              {/* Settings badges */}
                              {submission.settings && (
                                <div className="entry-settings">
                                  <UI.Badge className="setting-badge">
                                    {submission.settings.apiMode === 'writer' ? 'Writer' : 'Rewriter'}
                                  </UI.Badge>
                                  <UI.Badge className="setting-badge">
                                    {submission.settings.tone}
                                  </UI.Badge>
                                </div>
                              )}
                              
                              {/* Regenerate controls */}
                              {submissionIndex === 0 && (
                                <div className="regenerate-controls">
                                  <div className="regenerate-buttons">
                                    <UI.Button
                                      {...normalizeButtonProps({
                                        onClick: logic.handleRegenerate,
                                        disabled: logic.isGenerating,
                                        variant: 'secondary',
                                      })}
                                    >
                                      <RefreshCw size={14} />
                                      Regenerate
                                    </UI.Button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Suggestions */}
                            <div className="history-suggestions-item">
                              {generations.map((generation, genIndex) => (
                                <div key={generation.id || genIndex} className="generation-group">
                                  <div className="suggestions-grid">
                                    {[0, 1, 2].map((index) => (
                                      <UI.Card key={index} className="suggestion-card">
                                        {generation.suggestions && generation.suggestions[index] ? (
                                          <>
                                            <div className="suggestion-content">
                                              {submission.settings?.format === 'markdown' ? (
                                                <ReactMarkdown>{generation.suggestions[index]}</ReactMarkdown>
                                              ) : (
                                                <p>{generation.suggestions[index]}</p>
                                              )}
                                            </div>
                                            <div className="suggestion-meta">
                                              <span className="char-count">
                                                {generation.suggestions[index].length} chars
                                              </span>
                                              <span className="word-count">
                                                {generation.suggestions[index].trim().split(/\s+/).length} words
                                              </span>
                                            </div>
                                            <button
                                              onClick={() => logic.handleCopy(
                                                generation.suggestions[index], 
                                                logic.currentEntry.id, 
                                                `${generation.id}-${index}`
                                              )}
                                              className="copy-btn"
                                            >
                                              {logic.copiedId === `${logic.currentEntry.id}-${generation.id}-${index}` ? (
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
                                      </UI.Card>
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
};

// Export default PostCreator with vanilla components
export const PostCreator = createPostCreator();
