import { useState, useEffect } from 'react';
import { 
  Settings, 
  FileText, 
  Code, 
  Copy, 
  FileDown, 
  Moon, 
  Sun, 
  Sparkles, 
  Check
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

// CSS loaded via styles.css in App.jsx

export function SettingsMenu({ 
  showMarkdown, 
  onToggleMarkdown, 
  onCopyMarkdown, 
  exportPdfRef,
  currentDocId,
  documents,
  getDocTitle,
  aiAvailable,
  onShowAiModal
}) {
  const { darkMode, setDarkMode } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleExportPdf = async () => {
    if (!currentDocId || !exportPdfRef.current) return;
    
    try {
      const currentDoc = documents.find(doc => doc.id === currentDocId);
      const docTitle = getDocTitle(currentDoc) || 'document';
      await exportPdfRef.current(docTitle);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSettings && !e.target.closest('.floating-settings')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const handleCopy = async () => {
    await onCopyMarkdown();
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <>
      <div className="floating-settings">
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="settings-toggle" 
          aria-label="Open settings menu"
        >
          <Settings size={20} />
          {aiAvailable === false && (
            <span className="ai-status-badge" title="AI features unavailable">!</span>
          )}
        </button>
        {showSettings && (
          <div className="settings-menu">
            {aiAvailable === false && (
              <button onClick={onShowAiModal} className="settings-menu-btn ai-warning">
                <Sparkles size={16} />
                <span>AI Features Unavailable</span>
              </button>
            )}
            <button onClick={onToggleMarkdown} className="settings-menu-btn">
              {showMarkdown ? <FileText size={16} /> : <Code size={16} />}
              <span>{showMarkdown ? 'Editor' : 'Markdown'}</span>
            </button>
            <button onClick={handleCopy} className="settings-menu-btn">
              {showCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{showCopied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={handleExportPdf} className="settings-menu-btn">
              <FileDown size={16} />
              <span>Export PDF</span>
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="settings-menu-btn">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
