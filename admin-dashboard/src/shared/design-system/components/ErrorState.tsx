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
      <Box sx={{ color: 'error.main', '& .MuiSvgIcon-root': { fontSize: { xs: 36, sm: 48 } } }}>
        {icon ?? <ErrorOutline sx={{ fontSize: 'inherit' }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
          {description}
        </Typography>
      )}
      {onRetry && (
        <Button variant="contained" onClick={onRetry} size="medium">
          {retryLabel}
        </Button>
      )}
    </Stack>
  );
}

export default ErrorState;