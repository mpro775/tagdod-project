import React from 'react';
import { Box, CircularProgress, Typography, SxProps, Theme } from '@mui/material';
import { LoadingProps } from './types';

export const Loading: React.FC<LoadingProps> = ({
  message = 'جاري التحميل...',
  size = 'large',
  fullScreen = false,
  sx = {},
}) => {
  const containerSx: SxProps<Theme> = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        gap: 2,
      };

  const progressSize = size === 'large' ? 60 : size === 'medium' ? 40 : 24;

  return (
    <Box sx={{ ...containerSx, ...sx }}>
      <CircularProgress size={progressSize} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
