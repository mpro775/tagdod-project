import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { NotificationPriority } from '../types/notification.types';
import { getPriorityColor, getPriorityLabel } from './notificationHelpers';
import { useTranslation } from 'react-i18next';

interface NotificationPriorityChipProps extends Omit<ChipProps, 'label' | 'color'> {
  priority: NotificationPriority;
}

export const NotificationPriorityChip: React.FC<NotificationPriorityChipProps> = ({
  priority,
  ...chipProps
}) => {
  const { t } = useTranslation('notifications');
  const color = getPriorityColor(priority);
  const label = getPriorityLabel(priority, t);

  return (
    <Chip
      label={label}
      color={color as any}
      size="small"
      variant="outlined"
      {...chipProps}
    />
  );
};

