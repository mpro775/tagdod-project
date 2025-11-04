import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding } from '../utils/responsive';

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
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);

  const getChangeIcon = (changeValue?: number) => {
    if (!changeValue) return null;

    const iconSize = breakpoint.isXs ? 12 : breakpoint.isSm ? 14 : 16;
    if (changeValue > 0) {
      return <TrendingUp sx={{ fontSize: iconSize, color: 'success.main' }} />;
    } else if (changeValue < 0) {
      return <TrendingDown sx={{ fontSize: iconSize, color: 'error.main' }} />;
    } else {
      return <TrendingFlat sx={{ fontSize: iconSize, color: 'grey.500' }} />;
    }
  };

  const getChangeColor = (changeValue?: number) => {
    if (!changeValue) return 'text.secondary';

    if (changeValue > 0) return 'success.main';
    if (changeValue < 0) return 'error.main';
    return 'text.secondary';
  };

  const cardSizes = {
    small: { 
      height: breakpoint.isXs ? 95 : breakpoint.isSm ? 110 : 120, 
      padding: cardPadding 
    },
    medium: { 
      height: breakpoint.isXs ? 115 : breakpoint.isSm ? 130 : 140, 
      padding: cardPadding 
    },
    large: { 
      height: breakpoint.isXs ? 135 : breakpoint.isSm ? 150 : 160, 
      padding: cardPadding 
    },
  };

  const progressPercentage = target && current ? (current / target) * 100 : 0;

  return (
      <Card
        sx={{
          height: cardSizes[size].height,
          transition: breakpoint.isDesktop ? 'all 0.3s ease' : 'none',
          '&:hover': breakpoint.isDesktop ? {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          } : {},
        }}
      >
        <CardContent sx={{ p: cardSizes[size].padding, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: breakpoint.isXs ? 0.5 : 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                fontSize: breakpoint.isXs ? '0.6875rem' : breakpoint.isSm ? '0.75rem' : undefined,
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            {icon && (
              <Box
                sx={{
                  width: breakpoint.isXs 
                    ? (size === 'small' ? 24 : size === 'medium' ? 28 : 32) 
                    : breakpoint.isSm 
                    ? (size === 'small' ? 28 : size === 'medium' ? 32 : 36) 
                    : (size === 'small' ? 32 : 40),
                  height: breakpoint.isXs 
                    ? (size === 'small' ? 24 : size === 'medium' ? 28 : 32) 
                    : breakpoint.isSm 
                    ? (size === 'small' ? 28 : size === 'medium' ? 32 : 36) 
                    : (size === 'small' ? 32 : 40),
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${color}.lighter`,
                  color: `${color}.main`,
                  flexShrink: 0,
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
            sx={{ 
              mb: breakpoint.isXs ? 0.5 : 1, 
              flexGrow: 1,
              fontSize: breakpoint.isXs 
                ? (size === 'small' ? '0.9375rem' : size === 'medium' ? '1.125rem' : '1.375rem')
                : breakpoint.isSm 
                ? (size === 'small' ? '1rem' : size === 'medium' ? '1.25rem' : '1.5rem')
                : undefined,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: breakpoint.isXs ? 0.5 : 1,
                fontSize: breakpoint.isXs ? '0.6875rem' : breakpoint.isSm ? '0.75rem' : undefined,
                lineHeight: 1.2,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Progress Bar */}
          {showProgress && target && (
            <Box sx={{ mb: breakpoint.isXs ? 0.5 : 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.625rem' : breakpoint.isSm ? '0.6875rem' : undefined }}
                >
                  {t('kpi.progressToTarget')}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.625rem' : breakpoint.isSm ? '0.6875rem' : undefined }}
                >
                  {Math.round(progressPercentage)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: breakpoint.isXs ? 3 : breakpoint.isSm ? 4 : 6,
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
                sx={{ 
                  fontSize: breakpoint.isXs ? '0.6875rem' : breakpoint.isSm ? '0.75rem' : undefined,
                  lineHeight: 1.2,
                }}
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
