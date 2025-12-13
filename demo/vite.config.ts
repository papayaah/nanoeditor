import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Resolve local package source files (enables tree-shaking and deduplication)
      '@reactkits.dev/react-writer/styles/posts.css': resolve(__dirname, '../src/components/posts/PostCreator.css'),
      '@reactkits.dev/react-writer/posts': resolve(__dirname, '../src/exports/posts.js'),
      '@reactkits.dev/react-writer/articles': resolve(__dirname, '../src/exports/articles.js'),
      '@reactkits.dev/react-writer/hooks': resolve(__dirname, '../src/exports/hooks.js'),
      '@reactkits.dev/react-writer': resolve(__dirname, '../src/index.js'),
    },
  },
  optimizeDeps: {
    // Exclude packages with complex ESM structures that break pre-bundling
    exclude: ['@mantine/core', '@mantine/hooks'],
  },
  build: {
    // Let Vite/Rollup handle code splitting automatically
    chunkSizeWarningLimit: 1000,
    // Enable css code splitting to reduce unused CSS
    cssCodeSplit: true,
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
});
