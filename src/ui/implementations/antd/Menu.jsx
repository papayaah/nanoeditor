import { Dropdown, Menu as AntMenu } from 'antd';

export const Menu = ({ 
  trigger,
  children,
  open,
  onClose,
  ...props 
}) => {
  const items = [];
  
  // Convert children to Ant Design menu items format
  if (Array.isArray(children)) {
    children.forEach((child, index) => {
      if (child && child.props) {
        items.push({
          key: index,
          label: child.props.children,
          onClick: child.props.onClick,
          disabled: child.props.disabled
        });
      }
    });
  }

  return (
    <Dropdown
      menu={{ items }}
      open={open}
      onOpenChange={(visible) => !visible && onClose?.()}
      trigger={['click']}
      {...props}
    >
      {trigger}
    </Dropdown>
  );
};

export const MenuItem = ({ 
  children,
  onClick,
  disabled = false,
  ...props 
}) => {
  // This is just a placeholder for the Menu component to read
  return null;
};
