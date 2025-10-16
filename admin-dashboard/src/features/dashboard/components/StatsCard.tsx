import React from 'react';
import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  growth?: number;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  growth, 
  color,
  subtitle 
}) => {
  const theme = useTheme();
  
  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const selectedColor = colorMap[color];

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${alpha(selectedColor, 0.2)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${selectedColor}, ${alpha(selectedColor, 0.6)})`,
        },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 500, fontSize: '0.85rem' }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{ 
                mb: 0.5,
                background: `linear-gradient(135deg, ${selectedColor}, ${alpha(selectedColor, 0.7)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
            
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}

            {growth !== undefined && growth !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                {growth >= 0 ? (
                  <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: growth >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  من الفترة السابقة
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(selectedColor, 0.1)}, ${alpha(selectedColor, 0.2)})`,
              color: selectedColor,
              backdropFilter: 'blur(10px)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

