export const Menu = ({ 
  trigger,
  children,
  open,
  onClose,
  ...props 
}) => {
  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div className="absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" {...props}>
        <div className="py-1" role="menu">
          {children}
        </div>
      </div>
    </>
  );
};

export const MenuItem = ({ 
  children,
  onClick,
  disabled = false,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};
