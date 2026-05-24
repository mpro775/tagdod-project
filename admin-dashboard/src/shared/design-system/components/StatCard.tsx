import type { ReactNode } from 'react';
import { alpha, Box, Card, CardContent, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { ArrowDownward, ArrowUpward, Remove } from '@mui/icons-material';
import { designRadius, designShadows } from '../tokens';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  loading?: boolean;
}

const getToneColor = (theme: Theme, tone: NonNullable<StatCardProps['tone']>) => {
  if (tone === 'neutral') {
    return theme.palette.text.secondary;
  }
  return theme.palette[tone].main;
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  tone = 'primary',
  loading = false,
}: StatCardProps) {
  const theme = useTheme<Theme>();
  const toneColor = getToneColor(theme, tone);
  const TrendIcon =
    trend?.direction === 'up' ? ArrowUpward : trend?.direction === 'down' ? ArrowDownward : Remove;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.34 : 0.18),
        borderRadius: `${designRadius.lg}px`,
        boxShadow: theme.palette.mode === 'dark' ? 'none' : designShadows.card,
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {icon && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'grid',
                  placeItems: 'center',
                  color: toneColor,
                  bgcolor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                  borderRadius: `${designRadius.md}px`,
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}
          </Stack>

          {loading ? (
            <Skeleton variant="text" width="70%" height={42} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {value}
            </Typography>
          )}

          {trend && !loading && (
            <Stack direction="row" spacing={0.75} alignItems="center" color="text.secondary">
              <TrendIcon sx={{ fontSize: 16, color: toneColor }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {trend.value}
              </Typography>
              {trend.label && (
                <Typography variant="caption" color="text.secondary">
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
