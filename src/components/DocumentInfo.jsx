import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

// Chrome AI Writer token limits (based on real usage)
const TOKEN_LIMIT = 7000; // Actual Chrome AI limit appears to be around 7k tokens

const getTokenColor = (tokens) => {
  const percentage = (tokens / TOKEN_LIMIT) * 100;
  if (percentage >= 95) return '#dc2626'; // Red - Critical
  if (percentage >= 80) return '#ea580c'; // Orange - Warning
  if (percentage >= 60) return '#d97706'; // Amber - Caution
  return '#059669'; // Green - Safe
};

export const DocumentInfo = ({ currentDocId, documents }) => {
  const [stats, setStats] = useState({
    wordCount: 0,
    charCount: 0,
    blockCount: 0,
    storageSize: 0,
    contextSize: 0,
    estimatedTokens: 0,
    aiGenerations: 0,
    readingTimeMinutes: 0,
    pageCount: 0
  });

  useEffect(() => {
    if (!currentDocId || !documents.length) return;

    const updateStats = () => {
      try {
        // Get current document from documents array
        const currentDoc = documents.find(doc => doc.id === currentDocId);
        if (!currentDoc) return;

        // Parse the stored content
        const documentBlocks = JSON.parse(currentDoc.content || '[]');
        
        // Calculate text statistics
        let totalText = '';
        let blockCount = documentBlocks.length;
        
        documentBlocks.forEach(block => {
          if (block.content && Array.isArray(block.content)) {
            block.content.forEach(item => {
              if (item.type === 'text' && item.text) {
                totalText += item.text + ' ';
              }
            });
          }
        });

        const charCount = totalText.length;
        const wordCount = totalText.trim() ? totalText.trim().split(/\s+/).length : 0;

        // Calculate storage size
        const storageSize = new Blob([currentDoc.content]).size;

        // Calculate AI-related metrics
        const contextSize = totalText.length; // Context size is the full document text
        
        // Rough token estimation (1 token ≈ 4 characters for English text)
        const estimatedTokens = Math.ceil(charCount / 4);
        
        // Get AI generation count from document metadata (if stored)
        const aiGenerations = currentDoc.aiGenerations || 0;

        // Calculate reading metrics
        // Average reading speed: 200-250 words per minute (using 225)
        const readingTimeMinutes = wordCount > 0 ? Math.ceil(wordCount / 225) : 0;
        
        // Page count estimation: ~500-600 words per page (more realistic for digital documents)
        const pageCount = wordCount > 0 ? Math.ceil(wordCount / 550) : 0;

        setStats({
          wordCount,
          charCount,
          blockCount,
          storageSize,
          contextSize,
          estimatedTokens,
          aiGenerations,
          readingTimeMinutes,
          pageCount
        });
      } catch (error) {
        console.log('Error calculating document stats:', error);
      }
    };

    updateStats();
  }, [currentDocId, documents]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="document-info">
      <div className="document-info-title">
        Document Info
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Words:</span>
          <span style={{ fontWeight: '500' }}>{stats.wordCount.toLocaleString()}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Characters:</span>
          <span style={{ fontWeight: '500' }}>{stats.charCount.toLocaleString()}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Blocks:</span>
          <span style={{ fontWeight: '500' }}>{stats.blockCount}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Storage:</span>
          <span style={{ fontWeight: '500' }}>{formatBytes(stats.storageSize)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Pages:</span>
          <span style={{ fontWeight: '500' }}>{stats.pageCount}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Read Time:</span>
          <span style={{ fontWeight: '500' }}>
            {stats.readingTimeMinutes === 0 ? '< 1 min' : 
             stats.readingTimeMinutes === 1 ? '1 min' :
             `${stats.readingTimeMinutes} mins`}
          </span>
        </div>
      </div>

      <div className="ai-metrics-section">
        <div className="ai-metrics-title">
          <Sparkles size={14} /> AI Metrics
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Context Size:</span>
            <span style={{ fontWeight: '500' }}>{stats.contextSize.toLocaleString()} chars</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Est. Tokens:</span>
            <span style={{ fontWeight: '500', color: getTokenColor(stats.estimatedTokens) }}>
              {stats.estimatedTokens.toLocaleString()}
            </span>
          </div>
          
          {/* Token usage progress bar */}
          <div style={{ marginTop: '6px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '11px' }}>Token Usage</span>
              <span style={{ fontSize: '11px', color: getTokenColor(stats.estimatedTokens) }}>
                {Math.round((stats.estimatedTokens / TOKEN_LIMIT) * 100)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--border-color)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((stats.estimatedTokens / TOKEN_LIMIT) * 100, 100)}%`,
                height: '100%',
                backgroundColor: getTokenColor(stats.estimatedTokens),
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--text-secondary)', 
              marginTop: '2px',
              textAlign: 'center'
            }}>
              {stats.estimatedTokens >= TOKEN_LIMIT ? 
                '⚠️ Context limit reached' : 
                `${(TOKEN_LIMIT - stats.estimatedTokens).toLocaleString()} tokens remaining`
              }
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span>AI Generations:</span>
            <span style={{ fontWeight: '500' }}>{stats.aiGenerations}</span>
          </div>
        </div>
      </div>
    </div>
  );
};