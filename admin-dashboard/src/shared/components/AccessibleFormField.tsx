import React, { forwardRef, useState } from 'react';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Switch,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import { useAccessibility } from '@/shared/hooks/useAccessibility';
import { useRTL } from '@/shared/hooks/useRTL';

interface AccessibleFormFieldProps extends Omit<TextFieldProps, 'error'> {
  label: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  description?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export const AccessibleFormField = forwardRef<HTMLDivElement, AccessibleFormFieldProps>(
  (
    {
      label,
      error = false,
      errorMessage,
      helperText,
      required = false,
      description,
      variant = 'outlined',
      size = 'medium',
      fullWidth = true,
      disabled = false,
      readOnly = false,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      id,
      ...props
    },
    ref
  ) => {
    const { useFormFieldAccessibility } = useAccessibility();
    const { isRTL, getTextAlign } = useRTL();
    
    const [isFocused, setIsFocused] = useState(false);
    const [hasBeenTouched, setHasBeenTouched] = useState(false);

    // Generate unique ID if not provided
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const descriptionId = `${fieldId}-description`;

    // Get accessibility props
    const {
      isFocused: accessibilityFocused,
      hasBeenTouched: accessibilityTouched,
      handleFocus: accessibilityHandleFocus,
      handleBlur: accessibilityHandleBlur,
      getAriaProps,
      getErrorProps,
    } = useFormFieldAccessibility(fieldId, error);

    // Handle focus
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      accessibilityHandleFocus();
      if (onFocus) {
        onFocus(event);
      }
    };

    // Handle blur
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasBeenTouched(true);
      accessibilityHandleBlur();
      if (onBlur) {
        onBlur(event);
      }
    };

    // Get aria props
    const ariaProps = getAriaProps();
    const errorProps = getErrorProps();

    // Get helper text
    const getHelperText = () => {
      if (error && errorMessage) {
        return errorMessage;
      }
      return helperText;
    };

    // Get helper text props
    const getHelperTextProps = () => {
      if (error && errorMessage) {
        return {
          ...errorProps,
          error: true,
        };
      }
      return {};
    };

    return (
      <FormControl
        ref={ref}
        fullWidth={fullWidth}
        disabled={disabled}
        required={required}
        error={error}
        sx={{
          textAlign: getTextAlign(),
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        <TextField
          id={fieldId}
          label={label}
          type={type}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          error={error}
          helperText={getHelperText()}
          FormHelperTextProps={getHelperTextProps()}
          InputProps={{
            readOnly,
            'aria-describedby': [
              description ? descriptionId : '',
              error && errorMessage ? errorId : '',
              helperText && !error ? `${fieldId}-helper` : '',
            ].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error,
            'aria-required': required,
            ...ariaProps,
          }}
          InputLabelProps={{
            htmlFor: fieldId,
            required,
          }}
          sx={{
            '& .MuiInputBase-input': {
              textAlign: getTextAlign(),
            },
            '& .MuiInputLabel-root': {
              textAlign: getTextAlign(),
            },
            '& .MuiFormHelperText-root': {
              textAlign: getTextAlign(),
            },
          }}
          {...props}
        />
        
        {/* Hidden description for screen readers */}
        {description && (
          <Typography
            id={descriptionId}
            variant="caption"
            className="sr-only"
          >
            {description}
          </Typography>
        )}
        
        {/* Error message for screen readers */}
        {error && errorMessage && (
          <Typography
            id={errorId}
            variant="caption"
            color="error"
            className="sr-only"
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </Typography>
        )}
        
        {/* Helper text for screen readers */}
        {helperText && !error && (
          <Typography
            id={`${fieldId}-helper`}
            variant="caption"
            className="sr-only"
          >
            {helperText}
          </Typography>
        )}
      </FormControl>
    );
  }
);

AccessibleFormField.displayName = 'AccessibleFormField';

// Accessible Checkbox Component
interface AccessibleCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  id?: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  required = false,
  description,
  id,
}) => {
  const { isRTL, getTextAlign } = useRTL();
  const fieldId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `${fieldId}-description`;

  return (
    <FormControlLabel
      control={
        <Checkbox
          id={fieldId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          required={required}
          inputProps={{
            'aria-describedby': description ? descriptionId : undefined,
            'aria-required': required,
          }}
        />
      }
      label={label}
      htmlFor={fieldId}
      sx={{
        textAlign: getTextAlign(),
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    />
  );
};

// Accessible Switch Component
interface AccessibleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  id?: string;
}

export const AccessibleSwitch: React.FC<AccessibleSwitchProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  description,
  id,
}) => {
  const { isRTL, getTextAlign } = useRTL();
  const fieldId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `${fieldId}-description`;

  return (
    <FormControlLabel
      control={
        <Switch
          id={fieldId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          inputProps={{
            'aria-describedby': description ? descriptionId : undefined,
          }}
        />
      }
      label={label}
      htmlFor={fieldId}
      sx={{
        textAlign: getTextAlign(),
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    />
  );
};

export default AccessibleFormField;
