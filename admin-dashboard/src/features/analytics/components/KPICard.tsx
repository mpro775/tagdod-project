import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  subtitle?: string;
  target?: number;
  current?: number;
  showProgress?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
  size = 'medium',
  subtitle,
  target,
  current,
  showProgress = false,
}) => {
  const getChangeIcon = (changeValue?: number) => {
    if (!changeValue) return null;

    if (changeValue > 0) {
      return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
    } else if (changeValue < 0) {
      return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
    } else {
      return <TrendingFlat sx={{ fontSize: 16, color: 'grey.500' }} />;
    }
  };

  const getChangeColor = (changeValue?: number) => {
    if (!changeValue) return 'text.secondary';

    if (changeValue > 0) return 'success.main';
    if (changeValue < 0) return 'error.main';
    return 'text.secondary';
  };

  const cardSizes = {
    small: { height: 120, padding: 2 },
    medium: { height: 140, padding: 3 },
    large: { height: 160, padding: 4 },
  };

  const progressPercentage = target && current ? (current / target) * 100 : 0;

  return (
    <Card
      sx={{
        height: cardSizes[size].height,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: cardSizes[size].padding, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: size === 'small' ? 32 : 40,
                height: size === 'small' ? 32 : 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}.lighter`,
                color: `${color}.main`,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {/* Main Value */}
        <Typography
          variant={size === 'small' ? 'h6' : size === 'medium' ? 'h5' : 'h4'}
          fontWeight="bold"
          sx={{ mb: 1, flexGrow: 1 }}
        >
          {value}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {/* Progress Bar */}
        {showProgress && target && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                التقدم نحو الهدف
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progressPercentage)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.100',
                '& .MuiLinearProgress-bar': {
                  bgcolor: progressPercentage >= 100 ? 'success.main' : 'primary.main',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {/* Change Indicator */}
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getChangeIcon(change)}
            <Typography
              variant="body2"
              color={getChangeColor(change)}
              fontWeight="medium"
            >
              {change > 0 ? '+' : ''}{change}%
              {changeLabel && ` ${changeLabel}`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
