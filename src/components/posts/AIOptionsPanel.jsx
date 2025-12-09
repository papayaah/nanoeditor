import PropTypes from 'prop-types';
import { HelpCircle, Sparkles } from 'lucide-react';
import './AIOptionsPanel.css';

export const AIOptionsPanel = ({ 
  apiMode = 'writer',
  setApiMode,
  tone = 'neutral',
  setTone,
  format = 'markdown',
  setFormat,
  length = 'short',
  setLength,
  style = 'default',
  setStyle,
  customStyle = '',
  setCustomStyle,
  useEmoticons = false,
  setUseEmoticons,
  stream = true,
  setStream,
  temperature = '0.7',
  setTemperature,
  topP = '0.9',
  setTopP,
  seed = '',
  setSeed,
  isGenerating = false,
  // UI Library switcher
  uiLibrary,
  setUILibrary,
  availableLibraries
}) => {
  return (
    <div className="ai-options-panel">
      <div className="ai-options-panel-header">
        <div className="ai-options-panel-title">
          <Sparkles size={16} />
          <span>AI COMPANION</span>
        </div>
      </div>
      
      <div className="ai-options-panel-content">
        {/* UI Library Switcher */}
        {setUILibrary && availableLibraries && (
          <div className="ai-setting-group full-width">
            <label htmlFor="ai-ui-library">
              UI Library
              <span className="tooltip-icon" title="Switch between native HTML and Mantine UI components">
                <HelpCircle size={12} />
              </span>
            </label>
            <select 
              id="ai-ui-library"
              value={uiLibrary} 
              onChange={(e) => setUILibrary(e.target.value)}
              disabled={isGenerating}
            >
              {availableLibraries.map(lib => (
                <option key={lib.value} value={lib.value}>{lib.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="ai-setting-group">
          <label htmlFor="ai-api-mode">
            API Mode
            <span className="tooltip-icon" title="Writer API generates more varied and creative suggestions. Rewriter API produces more consistent rewrites.">
              <HelpCircle size={12} />
            </span>
          </label>
          <select 
            id="ai-api-mode"
            value={apiMode} 
            onChange={(e) => setApiMode(e.target.value)}
            disabled={isGenerating}
          >
            <option value="writer">Writer</option>
            <option value="rewriter">Rewriter</option>
          </select>
        </div>

        <div className="ai-setting-group">
          <label htmlFor="ai-tone">Tone</label>
          <select 
            id="ai-tone"
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            disabled={isGenerating}
          >
            {apiMode === 'writer' ? (
              <>
                <option value="casual">Casual</option>
                <option value="neutral">Neutral</option>
                <option value="formal">Formal</option>
              </>
            ) : (
              <>
                <option value="more-casual">More Casual</option>
                <option value="as-is">As-Is</option>
                <option value="more-formal">More Formal</option>
              </>
            )}
          </select>
        </div>

        <div className="ai-setting-group">
          <label htmlFor="ai-format">Format</label>
          <select 
            id="ai-format"
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            disabled={isGenerating}
          >
            {apiMode === 'writer' ? (
              <>
                <option value="markdown">Markdown</option>
                <option value="plain-text">Plain Text</option>
              </>
            ) : (
              <>
                <option value="as-is">As-Is</option>
                <option value="markdown">Markdown</option>
                <option value="plain-text">Plain Text</option>
              </>
            )}
          </select>
        </div>

        <div className="ai-setting-group">
          <label htmlFor="ai-length">Length</label>
          <select 
            id="ai-length"
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

        <div className="ai-setting-group full-width">
          <label htmlFor="ai-style">Style</label>
          <select 
            id="ai-style"
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
          <div className="ai-setting-group full-width">
            <label htmlFor="ai-custom-style">Custom Style</label>
            <input
              id="ai-custom-style"
              type="text"
              placeholder="e.g., poetic and romantic"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        )}

        <div className="ai-setting-group">
          <label htmlFor="ai-emoticons">Emoticons</label>
          <select 
            id="ai-emoticons"
            value={useEmoticons ? 'yes' : 'no'} 
            onChange={(e) => setUseEmoticons(e.target.value === 'yes')}
            disabled={isGenerating}
          >
            <option value="no">No Emojis</option>
            <option value="yes">With Emojis</option>
          </select>
        </div>

        <div className="ai-setting-group">
          <label htmlFor="ai-stream">Stream</label>
          <select 
            id="ai-stream"
            value={stream ? 'yes' : 'no'} 
            onChange={(e) => setStream(e.target.value === 'yes')}
            disabled={isGenerating}
          >
            <option value="yes">On</option>
            <option value="no">Off</option>
          </select>
        </div>

        <div className="ai-setting-group">
          <label htmlFor="ai-temperature">
            Temperature
            <span className="tooltip-icon" title="Controls randomness. Higher = more creative.">
              <HelpCircle size={12} />
            </span>
          </label>
          <input
            id="ai-temperature"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="ai-setting-group">
          <label htmlFor="ai-topP">
            Top P
            <span className="tooltip-icon" title="Nucleus sampling for diversity.">
              <HelpCircle size={12} />
            </span>
          </label>
          <input
            id="ai-topP"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={topP}
            onChange={(e) => setTopP(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="ai-setting-group full-width">
          <label htmlFor="ai-seed">
            Seed
            <span className="tooltip-icon" title="For reproducible results.">
              <HelpCircle size={12} />
            </span>
          </label>
          <input
            id="ai-seed"
            type="text"
            placeholder="Optional"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

AIOptionsPanel.propTypes = {
  apiMode: PropTypes.oneOf(['writer', 'rewriter']),
  setApiMode: PropTypes.func.isRequired,
  tone: PropTypes.string,
  setTone: PropTypes.func.isRequired,
  format: PropTypes.string,
  setFormat: PropTypes.func.isRequired,
  length: PropTypes.string,
  setLength: PropTypes.func.isRequired,
  style: PropTypes.string,
  setStyle: PropTypes.func.isRequired,
  customStyle: PropTypes.string,
  setCustomStyle: PropTypes.func.isRequired,
  useEmoticons: PropTypes.bool,
  setUseEmoticons: PropTypes.func.isRequired,
  stream: PropTypes.bool,
  setStream: PropTypes.func.isRequired,
  temperature: PropTypes.string,
  setTemperature: PropTypes.func.isRequired,
  topP: PropTypes.string,
  setTopP: PropTypes.func.isRequired,
  seed: PropTypes.string,
  setSeed: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool,
  uiLibrary: PropTypes.string,
  setUILibrary: PropTypes.func,
  availableLibraries: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
};
