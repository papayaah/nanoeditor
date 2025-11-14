import { HelpCircle, ChevronDown } from 'lucide-react';
import './PostSettings.css';

export const PostSettings = ({ 
  apiMode,
  setApiMode,
  tone,
  setTone,
  format,
  setFormat,
  length,
  setLength,
  style,
  setStyle,
  customStyle,
  setCustomStyle,
  useEmoticons,
  setUseEmoticons,
  stream,
  setStream,
  temperature,
  setTemperature,
  topP,
  setTopP,
  seed,
  setSeed,
  isGenerating,
  collapsed,
  onToggle
}) => {
  return (
    <div className="document-info">
      <div className="document-info-header" onClick={onToggle}>
        <span className="document-info-title">Post Settings</span>
        <button className="collapse-toggle" aria-label={collapsed ? 'Expand' : 'Collapse'}>
          <ChevronDown size={16} style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>
      
      {!collapsed && (
        <div className="doc-info-content post-settings-content">
          <div className="setting-group">
            <label htmlFor="post-api-mode">
              API Mode
              <span className="tooltip-icon" title="Writer API generates more varied and creative suggestions. Rewriter API produces more consistent rewrites.">
                <HelpCircle size={12} />
              </span>
            </label>
            <select 
              id="post-api-mode"
              value={apiMode} 
              onChange={(e) => setApiMode(e.target.value)}
              disabled={isGenerating}
            >
              <option value="writer">Writer</option>
              <option value="rewriter">Rewriter</option>
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
              <option value="as-is">As-Is</option>
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
              {apiMode === 'writer' ? (
                <>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </>
              ) : (
                <>
                  <option value="shorter">Shorter</option>
                  <option value="as-is">As-Is</option>
                  <option value="longer">Longer</option>
                </>
              )}
            </select>
          </div>

          <div className="setting-group full-width">
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
            <div className="setting-group full-width">
              <label htmlFor="post-custom-style">Custom Style</label>
              <input
                id="post-custom-style"
                type="text"
                placeholder="e.g., poetic and romantic"
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
            <label htmlFor="post-stream">Stream</label>
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

          <div className="setting-group">
            <label htmlFor="post-temperature">
              Temperature
              <span className="tooltip-icon" title="Controls randomness. Higher = more creative.">
                <HelpCircle size={12} />
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
              <span className="tooltip-icon" title="Nucleus sampling for diversity.">
                <HelpCircle size={12} />
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

          <div className="setting-group full-width">
            <label htmlFor="post-seed">
              Seed
              <span className="tooltip-icon" title="For reproducible results.">
                <HelpCircle size={12} />
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
      )}
    </div>
  );
};
