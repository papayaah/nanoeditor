import { Menu as MuiMenu, MenuItem as MuiMenuItem } from '@mui/material';

export const Menu = ({ 
  trigger,
  children,
  open,
  onClose,
  anchorEl,
  ...props 
}) => {
  return (
    <MuiMenu
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      {...props}
    >
      {children}
    </MuiMenu>
  );
};

export const MenuItem = ({ 
  children,
  onClick,
  disabled = false,
  ...props 
}) => {
  return (
    <MuiMenuItem
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </MuiMenuItem>
  );
};
