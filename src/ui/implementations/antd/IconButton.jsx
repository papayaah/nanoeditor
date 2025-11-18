import { Button as AntButton } from 'antd';

export const IconButton = ({ 
  children, 
  onClick, 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  const sizeMap = {
    sm: 'small',
    md: 'middle',
    lg: 'large'
  };

  return (
    <AntButton
      type="text"
      shape="circle"
      size={sizeMap[size]}
      onClick={onClick}
      disabled={disabled}
      className={className}
      icon={children}
      {...props}
    />
  );
};
