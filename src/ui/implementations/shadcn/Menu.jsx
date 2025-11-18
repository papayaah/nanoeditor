import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from './utils';

export const Menu = ({ 
  trigger,
  children,
  open,
  onClose,
  ...props 
}) => {
  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          sideOffset={4}
          {...props}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

export const MenuItem = ({ 
  children,
  onClick,
  disabled = false,
  ...props 
}) => {
  return (
    <DropdownMenuPrimitive.Item
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
};
