import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<SelectProps, 'name'> {
  name: string;
  label: string;
  options: readonly Option[];
  rules?: Record<string, unknown>;
  helperText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  options,
  rules,
  helperText,
  ...selectProps
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select 
            {...field} 
            {...selectProps} 
            label={label}
            value={field.value || ''}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || helperText) && (
            <FormHelperText>{error ? (error.message as string) : helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};
