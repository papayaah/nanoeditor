import { Input } from 'antd';

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
    <div className={className}>
      {label && (
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          {label}
        </label>
      )}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};
