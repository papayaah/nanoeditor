// Chrome AI API types and utilities
export interface WriterOptions {
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

export interface RewriterOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  format?: 'as-is' | 'plain-text' | 'markdown';
  length?: 'as-is' | 'shorter' | 'longer';
}

export interface WriterCreateOptions {
  sharedContext?: string;
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  monitor?: (m: any) => void;
}

export interface RewriterCreateOptions {
  sharedContext?: string;
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  format?: 'as-is' | 'plain-text' | 'markdown';
  length?: 'as-is' | 'shorter' | 'longer';
  monitor?: (m: any) => void;
}

// Extend Window interface for Chrome AI APIs
declare global {
  interface Window {
    Writer?: {
      availability(): Promise<'available' | 'downloadable' | 'unavailable'>;
      create(options?: WriterCreateOptions): Promise<AIWriter>;
    };
    Rewriter?: {
      availability(): Promise<'available' | 'downloadable' | 'unavailable'>;
      create(options?: RewriterCreateOptions): Promise<AIRewriter>;
    };
  }
  
  const Writer: {
    availability(): Promise<'available' | 'downloadable' | 'unavailable'>;
    create(options?: WriterCreateOptions): Promise<AIWriter>;
  };
  
  const Rewriter: {
    availability(): Promise<'available' | 'downloadable' | 'unavailable'>;
    create(options?: RewriterCreateOptions): Promise<AIRewriter>;
  };
}

export interface AIWriter {
  write(input: string, context?: { context?: string }): Promise<string>;
  writeStreaming(input: string, context?: { context?: string }): AsyncIterable<string>;
  destroy(): void;
}

export interface AIRewriter {
  rewrite(input: string, context?: { context?: string }): Promise<string>;
  rewriteStreaming(input: string, context?: { context?: string }): AsyncIterable<string>;
  destroy(): void;
}

// Check if Chrome AI is available
export function isAIAvailable(): boolean {
  return typeof self !== 'undefined' && ('Writer' in self || 'Rewriter' in self);
}

// Check writer capabilities
export async function checkWriterCapabilities(): Promise<string | null> {
  if (typeof self === 'undefined' || !('Writer' in self)) {
    return null;
  }
  
  try {
    return await self.Writer!.availability();
  } catch (error) {
    console.error('Error checking writer capabilities:', error);
    return null;
  }
}

// Check rewriter capabilities
export async function checkRewriterCapabilities(): Promise<string | null> {
  if (typeof self === 'undefined' || !('Rewriter' in self)) {
    return null;
  }
  
  try {
    return await self.Rewriter!.availability();
  } catch (error) {
    console.error('Error checking rewriter capabilities:', error);
    return null;
  }
}

// Create writer session
export async function createWriter(options?: WriterCreateOptions): Promise<AIWriter> {
  if (typeof self === 'undefined' || !('Writer' in self)) {
    throw new Error('Chrome AI Writer is not available');
  }
  
  const availability = await self.Writer!.availability();
  if (availability === 'unavailable') {
    throw new Error('Chrome AI Writer is not available on this device');
  }
  
  try {
    // Default configuration optimized for content generation
    const writerConfig: WriterCreateOptions = {
      tone: 'neutral',
      format: 'plain-text', // Use plain-text to avoid HTML issues in streaming
      length: 'medium',
      ...options
    };

    let writer;
    if (availability === 'available') {
      writer = await self.Writer!.create(writerConfig);
    } else {
      // downloadable - include monitor for progress
      writer = await self.Writer!.create({
        ...writerConfig,
        monitor(m) {
          m.addEventListener('downloadprogress', (e: any) => {
            console.log(`Downloading model: ${Math.round((e.loaded / e.total) * 100)}%`);
          });
        }
      });
    }
    
    return writer;
  } catch (error) {
    console.error('Error creating writer:', error);
    throw new Error('Failed to create AI writer session');
  }
}

// Create rewriter session
export async function createRewriter(options?: RewriterCreateOptions): Promise<AIRewriter> {
  if (typeof self === 'undefined' || !('Rewriter' in self)) {
    throw new Error('Chrome AI Rewriter is not available');
  }
  
  const availability = await self.Rewriter!.availability();
  if (availability === 'unavailable') {
    throw new Error('Chrome AI Rewriter is not available on this device');
  }
  
  try {
    // Default configuration for rewriting
    const rewriterConfig: RewriterCreateOptions = {
      tone: 'as-is',
      format: 'as-is',
      length: 'as-is',
      ...options
    };

    let rewriter;
    if (availability === 'available') {
      rewriter = await self.Rewriter!.create(rewriterConfig);
    } else {
      // downloadable - include monitor for progress
      rewriter = await self.Rewriter!.create({
        ...rewriterConfig,
        monitor(m) {
          m.addEventListener('downloadprogress', (e: any) => {
            console.log(`Downloading model: ${Math.round((e.loaded / e.total) * 100)}%`);
          });
        }
      });
    }
    
    return rewriter;
  } catch (error) {
    console.error('Error creating rewriter:', error);
    throw new Error('Failed to create AI rewriter session');
  }
}

