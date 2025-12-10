import { forwardRef } from 'react';

/**
 * Tailwind CSS Preset
 *
 * Provides Tailwind-styled components for the writer package.
 * Uses Tailwind CSS classes with inline style fallbacks for environments without Tailwind.
 */

// Inline style fallbacks (used when Tailwind CSS is not available)
const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  resize: 'none',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const buttonBaseStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  fontWeight: '500',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  transition: 'background-color 0.2s, opacity 0.2s',
};

const buttonVariantStyles = {
  primary: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
    color: '#1f2937',
  },
  outline: {
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
};

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  backgroundColor: '#ffffff',
};

const badgeStyle = {
  padding: '2px 8px',
  fontSize: '12px',
  fontWeight: '500',
  borderRadius: '9999px',
  backgroundColor: '#f3f4f6',
  color: '#374151',
};

const Input = forwardRef(({ value, onChange, multiline, minRows, className = '', style = {}, ...props }, ref) => (
  <textarea
    ref={ref}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    style={{ ...inputStyle, ...style }}
    rows={minRows || 4}
    {...props}
  />
));
Input.displayName = 'TailwindInput';

const Button = ({ children, onClick, variant = 'primary', disabled, className = '', style = {}, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  };

  const inlineStyle = {
    ...buttonBaseStyle,
    ...buttonVariantStyles[variant] || buttonVariantStyles.primary,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      style={inlineStyle}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={`border border-gray-200 rounded-lg p-4 shadow-sm bg-white ${className}`}
    style={{ ...cardStyle, ...style }}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({ children, className = '', style = {}, ...props }) => (
  <span
    className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 ${className}`}
    style={{ ...badgeStyle, ...style }}
    {...props}
  >
    {children}
  </span>
);

export const tailwindPreset = {
  Input,
  Button,
  Card,
  Badge,
};

export default tailwindPreset;
