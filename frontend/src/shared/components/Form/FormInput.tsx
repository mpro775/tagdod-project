import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface FormInputProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  label: string;
  rules?: Record<string, unknown>;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  rules,
  ...textFieldProps
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          label={label}
          error={!!error}
          helperText={error?.message as string}
          fullWidth
        />
      )}
    />
  );
};

