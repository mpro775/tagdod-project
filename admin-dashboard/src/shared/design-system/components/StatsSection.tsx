import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

export interface StatsSectionProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function StatsSection({ title, subtitle, action, children }: StatsSectionProps) {
  return (
    <Stack spacing={1.5}>
      {(title || action) && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <div>
            {title && (
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </div>
          {action}
        </Stack>
      )}
      {children}
    </Stack>
  );
}

export default StatsSection;