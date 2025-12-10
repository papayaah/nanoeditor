import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // Storybook 10: addons are now built-in, no separate packages needed
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Ensure React is properly resolved
    config.resolve = config.resolve || {};
    config.resolve.dedupe = ['react', 'react-dom'];
    return config;
  },
};

export default config;
