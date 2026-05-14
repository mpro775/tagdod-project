import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataQuality } from '../../types/analytics.types';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface DataQualityBadgeProps {
  dataQuality?: DataQuality;
  showDetails?: boolean;
}

const qualityConfig: Record<string, { color: 'success' | 'warning' | 'error' | 'info' | 'default'; icon: React.ReactNode }> = {
  real: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  mixed: { color: 'warning', icon: <WarningIcon fontSize="small" /> },
  estimated: { color: 'info', icon: <InfoIcon fontSize="small" /> },
  incomplete: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
};

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({
  dataQuality,
  showDetails = false,
}) => {
  const { t } = useTranslation('analytics');

  if (!dataQuality) {
    return null;
  }

  const config = qualityConfig[dataQuality.overall] || { color: 'default', icon: null };

  const badge = (
    <Chip
      icon={config.icon}
      label={t(`dataQuality.${dataQuality.overall}`, dataQuality.overall)}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );

  if (!showDetails || !dataQuality.notes.length) {
    return badge;
  }

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('dataQuality.title', 'Data Quality')}
          </Typography>
          {dataQuality.notes.map((note, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
              • {note}
            </Typography>
          ))}
        </Box>
      }
    >
      {badge}
    </Tooltip>
  );
};
