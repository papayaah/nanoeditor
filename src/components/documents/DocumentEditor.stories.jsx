import { useState, useRef } from 'react';
import DocumentEditor from './DocumentEditor';
import { MantineProvider } from '@mantine/core';

export default {
  title: 'Components/DocumentEditor',
  component: DocumentEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A rich text editor built with BlockNote, featuring AI-powered writing assistance using Chrome\'s built-in AI APIs.',
      },
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
};

// Mock document ID
const MOCK_DOC_ID = 'storybook-demo-doc';

// Template for the editor
const Template = (args) => {
  const [content, setContent] = useState([]);
  const exportPdfRef = useRef(null);

  const handleSave = (newContent) => {
    setContent(newContent);
    console.log('Document saved:', newContent);
  };

  return (
    <div style={{ padding: '20px', height: '100%' }}>
      <DocumentEditor
        {...args}
        docId={MOCK_DOC_ID}
        onSave={handleSave}
        onExportPdf={exportPdfRef}
      />
    </div>
  );
};

export const LightMode = Template.bind({});
LightMode.args = {
  darkMode: false,
};
LightMode.parameters = {
  docs: {
    description: {
      story: 'The editor in light mode with all formatting tools available.',
    },
  },
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  darkMode: true,
};
DarkMode.parameters = {
  backgrounds: { default: 'dark' },
  docs: {
    description: {
      story: 'The editor in dark mode for comfortable writing in low-light environments.',
    },
  },
};

export const WithInitialContent = (args) => {
  const [content, setContent] = useState([
    {
      type: 'heading',
      props: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to Nano Editor', styles: {} }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ', styles: {} },
        { type: 'text', text: 'rich text editor', styles: { bold: true } },
        { type: 'text', text: ' with AI-powered writing assistance.', styles: {} },
      ],
    },
    {
      type: 'bulletListItem',
      content: [{ type: 'text', text: 'Format text with bold, italic, underline', styles: {} }],
    },
    {
      type: 'bulletListItem',
      content: [{ type: 'text', text: 'Use AI to rewrite or continue writing', styles: {} }],
    },
    {
      type: 'bulletListItem',
      content: [{ type: 'text', text: 'Export to PDF or Markdown', styles: {} }],
    },
  ]);
  const exportPdfRef = useRef(null);

  const handleSave = (newContent) => {
    setContent(newContent);
    console.log('Document saved:', newContent);
  };

  return (
    <div style={{ padding: '20px', height: '100%' }}>
      <DocumentEditor
        {...args}
        docId={MOCK_DOC_ID}
        onSave={handleSave}
        onExportPdf={exportPdfRef}
      />
    </div>
  );
};
WithInitialContent.args = {
  darkMode: false,
};
WithInitialContent.parameters = {
  docs: {
    description: {
      story: 'The editor pre-populated with sample content to demonstrate formatting capabilities.',
    },
  },
};
