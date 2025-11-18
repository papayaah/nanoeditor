import { Switch as AntSwitch } from 'antd';

export const Switch = ({ 
  label,
  checked, 
  onChange, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <AntSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size="small"
        {...props}
      />
      {label && <span style={{ fontSize: '14px' }}>{label}</span>}
    </div>
  );
};
