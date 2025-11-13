import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';
import { CheckCircle, Schedule, Error, Warning, Info } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { OrderStatus } from '../types/order.types';

interface OrderStatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: OrderStatus;
  showIcon?: boolean;
}

const orderStatusColors: Record<
  OrderStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  pending_payment: 'warning',
  confirmed: 'info',
  processing: 'primary',
  completed: 'success',
  on_hold: 'warning',
  cancelled: 'error',
  returned: 'info',
  refunded: 'error',
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle />;
    case 'processing':
      return <Schedule />;
    case 'on_hold':
      return <Warning />;
    case 'cancelled':
    case 'refunded':
    case 'returned':
      return <Error />;
    default:
      return <Info />;
  }
};

export const OrderStatusChip: React.FC<OrderStatusChipProps> = ({
  status,
  showIcon = true,
  size = 'small',
  variant = 'filled',
  ...props
}) => {
  const theme = useTheme();
  const { t } = useTranslation('orders');
  
  const chipColor = orderStatusColors[status];
  const borderColor = 
    chipColor === 'default'
      ? theme.palette.divider
      : theme.palette[chipColor]?.main || theme.palette.divider;
  
  return (
    <Chip
      label={t(`status.${status}`)}
      color={chipColor}
      icon={showIcon ? getStatusIcon(status) : undefined}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 'bold',
        ...(theme.palette.mode === 'dark' && variant === 'filled' && {
          // تحسين الوضوح في الوضع الداكن
          border: `1px solid ${borderColor}40`,
        }),
        ...props.sx,
      }}
      {...props}
    />
  );
};
