import { TextField } from '@mui/material';

export const TextInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className={className}
      fullWidth
      size="small"
      {...props}
    />
  );
};
