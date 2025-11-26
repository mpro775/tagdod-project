import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { NotificationCategory } from '../types/notification.types';
import { getCategoryLabel } from './notificationHelpers';
import { useTranslation } from 'react-i18next';

interface NotificationCategoryChipProps extends Omit<ChipProps, 'label'> {
  category: NotificationCategory;
}

export const NotificationCategoryChip: React.FC<NotificationCategoryChipProps> = ({
  category,
  ...chipProps
}) => {
  const { t } = useTranslation('notifications');
  const label = getCategoryLabel(category, t);

  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      color="primary"
      {...chipProps}
    />
  );
};

