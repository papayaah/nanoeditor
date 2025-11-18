import { IconButton as MuiIconButton } from '@mui/material';

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
    md: 'medium',
    lg: 'large'
  };

  return (
    <MuiIconButton
      size={sizeMap[size]}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </MuiIconButton>
  );
};
