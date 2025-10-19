import React, { forwardRef } from 'react';
import { Button, ButtonProps, CircularProgress, Box } from '@mui/material';
import { useAccessibility } from '@/shared/hooks/useAccessibility';
import { useRTL } from '@/shared/hooks/useRTL';

interface AccessibleButtonProps extends Omit<ButtonProps, 'children' | 'variant'> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // eslint-disable-next-line no-unused-vars
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText = 'جاري التحميل...',
      description,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      disabled = false,
      startIcon,
      endIcon,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { useButtonAccessibility, useLoadingAccessibility } = useAccessibility();
    const { getRTLClassName } = useRTL();

    // Get accessibility props based on variant
    const { getButtonProps } = useButtonAccessibility();
    const { getLoadingProps } = useLoadingAccessibility(loading, loadingText);

    // Handle click with accessibility
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(event);
      }
    };

    // Handle keyboard events
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!disabled && !loading && onClick) {
          onClick(event as any);
        }
      }
      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    // Get button color based on variant
    const getButtonColor = () => {
      switch (variant) {
        case 'danger':
          return 'error';
        case 'success':
          return 'success';
        case 'warning':
          return 'warning';
        case 'secondary':
          return 'secondary';
        default:
          return 'primary';
      }
    };

    // Get button variant
    const getButtonVariant = () => {
      return variant === 'secondary' ? 'outlined' : 'contained';
    };


    const buttonProps = getButtonProps();
    const loadingProps = getLoadingProps();

    return (
      <Button
        ref={ref as any}
        variant={getButtonVariant()}
        color={getButtonColor()}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        startIcon={loading ? undefined : startIcon}
        endIcon={loading ? undefined : endIcon}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={getRTLClassName('accessible-button')}
        sx={{
          position: 'relative',
          minHeight: size === 'large' ? 48 : size === 'small' ? 32 : 40,
          ...props.sx,
        }}
        {...buttonProps}
        {...props}
        {...(loading && loadingProps)}
        aria-describedby={description ? `${props.id || 'button'}-description` : undefined}
      >
        {loading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} color="inherit" />
            <span className="sr-only">{loadingText}</span>
          </Box>
        ) : (
          children
        )}
        
        {description && (
          <span
            id={`${props.id || 'button'}-description`}
            className="sr-only"
          >
            {description}
          </span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
