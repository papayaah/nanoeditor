import { FormControl, InputLabel, Select as MuiSelect, MenuItem } from '@mui/material';

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  disabled = false,
  className = '',
  ...props 
}) => {
  const labelId = `select-${label?.toString().replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <FormControl fullWidth size="small" disabled={disabled} className={className}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect
        labelId={labelId}
        value={value}
        label={label}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};
