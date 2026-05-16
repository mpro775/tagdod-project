import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

export interface EmptyAnalyticsStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyAnalyticsState: React.FC<EmptyAnalyticsStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { isMobile } = useBreakpoint();

  return (
    <Card>
      <CardContent
        sx={{
          p: isMobile ? 3 : 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <BarChartIcon
          sx={{
            fontSize: isMobile ? 40 : 56,
            color: 'text.secondary',
            opacity: 0.5,
          }}
        />
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 400, mx: 'auto' }}
          >
            {description}
          </Typography>
        )}
        {actionLabel && onAction && (
          <Box sx={{ mt: 1 }}>
            <Button variant="outlined" size="small" onClick={onAction}>
              {actionLabel}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
