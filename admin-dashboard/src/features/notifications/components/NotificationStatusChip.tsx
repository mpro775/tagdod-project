import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { NotificationStatus } from '../types/notification.types';
import { getStatusColor, getStatusLabel, getStatusIcon } from './notificationHelpers';
import { useTranslation } from 'react-i18next';

interface NotificationStatusChipProps extends Omit<ChipProps, 'label' | 'color' | 'icon'> {
  status: NotificationStatus;
  showIcon?: boolean;
}

export const NotificationStatusChip: React.FC<NotificationStatusChipProps> = ({
  status,
  showIcon = true,
  ...chipProps
}) => {
  const { t } = useTranslation('notifications');
  const color = getStatusColor(status);
  const label = getStatusLabel(status, t);
  const icon = showIcon ? getStatusIcon(status) : undefined;

  return (
    <Chip
      label={label}
      color={color as any}
      size="small"
      icon={icon}
      {...chipProps}
    />
  );
};

