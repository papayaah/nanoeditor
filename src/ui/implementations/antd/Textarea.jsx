import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

export const Textarea = forwardRef(({ 
  label, 
  value, 
  onChange, 
  placeholder,
  rows = 4,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const textareaRef = useRef(null);

  // Expose the textarea element to parent via ref
  useImperativeHandle(ref, () => ({
    get style() {
      return textareaRef.current?.resizableTextArea?.textArea?.style || {};
    },
    get scrollHeight() {
      return textareaRef.current?.resizableTextArea?.textArea?.scrollHeight || 0;
    }
  }));

  return (
    <div className={className}>
      {label && (
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          {label}
        </label>
      )}
      <TextArea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        autoSize={{ minRows: rows }}
        {...props}
      />
    </div>
  );
});
