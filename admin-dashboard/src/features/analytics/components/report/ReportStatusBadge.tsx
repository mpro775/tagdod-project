import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ReportStatus } from '../types/analytics.types';

interface ReportStatusBadgeProps {
  status: ReportStatus;
  size?: ChipProps['size'];
}

const statusConfig: Record<ReportStatus, { color: ChipProps['color']; icon?: React.ReactNode }> = {
  pending: { color: 'default' },
  processing: { color: 'info' },
  completed: { color: 'success' },
  failed: { color: 'error' },
  archived: { color: 'warning' },
};

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ status, size = 'small' }) => {
  const { t } = useTranslation('analytics');

  const config = statusConfig[status] || { color: 'default' };

  return (
    <Chip
      label={t(`reportStatus.${status}`, status)}
      color={config.color}
      size={size}
      variant="outlined"
    />
  );
};
