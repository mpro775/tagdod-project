import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { EmptyProps } from './types';

export const Empty: React.FC<EmptyProps> = ({
  message = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي عناصر في هذه القائمة',
  actionLabel,
  onAction,
  icon: Icon = AddCircleOutline,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
        textAlign: 'center',
        ...sx,
      }}
    >
      <Icon
        sx={{
          fontSize: 80,
          color: 'text.disabled',
          mb: 2,
        }}
      />
      
      <Typography variant="h6" color="text.primary" gutterBottom>
        {message}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<Icon />}
          onClick={onAction}
          sx={{ mt: 1 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default Empty;
