import { useState, useEffect } from 'react';
import { PostCreator } from './PostCreator';
import { PostSettings as PostSettingsThemeable } from './PostSettings.themeable';
import './PostCreator.css';

export default {
  title: 'Components/PostCreator',
  component: PostCreator,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An AI-powered social media post creator that generates multiple variations of posts using Chrome\'s built-in AI APIs. Supports different tones, styles, and formats. Use the "UI Theme" toolbar button to switch between Native and Mantine UI.',
      },
    },
  },
};

// Mock entry ID
const MOCK_ENTRY_ID = 'storybook-demo-entry';

const Template = (args, context) => {
  const [currentEntryId, setCurrentEntryId] = useState(MOCK_ENTRY_ID);
  const [postSettings, setPostSettings] = useState(null);
  const uiTheme = context.globals.uiTheme || 'native';

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
      {/* UI Theme Banner */}
      <div style={{
        padding: '12px 20px',
        background: {
          mantine: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          mui: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          antd: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          shadcn: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
          tailwind: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
        }[uiTheme],
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🎨</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>
              UI Theme: {{
                mantine: 'Mantine UI',
                mui: 'Material-UI',
                antd: 'Ant Design',
                shadcn: 'shadcn/ui',
                tailwind: 'Tailwind CSS'
              }[uiTheme]}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {{
                mantine: 'Modern, polished components',
                mui: 'Google Material Design',
                antd: 'Enterprise UI from Alibaba',
                shadcn: 'Radix UI + Tailwind',
                tailwind: 'Utility-first CSS'
              }[uiTheme]}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Use the toolbar above to switch themes →
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <PostCreator
          {...args}
          currentEntryId={currentEntryId}
          onEntrySaved={handleEntrySaved}
          onNewEntry={handleNewEntry}
          onSettingsExport={setPostSettings}
          uiTheme={uiTheme}
        />
      </div>
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


// Story specifically for demonstrating UI theme switching on PostSettings
export const PostSettingsThemeDemo = (args, context) => {
  const [apiMode, setApiMode] = useState('writer');
  const [tone, setTone] = useState('neutral');
  const [format, setFormat] = useState('markdown');
  const [length, setLength] = useState('short');
  const [style, setStyle] = useState('default');
  const [customStyle, setCustomStyle] = useState('');
  const [useEmoticons, setUseEmoticons] = useState(false);
  const [stream, setStream] = useState(true);
  const [temperature, setTemperature] = useState('0.7');
  const [topP, setTopP] = useState('0.9');
  const [seed, setSeed] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  
  const uiTheme = context.globals.uiTheme || 'native';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px' }}>
      {/* Header */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 30px',
        padding: '30px',
        background: uiTheme === 'mantine' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
          🎨 UI Theme Switcher Demo
        </h1>
        <p style={{ margin: '0 0 20px 0', fontSize: '16px', opacity: 0.95 }}>
          Use the <strong>"UI Theme"</strong> dropdown in the toolbar above to switch between implementations
        </p>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Currently Using:</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            {uiTheme === 'mantine' ? '✨ Mantine UI' : '🎯 Native HTML/CSS'}
          </div>
        </div>
      </div>

      {/* PostSettings Component */}
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <PostSettingsThemeable
          apiMode={apiMode}
          setApiMode={setApiMode}
          tone={tone}
          setTone={setTone}
          format={format}
          setFormat={setFormat}
          length={length}
          setLength={setLength}
          style={style}
          setStyle={setStyle}
          customStyle={customStyle}
          setCustomStyle={setCustomStyle}
          useEmoticons={useEmoticons}
          setUseEmoticons={setUseEmoticons}
          stream={stream}
          setStream={setStream}
          temperature={temperature}
          setTemperature={setTemperature}
          topP={topP}
          setTopP={setTopP}
          seed={seed}
          setSeed={setSeed}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          isGenerating={false}
          uiTheme={uiTheme}
        />
      </div>

      {/* Instructions */}
      <div style={{
        maxWidth: '800px',
        margin: '30px auto 0',
        padding: '20px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '16px' }}>
          💡 How to Use
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px', lineHeight: '1.6' }}>
          <li>Look for the <strong>"UI Theme"</strong> dropdown in the Storybook toolbar (top of the page)</li>
          <li>Click it and select either "Native HTML/CSS" or "Mantine UI"</li>
          <li>Watch the form controls transform instantly!</li>
          <li>Try interacting with the controls - they work identically regardless of theme</li>
        </ol>
        <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '6px', fontSize: '13px', color: '#6b7280' }}>
          <strong>Note:</strong> The same component code works with both themes. In your app, you'd switch by changing one line in <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '3px' }}>src/ui/index.js</code>
        </div>
      </div>
    </div>
  );
};

PostSettingsThemeDemo.storyName = '🎨 UI Theme Switcher Demo';
PostSettingsThemeDemo.parameters = {
  docs: {
    description: {
      story: 'Interactive demo showing how the UI Theme toolbar switcher changes the appearance of form controls. Use the "UI Theme" dropdown in the toolbar above to switch between Native HTML/CSS and Mantine UI implementations.',
    },
  },
};
