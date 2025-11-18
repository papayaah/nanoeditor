import { Select as AntSelect } from 'antd';

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [],
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
      <AntSelect
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ width: '100%' }}
        options={options}
        {...props}
      />
    </div>
  );
};
