import { useState } from 'react';
import { AIAssistantToggle } from '../components/posts/AIAssistantToggle';
import '../components/posts/AIAssistantToggle.css';
import '../App.css';

export default {
  title: 'SocialPost/AIAssistantToggle',
  component: AIAssistantToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# AIAssistantToggle

A toggle button component for showing/hiding the AI options panel in the social post creator.

## Usage

\`\`\`jsx
import { AIAssistantToggle } from '@buzzer/media-library';

function MyComponent() {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <AIAssistantToggle 
      isActive={isActive}
      onToggle={() => setIsActive(!isActive)}
    />
  );
}
\`\`\`

## Props

- \`isActive\` (boolean, default: false) - Whether the AI panel is currently visible
- \`onToggle\` (function, required) - Callback when button is clicked
- \`disabled\` (boolean, default: false) - Whether the button is disabled
        `,
      },
    },
  },
};

export const Default = {
  render: () => {
    const [isActive, setIsActive] = useState(false);
    return (
      <AIAssistantToggle 
        isActive={isActive}
        onToggle={() => setIsActive(!isActive)}
      />
    );
  },
};

export const Active = {
  render: () => {
    const [isActive, setIsActive] = useState(true);
    return (
      <AIAssistantToggle 
        isActive={isActive}
        onToggle={() => setIsActive(!isActive)}
      />
    );
  },
};

export const Disabled = {
  render: () => (
    <AIAssistantToggle 
      isActive={false}
      onToggle={() => {}}
      disabled={true}
    />
  ),
};

export const DisabledActive = {
  render: () => (
    <AIAssistantToggle 
      isActive={true}
      onToggle={() => {}}
      disabled={true}
    />
  ),
};
