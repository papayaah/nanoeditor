/**
 * Mantine UI Preset
 *
 * Provides Mantine-styled components for the writer package.
 * Requires @mantine/core as a peer dependency.
 *
 * Usage:
 * ```jsx
 * import { createPostCreator } from '@reactkits.dev/react-writer/posts';
 * import { createMantinePreset } from '@reactkits.dev/react-writer/posts';
 *
 * // Option 1: Use pre-created preset (requires @mantine/core)
 * import { mantinePreset } from '@reactkits.dev/react-writer/posts';
 * const PostCreator = createPostCreator(mantinePreset);
 *
 * // Option 2: Create preset dynamically
 * const preset = await createMantinePreset();
 * const PostCreator = createPostCreator(preset);
 * ```
 */

// Fallback components for when Mantine is not installed
const FallbackInput = ({ value, onChange, multiline, minRows, ...props }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={minRows || 4}
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      resize: 'none',
    }}
    {...props}
  />
);

const FallbackButton = ({ children, onClick, variant = 'primary', disabled, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      background: variant === 'primary' ? '#228be6' : '#e9ecef',
      color: variant === 'primary' ? 'white' : '#495057',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
    }}
    {...props}
  >
    {children}
  </button>
);

const FallbackCard = ({ children, ...props }) => (
  <div
    style={{
      padding: '16px',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      background: 'white',
    }}
    {...props}
  >
    {children}
  </div>
);

const FallbackBadge = ({ children, ...props }) => (
  <span
    style={{
      padding: '2px 8px',
      fontSize: '12px',
      borderRadius: '12px',
      background: '#e9ecef',
      color: '#495057',
    }}
    {...props}
  >
    {children}
  </span>
);

/**
 * Create Mantine preset dynamically (async)
 * Use this when you want to ensure Mantine is loaded before creating components
 */
export const createMantinePreset = async () => {
  try {
    const { Textarea, Button, Card, Badge } = await import('@mantine/core');

    return {
      Input: ({ value, onChange, multiline, minRows, ...props }) => (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minRows={minRows || 4}
          {...props}
        />
      ),
      Button: ({ children, onClick, variant = 'primary', disabled, ...props }) => (
        <Button
          onClick={onClick}
          disabled={disabled}
          variant={variant === 'primary' ? 'filled' : 'default'}
          {...props}
        >
          {children}
        </Button>
      ),
      Card: ({ children, ...props }) => (
        <Card withBorder padding="md" {...props}>
          {children}
        </Card>
      ),
      Badge: ({ children, ...props }) => <Badge {...props}>{children}</Badge>,
    };
  } catch (e) {
    console.warn('@mantine/core not installed, using fallback components');
    return {
      Input: FallbackInput,
      Button: FallbackButton,
      Card: FallbackCard,
      Badge: FallbackBadge,
    };
  }
};

// Synchronous preset using fallback components
// For actual Mantine components, use createMantinePreset() async function
export const mantinePreset = {
  Input: FallbackInput,
  Button: FallbackButton,
  Card: FallbackCard,
  Badge: FallbackBadge,
};

export default mantinePreset;
