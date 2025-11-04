import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { formatNumber } from '@/shared/utils/formatters';
import { getCardPadding } from '../utils/responsive';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
}) => {
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardContent sx={{ p: cardPadding }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
            <Typography 
              variant={breakpoint.isXs ? 'h6' : breakpoint.isSm ? 'h5' : 'h4'} 
              fontWeight="bold" 
              sx={{ 
                my: breakpoint.isXs ? 0.5 : 1,
                fontSize: breakpoint.isXs ? '1.25rem' : breakpoint.isSm ? '1.5rem' : undefined,
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
            {change !== undefined && (
              <Chip
                icon={isPositive 
                  ? <TrendingUp sx={{ fontSize: breakpoint.isXs ? 12 : breakpoint.isSm ? 14 : 16 }} /> 
                  : <TrendingDown sx={{ fontSize: breakpoint.isXs ? 12 : breakpoint.isSm ? 14 : 16 }} />
                }
                label={`${isPositive ? '+' : ''}${formatNumber(change, 'en', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
                color={isPositive ? 'success' : 'error'}
                size="small"
                sx={{ 
                  fontSize: breakpoint.isXs ? '0.625rem' : breakpoint.isSm ? '0.6875rem' : undefined,
                  height: breakpoint.isXs ? 20 : breakpoint.isSm ? 22 : 24,
                  mt: breakpoint.isXs ? 0.5 : 1,
                }}
              />
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                backgroundColor: `${color}.light`,
                borderRadius: 2,
                p: breakpoint.isXs ? 0.75 : breakpoint.isSm ? 1 : 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: breakpoint.isXs ? 36 : breakpoint.isSm ? 40 : 48,
                minHeight: breakpoint.isXs ? 36 : breakpoint.isSm ? 40 : 48,
                flexShrink: 0,
                '& svg': {
                  fontSize: breakpoint.isXs ? '1.25rem' : breakpoint.isSm ? '1.5rem' : '2rem',
                },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

