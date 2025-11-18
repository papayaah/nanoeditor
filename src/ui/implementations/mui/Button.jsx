import { Button as MuiButton } from '@mui/material';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  // Map our variants to MUI variants
  const variantMap = {
    default: 'contained',
    secondary: 'outlined',
    ghost: 'text',
    danger: 'contained'
  };

  // Map our sizes to MUI sizes
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large'
  };

  return (
    <MuiButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      onClick={onClick}
      disabled={disabled}
      className={className}
      color={variant === 'danger' ? 'error' : variant === 'secondary' ? 'secondary' : 'primary'}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
