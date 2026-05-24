import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Inbox } from '@mui/icons-material';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'لا توجد بيانات حتى الآن',
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <Box sx={{ color: 'text.secondary' }}>{icon ?? <Inbox sx={{ fontSize: 48 }} />}</Box>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

export default EmptyState;
