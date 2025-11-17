import { useState, useEffect } from 'react';
import { PostCreator } from './PostCreator';
import './PostCreator.css';

export default {
  title: 'Components/PostCreator',
  component: PostCreator,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An AI-powered social media post creator that generates multiple variations of posts using Chrome\'s built-in AI APIs. Supports different tones, styles, and formats.',
      },
    },
  },
};

// Mock entry ID
const MOCK_ENTRY_ID = 'storybook-demo-entry';

const Template = (args) => {
  const [currentEntryId, setCurrentEntryId] = useState(MOCK_ENTRY_ID);
  const [postSettings, setPostSettings] = useState(null);

  const handleEntrySaved = () => {
    console.log('Entry saved');
  };

  const handleNewEntry = () => {
    const newId = `entry-${Date.now()}`;
    setCurrentEntryId(newId);
    console.log('New entry created:', newId);
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <PostCreator
        {...args}
        currentEntryId={currentEntryId}
        onEntrySaved={handleEntrySaved}
        onNewEntry={handleNewEntry}
        onSettingsExport={setPostSettings}
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
      story: 'The post creator in light mode. Enter text and press Cmd+Enter or click Generate to create AI-powered social media posts.',
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
      story: 'The post creator in dark mode for comfortable use in low-light environments.',
    },
  },
};

export const WithInstructions = (args) => {
  const [currentEntryId, setCurrentEntryId] = useState(MOCK_ENTRY_ID);
  const [postSettings, setPostSettings] = useState(null);

  const handleEntrySaved = () => {
    console.log('Entry saved');
  };

  const handleNewEntry = () => {
    const newId = `entry-${Date.now()}`;
    setCurrentEntryId(newId);
    console.log('New entry created:', newId);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '20px', 
        background: '#f0f9ff', 
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>How to Use Post Creator</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
          <li>Type your post idea in the text area</li>
          <li>Press <kbd>Cmd+Enter</kbd> or click "Generate" to create 3 AI variations</li>
          <li>Adjust settings in the sidebar (tone, style, format, etc.)</li>
          <li>Click "Regenerate" to create new variations with current settings</li>
          <li>Copy any suggestion to use in your social media</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          <strong>Note:</strong> This requires Chrome with built-in AI APIs enabled.
        </p>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <PostCreator
          {...args}
          currentEntryId={currentEntryId}
          onEntrySaved={handleEntrySaved}
          onNewEntry={handleNewEntry}
          onSettingsExport={setPostSettings}
        />
      </div>
    </div>
  );
};
WithInstructions.args = {
  darkMode: false,
};
WithInstructions.parameters = {
  docs: {
    description: {
      story: 'The post creator with usage instructions displayed above it.',
    },
  },
};

export const InteractiveDemo = (args) => {
  const [currentEntryId, setCurrentEntryId] = useState(MOCK_ENTRY_ID);
  const [postSettings, setPostSettings] = useState(null);
  const [savedEntries, setSavedEntries] = useState([]);

  const handleEntrySaved = () => {
    console.log('Entry saved');
    // In a real app, this would reload from IndexedDB
    setSavedEntries(prev => [...prev, { id: currentEntryId, timestamp: new Date() }]);
  };

  const handleNewEntry = () => {
    const newId = `entry-${Date.now()}`;
    setCurrentEntryId(newId);
    console.log('New entry created:', newId);
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <div style={{ 
        width: '250px', 
        borderRight: '1px solid #e5e7eb',
        padding: '20px',
        background: '#f9fafb'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Settings Preview</h3>
        {postSettings && (
          <div style={{ fontSize: '14px', color: '#374151' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>API Mode:</strong> {postSettings.apiMode}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Tone:</strong> {postSettings.tone}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Format:</strong> {postSettings.format}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Length:</strong> {postSettings.length}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Style:</strong> {postSettings.style}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Emoticons:</strong> {postSettings.useEmoticons ? 'Yes' : 'No'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Streaming:</strong> {postSettings.stream ? 'Yes' : 'No'}
            </div>
          </div>
        )}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Saved Entries</h4>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {savedEntries.length} entries saved
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <PostCreator
          {...args}
          currentEntryId={currentEntryId}
          onEntrySaved={handleEntrySaved}
          onNewEntry={handleNewEntry}
          onSettingsExport={setPostSettings}
        />
      </div>
    </div>
  );
};
InteractiveDemo.args = {
  darkMode: false,
};
InteractiveDemo.parameters = {
  docs: {
    description: {
      story: 'An interactive demo showing the post creator with a sidebar displaying current settings and saved entries count.',
    },
  },
};
