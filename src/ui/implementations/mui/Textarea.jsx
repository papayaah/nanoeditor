import { forwardRef } from 'react';
import { TextField } from '@mui/material';

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
  return (
    <TextField
      inputRef={ref}
      label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      multiline
      rows={rows}
      disabled={disabled}
      className={className}
      fullWidth
      size="small"
      {...props}
    />
  );
});
