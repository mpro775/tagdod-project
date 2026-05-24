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
    <Stack
      alignItems="center"
      spacing={1.5}
      sx={{
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
        textAlign: 'center',
        width: '100%',
      }}
    >
      <Box sx={{ color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: { xs: 36, sm: 48 } } }}>
        {icon ?? <Inbox sx={{ fontSize: 'inherit' }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction} size="medium">
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

export default EmptyState;