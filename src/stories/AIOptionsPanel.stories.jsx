import { useState } from 'react';
import { AIOptionsPanel } from '../components/posts/AIOptionsPanel';
import '../components/posts/AIOptionsPanel.css';
import '../App.css';

export default {
  title: 'SocialPost/AIOptionsPanel',
  component: AIOptionsPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# AIOptionsPanel

A comprehensive settings panel for configuring AI generation options in the social post creator.

## Usage

\`\`\`jsx
import { AIOptionsPanel } from '@buzzer/media-library';

function MyComponent() {
  const [apiMode, setApiMode] = useState('writer');
  const [tone, setTone] = useState('neutral');
  // ... other state
  
  return (
    <AIOptionsPanel
      apiMode={apiMode}
      setApiMode={setApiMode}
      tone={tone}
      setTone={setTone}
      // ... other props
    />
  );
}
\`\`\`

## Props

All props have default values, making it easy to use in Storybook or standalone.

- \`apiMode\` - 'writer' | 'rewriter' (default: 'writer')
- \`tone\` - string (default: 'neutral')
- \`format\` - string (default: 'markdown')
- \`length\` - string (default: 'short')
- \`style\` - string (default: 'default')
- \`customStyle\` - string (default: '')
- \`useEmoticons\` - boolean (default: false)
- \`stream\` - boolean (default: true)
- \`temperature\` - string (default: '0.7')
- \`topP\` - string (default: '0.9')
- \`seed\` - string (default: '')
- \`isGenerating\` - boolean (default: false)
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 20, width: 600, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const Default = {
  render: () => {
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

    return (
      <AIOptionsPanel
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
      />
    );
  },
};

export const RewriterMode = {
  render: () => {
    const [apiMode, setApiMode] = useState('rewriter');
    const [tone, setTone] = useState('as-is');
    const [format, setFormat] = useState('as-is');
    const [length, setLength] = useState('as-is');
    const [style, setStyle] = useState('default');
    const [customStyle, setCustomStyle] = useState('');
    const [useEmoticons, setUseEmoticons] = useState(false);
    const [stream, setStream] = useState(true);
    const [temperature, setTemperature] = useState('0.7');
    const [topP, setTopP] = useState('0.9');
    const [seed, setSeed] = useState('');

    return (
      <AIOptionsPanel
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
      />
    );
  },
};

export const WithCustomStyle = {
  render: () => {
    const [apiMode, setApiMode] = useState('writer');
    const [tone, setTone] = useState('neutral');
    const [format, setFormat] = useState('markdown');
    const [length, setLength] = useState('short');
    const [style, setStyle] = useState('custom');
    const [customStyle, setCustomStyle] = useState('poetic and romantic');
    const [useEmoticons, setUseEmoticons] = useState(false);
    const [stream, setStream] = useState(true);
    const [temperature, setTemperature] = useState('0.7');
    const [topP, setTopP] = useState('0.9');
    const [seed, setSeed] = useState('');

    return (
      <AIOptionsPanel
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
      />
    );
  },
};

export const WithUILibrarySwitcher = {
  render: () => {
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
    const [uiLibrary, setUILibrary] = useState('native');

    return (
      <AIOptionsPanel
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
        uiLibrary={uiLibrary}
        setUILibrary={setUILibrary}
        availableLibraries={[
          { value: 'native', label: 'Native HTML' },
          { value: 'mantine', label: 'Mantine UI' },
        ]}
      />
    );
  },
};

export const Disabled = {
  render: () => {
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

    return (
      <AIOptionsPanel
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
        isGenerating={true}
      />
    );
  },
};
