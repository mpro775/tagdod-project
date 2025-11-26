import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { NotificationChannel } from '../types/notification.types';
import { getChannelLabel, getChannelIcon } from './notificationHelpers';
import { useTranslation } from 'react-i18next';

interface NotificationChannelChipProps extends Omit<ChipProps, 'label' | 'icon'> {
  channel: NotificationChannel;
  showIcon?: boolean;
}

export const NotificationChannelChip: React.FC<NotificationChannelChipProps> = ({
  channel,
  showIcon = true,
  ...chipProps
}) => {
  const { t } = useTranslation('notifications');
  const label = getChannelLabel(channel, t);
  const icon = showIcon ? getChannelIcon(channel) : undefined;

  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      icon={icon}
      {...chipProps}
    />
  );
};

