import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  error?: Error;
  onReset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
            {t('error.unexpectedError', {defaultValue: 'حدث خطأ غير متوقع'})}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('error.pleaseTryAgainOrRefresh', {defaultValue: 'يرجى المحاولة مرة أخرى أو تحديث الصفحة'})}
        </Typography>
        {process.env.NODE_ENV === 'development' && error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
              {error.toString()}
            </Typography>
          </Box>
        )}
      </Alert>
      <Button variant="contained" onClick={onReset}>
        {t('error.tryAgain', {defaultValue: 'حاول مرة أخرى'})}
      </Button>
    </Box>
  );
};

