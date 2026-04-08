import React from 'react';
import { Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const NotificationPersonalizationHint: React.FC = () => {
  const { t } = useTranslation('notifications');

  return (
    <Alert severity="info">
      <Typography variant="body2">{t('forms.personalizationHint')}</Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
        {t('forms.personalizationExamples')}
      </Typography>
    </Alert>
  );
};