// Helper function to generate text with writer
export async function generateText(
  prompt: string, 
  options?: WriterCreateOptions,
  context?: string
): Promise<string> {
  const writer = await createWriter(options);
  
  try {
    const result = await writer.write(prompt, context ? { context } : undefined);
    return result;
  } finally {
    if (writer.destroy) {
      writer.destroy();
    }
  }
}

// Helper function to rewrite text
export async function rewriteText(
  text: string,
  options?: RewriterCreateOptions,
  context?: string
): Promise<string> {
  const rewriter = await createRewriter(options);
  
  try {
    const result = await rewriter.rewrite(text, context ? { context } : undefined);
    return result;
  } finally {
    if (rewriter.destroy) {
      rewriter.destroy();
    }
  }
}

// Streaming text generation
export async function generateTextStreaming(
  prompt: string,
  options?: WriterCreateOptions,
  context?: string
): Promise<AsyncIterable<string>> {
  const writer = await createWriter(options);
  
  try {
    return writer.writeStreaming(prompt, context ? { context } : undefined);
  } catch (error) {
    if (writer.destroy) {
      writer.destroy();
    }
    throw error;
  }
}

// Streaming text rewriting
export async function rewriteTextStreaming(
  text: string,
  options?: RewriterCreateOptions,
  context?: string
): Promise<AsyncIterable<string>> {
  const rewriter = await createRewriter(options);
  
  try {
    return rewriter.rewriteStreaming(text, context ? { context } : undefined);
  } catch (error) {
    if (rewriter.destroy) {
      rewriter.destroy();
    }
    throw error;
  }
}

// AI availability status
export interface AIStatus {
  writerAvailable: boolean;
  rewriterAvailable: boolean;
  writerCapabilities: string | null;
  rewriterCapabilities: string | null;
}

// Get overall AI status
export async function getAIStatus(): Promise<AIStatus> {
  const writerCapabilities = await checkWriterCapabilities();
  const rewriterCapabilities = await checkRewriterCapabilities();
  
  return {
    writerAvailable: writerCapabilities !== null && writerCapabilities !== 'unavailable',
    rewriterAvailable: rewriterCapabilities !== null && rewriterCapabilities !== 'unavailable',
    writerCapabilities,
    rewriterCapabilities
  };
}

// Debug function to check what's available
export function debugAI(): void {
  console.log('=== Chrome AI Debug Info ===');
  console.log('Writer in self:', 'Writer' in self);
  console.log('Rewriter in self:', 'Rewriter' in self);
  
  if (typeof self !== 'undefined') {
    console.log('self.Writer:', self.Writer)
    console.log('self.Rewriter:', self.Rewriter)
  }
  
  // Test capabilities
  if (typeof self !== 'undefined' && 'Writer' in self) {
    self.Writer!.availability().then(caps => {
      console.log('Writer availability:', caps);
    }).catch(err => {
      console.log('Writer availability error:', err);
    });
  }
  
  if (typeof self !== 'undefined' && 'Rewriter' in self) {
    self.Rewriter!.availability().then(caps => {
      console.log('Rewriter availability:', caps);
    }).catch(err => {
      console.log('Rewriter availability error:', err);
    });
  }
}

// Reusable writer instance for better performance
let writerInstanceRef: AIWriter | null = null;

// Get or create a reusable writer instance
export async function getOrCreateWriter(options?: WriterCreateOptions): Promise<AIWriter> {
  // Return existing writer if available
  if (writerInstanceRef) {
    return writerInstanceRef;
  }

  if (typeof self === 'undefined' || !('Writer' in self)) {
    throw new Error('Chrome AI Writer is not available');
  }

  const availability = await self.Writer!.availability();
  
  if (availability === 'unavailable') {
    throw new Error('Writer API is unavailable');
  }

  // Writer configuration - can be customized
  const writerConfig: WriterCreateOptions = {
    tone: 'neutral',
    format: 'plain-text', // Use plain-text for consistent streaming
    length: 'long',
    ...options
  };

  let writer;
  if (availability === 'available') {
    writer = await self.Writer!.create(writerConfig);
  } else {
    // downloadable - include monitor for progress
    writer = await self.Writer!.create({
      ...writerConfig,
      monitor(m) {
        m.addEventListener('downloadprogress', (e: any) => {
          console.log(`Downloading model: ${Math.round((e.loaded / e.total) * 100)}%`);
        });
      }
    });
  }

  // Cache the writer instance for reuse
  writerInstanceRef = writer;
  return writer;
}

// Cleanup function to destroy reusable writer
export function destroyWriter(): void {
  if (writerInstanceRef && writerInstanceRef.destroy) {
    writerInstanceRef.destroy();
    writerInstanceRef = null;
  }
}