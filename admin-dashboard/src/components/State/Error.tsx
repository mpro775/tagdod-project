import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import { ErrorProps } from './types';

export const Error: React.FC<ErrorProps> = ({
  message = 'حدث خطأ غير متوقع',
  description,
  onRetry,
  error,
  showDetails = false,
  sx = {},
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        textAlign: 'center',
        ...sx,
      }}
    >
      <ErrorOutline
        sx={{
          fontSize: 80,
          color: 'error.main',
          mb: 2,
        }}
      />
      
      <Typography variant="h6" color="error" gutterBottom>
        {message}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
          {description}
        </Typography>
      )}

      {showDetails && error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>تفاصيل الخطأ:</strong>
          </Typography>
          <Typography variant="body2" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </Typography>
        </Alert>
      )}
      
      <Button
        variant="outlined"
        startIcon={<Refresh />}
        onClick={handleRetry}
        sx={{ mt: 1 }}
      >
        إعادة المحاولة
      </Button>
    </Box>
  );
};

export default Error;
