import { Modal as AntModal } from 'antd';

export const Modal = ({ 
  isOpen,
  onClose,
  title,
  children,
  footer,
  ...props 
}) => {
  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      title={title}
      footer={footer}
      {...props}
    >
      {children}
    </AntModal>
  );
};
