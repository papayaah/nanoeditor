import { forwardRef } from 'react';
import { cn } from './utils';

export const Textarea = forwardRef(({ 
  label, 
  value, 
  onChange, 
  placeholder,
  rows = 4,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
        )}
        {...props}
      />
    </div>
  );
});
