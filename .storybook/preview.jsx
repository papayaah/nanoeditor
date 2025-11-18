import '@mantine/core/styles.css';
import 'antd/dist/reset.css';
import '../src/tailwind.css';
import '../src/styles.css';
import '../src/mantine-override.css';
import { MantineProvider } from '@mantine/core';

// Global decorator to add UI theme switching
export const globalTypes = {
  uiTheme: {
    name: 'UI Theme',
    description: 'Switch between UI implementations',
    defaultValue: 'mantine',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'mantine', title: 'Mantine UI', icon: 'component' },
        { value: 'mui', title: 'Material-UI', icon: 'box' },
        { value: 'antd', title: 'Ant Design', icon: 'grid' },
        { value: 'shadcn', title: 'shadcn/ui', icon: 'star' },
        { value: 'tailwind', title: 'Tailwind CSS', icon: 'lightning' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

// Decorator to wrap stories with the selected UI theme
export const decorators = [
  (Story, context) => {
    const uiTheme = context.globals.uiTheme || 'native';
    
    // Add data attribute to body for CSS targeting
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-ui-theme', uiTheme);
    }
    
    // Wrap with MantineProvider if Mantine theme is selected
    if (uiTheme === 'mantine') {
      return (
        <MantineProvider>
          <Story />
        </MantineProvider>
      );
    }
    
    return <Story />;
  },
];

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;