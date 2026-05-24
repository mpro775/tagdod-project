import { LinearProgress, Skeleton, Stack, Typography } from '@mui/material';

export interface LoadingStateProps {
  title?: string;
  rows?: number;
  variant?: 'linear' | 'skeleton';
}

export function LoadingState({
  title = 'جاري التحميل...',
  rows = 4,
  variant = 'linear',
}: LoadingStateProps) {
  return (
    <Stack spacing={2} sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      {variant === 'linear' ? (
        <LinearProgress />
      ) : (
        <Stack spacing={1}>
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default LoadingState;
