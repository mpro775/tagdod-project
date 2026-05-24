import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import { ArrowDownward, ArrowUpward, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface CompactKpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  tone?: 'blue' | 'green' | 'cyan' | 'amber' | 'neutral';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  loading?: boolean;
  linkTo?: string;
}

const toneMap = {
  blue: 'primary',
  green: 'success',
  cyan: 'info',
  amber: 'warning',
  neutral: 'text.secondary',
} as const;

const getToneColor = (theme: any, tone: CompactKpiCardProps['tone'] = 'blue') => {
  const mapped = toneMap[tone];
  if (tone === 'neutral') return theme.palette.text.secondary;
  return theme.palette[mapped]?.main ?? theme.palette.primary.main;
};

export const CompactKpiCard: React.FC<CompactKpiCardProps> = ({
  title,
  value,
  description,
  icon,
  tone = 'blue',
  trend,
  loading = false,
  linkTo,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const toneColor = getToneColor(theme, tone);
  const isClickable = Boolean(linkTo);

  const handleClick = () => {
    if (linkTo) navigate(linkTo);
  };

  const TrendIcon =
    trend?.direction === 'up' ? ArrowUpward : trend?.direction === 'down' ? ArrowDownward : Remove;

  return (
    <Card
      elevation={0}
      onClick={isClickable ? handleClick : undefined}
      sx={{
        minHeight: 118,
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.28 : 0.14),
        background:
          theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${alpha(toneColor, 0.06)}, transparent)`
            : `linear-gradient(180deg, ${alpha(toneColor, 0.04)}, transparent)`,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'border-color .2s ease, transform .2s ease, background .2s ease',
        '&:hover': isClickable
          ? {
              transform: 'translateY(-2px)',
              borderColor: alpha(toneColor, 0.34),
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} noWrap>
                {title}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="60%" height={32} />
              ) : (
                <Typography
                  variant="h5"
                  fontWeight={900}
                  sx={{ mt: 0.5, lineHeight: 1.1 }}
                  noWrap
                >
                  {value}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 38,
                height: 38,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1.5,
                color: toneColor,
                bgcolor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.14 : 0.1),
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          </Stack>

          {(description || trend) && !loading && (
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minHeight: 18 }}>
              {trend && (
                <Stack direction="row" spacing={0.25} alignItems="center">
                  <TrendIcon sx={{ fontSize: 14, color: toneColor }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: toneColor }}>
                    {trend.value}
                  </Typography>
                </Stack>
              )}
              {description && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {description}
                </Typography>
              )}
            </Stack>
          )}
          {loading && !description && !trend && <Skeleton variant="text" width="50%" height={14} />}
        </Stack>
      </CardContent>
    </Card>
  );
};