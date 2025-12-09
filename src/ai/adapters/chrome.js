import { AIAdapter } from './base.js';

/**
 * Chrome AI Adapter
 * Uses Chrome's built-in Writer and Rewriter APIs
 */
export class ChromeAIAdapter extends AIAdapter {
  async isAvailable() {
    try {
      if (typeof self === 'undefined') return false;
      
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
      
      return writerOk && rewriterOk;
    } catch (error) {
      return false;
    }
  }

  async generateText(options) {
    const { prompt, context = '', tone = 'neutral', format = 'plain-text', length = 'short', stream = false, stripEmojis = false } = options;

    if (!await this.isAvailable()) {
      throw new Error('Chrome AI Writer is not available');
    }

    const writer = await self.Writer.create({
      tone: tone,
      format: format,
      length: length,
      sharedContext: context,
      outputLanguage: 'en'
    });

    if (stream) {
      // Return async iterable for streaming
      return this._streamWriter(writer, prompt, stripEmojis);
    } else {
      const result = await writer.write(prompt);
      return stripEmojis ? this._stripEmojis(result) : result;
    }
  }

  async rewriteText(options) {
    const { text, context = '', tone = 'as-is', format = 'as-is', length = 'as-is', stream = false, stripEmojis = false } = options;

    if (!await this.isAvailable()) {
      throw new Error('Chrome AI Rewriter is not available');
    }

    const rewriter = await self.Rewriter.create({
      tone: tone,
      format: format,
      length: length,
      sharedContext: context,
      outputLanguage: 'en'
    });

    if (stream) {
      return this._streamRewriter(rewriter, text, stripEmojis);
    } else {
      const result = await rewriter.rewrite(text);
      return stripEmojis ? this._stripEmojis(result) : result;
    }
  }

  async *_streamWriter(writer, prompt, stripEmojis) {
    const stream = writer.writeStream(prompt);
    for await (const chunk of stream) {
      yield stripEmojis ? this._stripEmojis(chunk) : chunk;
    }
  }

  async *_streamRewriter(rewriter, text, stripEmojis) {
    const stream = rewriter.rewriteStream(text);
    for await (const chunk of stream) {
      yield stripEmojis ? this._stripEmojis(chunk) : chunk;
    }
  }

  _stripEmojis(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }
}
