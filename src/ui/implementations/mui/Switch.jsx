import { Switch as MuiSwitch, FormControlLabel } from '@mui/material';

export const Switch = ({ 
  label,
  checked, 
  onChange, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const switchElement = (
    <MuiSwitch
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      size="small"
      {...props}
    />
  );

  if (label) {
    return (
      <FormControlLabel
        control={switchElement}
        label={label}
        className={className}
      />
    );
  }

  return <div className={className}>{switchElement}</div>;
};
