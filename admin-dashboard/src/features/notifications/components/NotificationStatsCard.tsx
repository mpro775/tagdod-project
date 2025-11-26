import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

interface NotificationStatsCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color?: string;
  isLoading?: boolean;
}

export const NotificationStatsCard: React.FC<NotificationStatsCardProps> = React.memo(({
  icon,
  value,
  label,
  color,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
          <Skeleton variant="text" height={isMobile ? 30 : 40} />
          <Skeleton variant="text" height={isMobile ? 16 : 20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <Box
            sx={{
              mr: 1,
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              color: color || theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{
              fontWeight: 600,
              fontSize: isMobile ? '1rem' : undefined,
              color: color,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
});

NotificationStatsCard.displayName = 'NotificationStatsCard';

