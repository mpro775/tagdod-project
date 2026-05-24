import React from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { Refresh, AccessTime } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface DashboardHeroProps {
  title: string;
  subtitle?: string;
  lastUpdateLabel?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  period?: 'today' | 'weekly' | 'monthly' | 'custom';
  onPeriodChange?: (period: 'today' | 'weekly' | 'monthly' | 'custom') => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  title,
  subtitle,
  lastUpdateLabel,
  isRefreshing = false,
  onRefresh,
  period = 'monthly',
  onPeriodChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('dashboard');

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.12),
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(17, 28, 47, 0.96), rgba(13, 22, 38, 0.96))'
            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.primary.main, 0.01)})`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={{ xs: 1.5, md: 0 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              fontWeight={900}
              noWrap
              sx={{ lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
                noWrap
              >
                {subtitle}
              </Typography>
            )}
            {lastUpdateLabel && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <AccessTime sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {lastUpdateLabel}
                </Typography>
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {onPeriodChange && (
              <ToggleButtonGroup
                value={period}
                exclusive
                onChange={(_, v) => v && onPeriodChange(v)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  },
                }}
              >
                <ToggleButton value="today">
                  {t('hero.today', 'اليوم')}
                </ToggleButton>
                <ToggleButton value="weekly">
                  {t('hero.weekly', 'أسبوعي')}
                </ToggleButton>
                <ToggleButton value="monthly">
                  {t('hero.monthly', 'شهري')}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            {onRefresh && (
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={isRefreshing}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 1.5,
                }}
                aria-label={t('hero.refresh', 'تحديث')}
              >
                <Refresh
                  sx={{
                    fontSize: 18,
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};