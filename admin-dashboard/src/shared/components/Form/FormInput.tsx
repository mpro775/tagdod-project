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
      render={({ field, fieldState: { error } }) => {
        const { onChange: propOnChange, ...restTextFieldProps } = textFieldProps;
        const isNumberInput = textFieldProps.type === 'number';
        const { onChange, value, ref, ...restField } = field;

        return (
          <TextField
            {...restTextFieldProps}
            {...restField}
            inputRef={ref}
            name={name}
            label={label}
            error={!!error}
            helperText={error?.message as string}
            fullWidth
            value={value ?? ''}
            onChange={(event) => {
              propOnChange?.(event);

              if (!isNumberInput) {
                onChange(event);
                return;
              }

              const inputValue = event.target.value;
              if (inputValue === '') {
                onChange(undefined);
                return;
              }

              const target = event.target as HTMLInputElement;
              const numericValue = target.valueAsNumber;
              if (Number.isNaN(numericValue)) {
                onChange(undefined);
                return;
              }

              onChange(numericValue);
            }}
          />
        );
      }}
    />
  );
};
