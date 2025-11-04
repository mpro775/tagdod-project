import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';
import { CheckCircle, Schedule, LocalShipping, Error, Warning, Info } from '@mui/icons-material';
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
  draft: 'default',
  pending_payment: 'warning',
  confirmed: 'info',
  payment_failed: 'error',
  processing: 'primary',
  ready_to_ship: 'secondary',
  shipped: 'info',
  out_for_delivery: 'primary',
  delivered: 'success',
  completed: 'success',
  on_hold: 'warning',
  cancelled: 'error',
  refunded: 'error',
  partially_refunded: 'warning',
  returned: 'error',
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
    case 'completed':
      return <CheckCircle />;
    case 'shipped':
    case 'out_for_delivery':
      return <LocalShipping />;
    case 'processing':
    case 'ready_to_ship':
      return <Schedule />;
    case 'cancelled':
    case 'refunded':
    case 'returned':
      return <Error />;
    case 'on_hold':
      return <Warning />;
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
  const { t } = useTranslation();
  
  const chipColor = orderStatusColors[status];
  const borderColor = 
    chipColor === 'default'
      ? theme.palette.divider
      : theme.palette[chipColor]?.main || theme.palette.divider;
  
  return (
    <Chip
      label={t(`orders.status.${status}`)}
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
