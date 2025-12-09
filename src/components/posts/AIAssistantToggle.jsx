import PropTypes from 'prop-types';
import { Sparkles } from 'lucide-react';
import './AIAssistantToggle.css';

export const AIAssistantToggle = ({ isActive = false, onToggle, disabled = false }) => {
  return (
    <button
      className={`ai-assistant-toggle ${isActive ? 'active' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-label={isActive ? 'Hide AI Assistant' : 'Show AI Assistant'}
    >
      <Sparkles size={14} />
      <span>AI Assistant {isActive ? 'Active' : ''}</span>
    </button>
  );
};

AIAssistantToggle.propTypes = {
  isActive: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
