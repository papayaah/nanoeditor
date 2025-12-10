import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.stories.*', 'src/**/*.test.*', 'demo/**/*'],
      outDir: 'dist',
      rollupTypes: false,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        'exports/posts': resolve(__dirname, 'src/exports/posts.js'),
        'exports/articles': resolve(__dirname, 'src/exports/articles.js'),
        'exports/hooks': resolve(__dirname, 'src/exports/hooks.js'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'js';
        // Handle nested exports
        if (entryName.includes('/')) {
          const parts = entryName.split('/');
          return `${parts[0]}/${parts[1]}.${ext}`;
        }
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@mantine/core',
        '@mantine/hooks',
        '@blocknote/core',
        '@blocknote/react',
        '@blocknote/mantine',
        '@blocknote/xl-pdf-exporter',
        '@react-pdf/renderer',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        preserveModules: false,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
  },
});
