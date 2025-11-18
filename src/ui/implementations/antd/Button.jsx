import { Button as AntButton } from 'antd';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  // Map our variants to Ant Design types
  const typeMap = {
    default: 'primary',
    secondary: 'default',
    ghost: 'text',
    danger: 'primary'
  };

  // Map our sizes to Ant Design sizes
  const sizeMap = {
    sm: 'small',
    md: 'middle',
    lg: 'large'
  };

  return (
    <AntButton
      type={typeMap[variant]}
      size={sizeMap[size]}
      onClick={onClick}
      disabled={disabled}
      className={className}
      danger={variant === 'danger'}
      {...props}
    >
      {children}
    </AntButton>
  );
};
