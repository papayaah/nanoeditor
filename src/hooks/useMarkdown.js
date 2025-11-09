import { useState } from 'react';
import { loadDocument } from '../db';

export const useMarkdown = () => {
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  const toggleMarkdown = async (currentDocId) => {
    if (!showMarkdown && currentDocId) {
      const content = await loadDocument(currentDocId);
      const md = content.map(block => {
        if (block.type === 'heading') {
          const level = '#'.repeat(block.props?.level || 1);
          return `${level} ${block.content?.[0]?.text || ''}\n`;
        }
        return block.content?.[0]?.text || '';
      }).join('\n');
      setMarkdown(md);
    }
    setShowMarkdown(!showMarkdown);
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return {
    showMarkdown,
    setShowMarkdown,
    markdown,
    showCopied,
    toggleMarkdown,
    copyMarkdown,
  };
};
