import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'حدث خطأ أثناء تحميل البيانات',
  description,
  icon,
  retryLabel = 'إعادة المحاولة',
  onRetry,
}: ErrorStateProps) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <Box sx={{ color: 'error.main' }}>{icon ?? <ErrorOutline sx={{ fontSize: 48 }} />}</Box>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
          {description}
        </Typography>
      )}
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </Stack>
  );
}

export default ErrorState;
