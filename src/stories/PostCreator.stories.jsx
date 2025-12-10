import { useState } from 'react';
import { createPostCreator, PostCreator } from '../components/posts/createPostCreator';
import { tailwindPreset } from '../presets/tailwind';

export default {
  title: 'Posts/PostCreator',
  component: PostCreator,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The PostCreator component provides AI-powered social media post generation.
It uses Chrome's built-in AI Writer and Rewriter APIs (or custom adapters like OpenAI/Gemini).

## Features
- AI-powered post suggestions
- Multiple tone, format, and length options
- Streaming text generation
- Custom AI adapters support (BYOK)

## Usage

\`\`\`jsx
import { createPostCreator, tailwindPreset } from '@reactkits.dev/react-writer/posts';

const PostCreator = createPostCreator(tailwindPreset);

function App() {
  return <PostCreator currentEntryId={1} onEntrySaved={() => {}} />;
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    darkMode: {
      control: 'boolean',
      description: 'Enable dark mode styling',
    },
  },
};

// Default PostCreator (vanilla HTML)
export const Default = {
  render: () => {
    const [entryId] = useState(Date.now());
    return (
      <PostCreator
        currentEntryId={entryId}
        onEntrySaved={() => console.log('Entry saved')}
      />
    );
  },
};

// PostCreator with Tailwind preset
const TailwindPostCreator = createPostCreator(tailwindPreset);

export const WithTailwind = {
  render: () => {
    const [entryId] = useState(Date.now());
    return (
      <TailwindPostCreator
        currentEntryId={entryId}
        onEntrySaved={() => console.log('Entry saved')}
      />
    );
  },
};

// Dark mode
export const DarkMode = {
  render: () => {
    const [entryId] = useState(Date.now());
    return (
      <div style={{ background: '#1a1a1a', padding: '20px', minHeight: '400px' }}>
        <PostCreator
          currentEntryId={entryId}
          onEntrySaved={() => console.log('Entry saved')}
          darkMode={true}
        />
      </div>
    );
  },
};

// Custom components example
export const CustomComponents = {
  render: () => {
    const CustomPostCreator = createPostCreator({
      Input: ({ value, onChange, ...props }) => (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #6366f1',
            borderRadius: '8px',
            fontSize: '16px',
          }}
          rows={4}
          {...props}
        />
      ),
      Button: ({ children, onClick, ...props }) => (
        <button
          onClick={onClick}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          {...props}
        >
          {children}
        </button>
      ),
      Card: ({ children, ...props }) => (
        <div
          style={{
            padding: '16px',
            background: '#f0f0ff',
            borderRadius: '12px',
            border: '1px solid #c7d2fe',
          }}
          {...props}
        >
          {children}
        </div>
      ),
      Badge: ({ children, ...props }) => (
        <span
          style={{
            padding: '4px 8px',
            background: '#6366f1',
            color: 'white',
            borderRadius: '9999px',
            fontSize: '12px',
          }}
          {...props}
        >
          {children}
        </span>
      ),
    });

    const [entryId] = useState(Date.now());
    return (
      <CustomPostCreator
        currentEntryId={entryId}
        onEntrySaved={() => console.log('Entry saved')}
      />
    );
  },
};
