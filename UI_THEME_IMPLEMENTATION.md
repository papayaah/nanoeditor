# UI Theme Implementation

## Overview

The PostCreator component is now UI theme agnostic and can work with different UI libraries.

## How It Works

### 1. UI Abstraction Layer

Located in `src/ui/`:
- `implementations/mantine/` - Mantine UI components
- `implementations/mui/` - Material-UI components
- `implementations/antd/` - Ant Design components
- `implementations/tailwind/` - Tailwind CSS components

### 2. Component Implementation

**PostCreator** (`src/components/posts/PostCreator.jsx`):
```javascript
import * as NativeUI from '../../ui/implementations/native';
import * as MantineUI from '../../ui/implementations/mantine';

export const PostCreator = ({ uiTheme = 'native', ... }) => {
  const UI = uiTheme === 'mantine' ? MantineUI : NativeUI;
  
  return (
    <UI.Button>...</UI.Button>
    <UI.Textarea>...</UI.Textarea>
    // etc.
  );
};
```

### 3. Storybook Demo

In Storybook, use the **"UI Theme"** toolbar dropdown to switch between:
- **Mantine UI** - Modern, polished components
- **Material-UI** - Google Material Design system
- **Ant Design** - Enterprise UI from Alibaba
- **Tailwind CSS** - Utility-first CSS framework

All PostCreator stories now support theme switching.

### 4. For Package Users

**Option A: Build-time selection** (recommended for production)

Edit `src/ui/index.js`:
```javascript
// Change this line to your preferred UI library
export * from './implementations/mantine';     // Requires @mantine/core
export * from './implementations/mui';         // Requires @mui/material
export * from './implementations/antd';        // Requires antd
export * from './implementations/tailwind';    // Requires Tailwind CSS setup
```

**Option B: Runtime selection** (for demos/testing)

Pass `uiTheme` prop:
```javascript
<PostCreator uiTheme="mantine" ... />
<PostCreator uiTheme="mui" ... />
<PostCreator uiTheme="antd" ... />
<PostCreator uiTheme="tailwind" ... />
```

## UI Components Available

- `Button` - Standard button
- `IconButton` - Button with icon only
- `Textarea` - Multi-line text input
- `TextInput` - Single-line text input
- `Select` - Dropdown select
- `Switch` - Toggle switch/checkbox
- `Menu` - Dropdown menu
- `Modal` - Modal dialog

## Benefits

1. **No vendor lock-in** - Switch UI libraries without rewriting components
2. **Gradual migration** - Migrate one component at a time
3. **Testing** - Test with different UI libraries
4. **Flexibility** - Use different UIs for different parts of your app
