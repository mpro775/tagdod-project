import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { designRadius, designShadows } from '../tokens';

export interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

const paddingMap = {
  none: 0,
  sm: 1.5,
  md: 2.5,
  lg: 3,
} as const;

export function SectionCard({
  title,
  description,
  action,
  children,
  padding = 'md',
  elevated = false,
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${designRadius.lg}px`,
        boxShadow: elevated ? designShadows.card : 'none',
        overflow: 'hidden',
      }}
    >
      {hasHeader && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Stack spacing={0.5}>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Stack>
          {action}
        </Stack>
      )}
      <CardContent sx={{ p: paddingMap[padding], '&:last-child': { pb: paddingMap[padding] } }}>
        {children}
      </CardContent>
    </Card>
  );
}

export default SectionCard;
