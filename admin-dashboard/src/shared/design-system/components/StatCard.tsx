import type { ReactNode } from 'react';
import { alpha, Box, Card, CardContent, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { ArrowDownward, ArrowUpward, OpenInNew, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  linkTo?: string;
  onClick?: () => void;
  description?: string;
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
  linkTo,
  onClick,
  description,
}: StatCardProps) {
  const theme = useTheme<Theme>();
  const navigate = useNavigate();
  const toneColor = getToneColor(theme, tone);
  const TrendIcon =
    trend?.direction === 'up' ? ArrowUpward : trend?.direction === 'down' ? ArrowDownward : Remove;
  const isClickable = Boolean(linkTo || onClick);

  const handleClick = () => {
    if (linkTo) {
      navigate(linkTo);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      elevation={0}
      onClick={isClickable ? handleClick : undefined}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.34 : 0.18),
        borderRadius: `${designRadius.lg}px`,
        boxShadow: theme.palette.mode === 'dark' ? 'none' : designShadows.card,
        ...(isClickable && {
          cursor: 'pointer',
          transition: theme.transitions.create(['borderColor', 'boxShadow', 'transform'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': {
            borderColor: alpha(toneColor, 0.5),
            boxShadow: designShadows.dropdown,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }),
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {isClickable && !loading && (
                <OpenInNew sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.6 }} />
              )}
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
          </Stack>

          {loading ? (
            <Skeleton variant="text" width="70%" height={42} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {value}
            </Typography>
          )}

          {description && !loading && (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
              {description}
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
