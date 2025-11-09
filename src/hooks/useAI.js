import { useState, useEffect } from 'react';

export const useAI = () => {
  const [aiAvailable, setAiAvailable] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    checkAIAvailability();
  }, []);

  const checkAIAvailability = async () => {
    try {
      if (typeof self === 'undefined') {
        setAiAvailable(false);
        return;
      }

      let writerOk = false;
      let rewriterOk = false;

      if ('Writer' in self) {
        try {
          const writerAvailability = await self.Writer.availability();
          writerOk = writerAvailability === 'available' || writerAvailability === 'downloadable';
        } catch (error) {
          // Writer check failed
        }
      }

      if ('Rewriter' in self) {
        try {
          const rewriterAvailability = await self.Rewriter.availability();
          rewriterOk = rewriterAvailability === 'available' || rewriterAvailability === 'downloadable';
        } catch (error) {
          // Rewriter check failed
        }
      }
      
      setAiAvailable(writerOk && rewriterOk);
    } catch (error) {
      setAiAvailable(false);
    }
  };

  return {
    aiAvailable,
    showAiModal,
    setShowAiModal,
  };
};
