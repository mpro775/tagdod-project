import React from 'react';
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Box,
} from '@mui/material';
import { useController, Control } from 'react-hook-form';

interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormCheckboxGroupProps {
  name: string;
  control: Control<any>;
  label?: string;
  options: CheckboxOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  row?: boolean;
}

export const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({
  name,
  control,
  label,
  options,
  value,
  onChange,
  required = false,
  error = false,
  helperText,
  row = false,
}) => {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
  });

  const handleChange = (optionValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentValues = field.value || [];
    let newValues: string[];

    if (event.target.checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter((val: string) => val !== optionValue);
    }

    field.onChange(newValues);

    if (onChange) {
      onChange(newValues);
    }
  };

  const currentValues = value || field.value || [];
  const hasError = error || !!fieldError;

  return (
    <FormControl component="fieldset" error={hasError} fullWidth>
      {label && (
        <FormLabel component="legend" required={required}>
          {label}
        </FormLabel>
      )}
      <FormGroup row={row}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={currentValues.includes(option.value)}
                  onChange={handleChange(option.value)}
                  disabled={option.disabled}
                  size="small"
                />
              }
              label={option.label}
              sx={{
                minWidth: 'fit-content',
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                },
              }}
            />
          ))}
        </Box>
      </FormGroup>
      {(hasError || helperText) && (
        <FormHelperText>{fieldError?.message || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
