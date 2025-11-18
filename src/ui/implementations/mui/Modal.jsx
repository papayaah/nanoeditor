import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export const Modal = ({ 
  isOpen,
  onClose,
  title,
  children,
  footer,
  ...props 
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      {...props}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {footer && <DialogActions>{footer}</DialogActions>}
    </Dialog>
  );
};
