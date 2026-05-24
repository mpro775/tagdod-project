import type { ReactNode } from 'react';
import { alpha, Box, Card, CardContent, LinearProgress, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { ArrowDownward, ArrowUpward, OpenInNew, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { designRadius } from '../tokens';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  loading?: boolean;
  linkTo?: string;
  onClick?: () => void;
  description?: string;
  unit?: string;
  progress?: {
    value: number;
    label?: string;
    showValue?: boolean;
  };
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  compact?: boolean;
}

const getToneColor = (theme: Theme, tone: NonNullable<StatCardProps['tone']>) => {
  if (tone === 'neutral') return theme.palette.text.secondary;
  return theme.palette[tone].main;
};

export function StatCard({
  title,
  value,
  icon,
  tone = 'primary',
  loading = false,
  linkTo,
  onClick,
  description,
  unit,
  progress,
  trend,
  compact: _compact = true,
}: StatCardProps) {
  const theme = useTheme<Theme>();
  const navigate = useNavigate();
  const toneColor = getToneColor(theme, tone);
  const TrendIcon = trend?.direction === 'up' ? ArrowUpward : trend?.direction === 'down' ? ArrowDownward : Remove;
  const isClickable = Boolean(linkTo || onClick);

  const handleClick = () => {
    if (linkTo) navigate(linkTo);
    else if (onClick) onClick();
  };

  const iconBox = icon ? (
    <Box
      sx={{
        width: 36,
        height: 36,
        display: 'grid',
        placeItems: 'center',
        color: toneColor,
        bgcolor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.14 : 0.08),
        borderRadius: `${designRadius.md}px`,
        flexShrink: 0,
        '& .MuiSvgIcon-root': { fontSize: 20 },
      }}
    >
      {icon}
    </Box>
  ) : null;

  return (
    <Card
      elevation={0}
      onClick={isClickable ? handleClick : undefined}
      sx={{
        height: '100%',
        minHeight: 108,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.divider, 0.88),
        borderRadius: `${designRadius.lg}px`,
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(15,23,42,0.04)',
        ...(isClickable && {
          cursor: 'pointer',
          transition: theme.transitions.create(['borderColor', 'boxShadow', 'transform'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': {
            borderColor: alpha(toneColor, 0.35),
            boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
        }),
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.4 }}
            >
              {title}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {isClickable && !loading && (
                <OpenInNew sx={{ fontSize: 13, color: 'text.secondary', opacity: 0.5 }} />
              )}
              {iconBox}
            </Stack>
          </Stack>

          {loading ? (
            <Skeleton variant="text" width="60%" height={30} />
          ) : (
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: { xs: 22, sm: 26 },
                }}
              >
                {value}
              </Typography>
              {unit && (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {unit}
                </Typography>
              )}
            </Stack>
          )}

          {description && !loading && (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, fontSize: 11 }}>
              {description}
            </Typography>
          )}

          {progress && !loading && (
            <Box sx={{ mt: 0.25 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(Math.max(progress.value, 0), 100)}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(toneColor, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    bgcolor: toneColor,
                  },
                }}
              />
              {(progress.label || progress.showValue) && (
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.25 }}>
                  {progress.label && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {progress.label}
                    </Typography>
                  )}
                  {progress.showValue && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {Math.round(progress.value)}%
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          )}

          {trend && !loading && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: progress ? 0 : 'auto' }}>
              <TrendIcon sx={{ fontSize: 14, color: toneColor }} />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                {trend.value}
              </Typography>
              {trend.label && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {trend.label}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default StatCard;