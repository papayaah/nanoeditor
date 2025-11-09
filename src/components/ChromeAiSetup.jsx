import { X, Sparkles } from 'lucide-react';

export const ChromeAiSetup = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        <div className="modal-header">
          <Sparkles size={24} />
          <h2>Enable Chrome AI Features</h2>
        </div>
        <p className="modal-description">
          This app uses Chrome's built-in AI features for writing and rewriting. Follow these steps to enable them:
        </p>
        <ol className="modal-steps">
          <li>
            <strong>Install Chrome Canary</strong>
            <span>Version 127 or later required</span>
          </li>
          <li>
            <strong>Open Chrome Flags</strong>
            <code>chrome://flags/</code>
          </li>
          <li>
            <strong>Enable Optimization Guide</strong>
            <code>#optimization-guide-on-device-model</code>
            <span>Enables on-device AI model (~4GB download)</span>
          </li>
          <li>
            <strong>Enable Writer API</strong>
            <code>#writer-api-for-gemini-nano</code>
          </li>
          <li>
            <strong>Enable Rewriter API</strong>
            <code>#rewriter-api-for-gemini-nano</code>
          </li>
          <li>
            <strong>Enable Prompt API</strong>
            <code>#prompt-api-for-gemini-nano</code>
          </li>
          <li>
            <strong>Restart Chrome</strong>
            <span>Model will download automatically after restart</span>
          </li>
        </ol>
        <div className="modal-footer">
          <a 
            href="https://developer.chrome.com/docs/ai/built-in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="modal-link"
          >
            View Full Documentation →
          </a>
          <button onClick={onClose} className="modal-button">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
