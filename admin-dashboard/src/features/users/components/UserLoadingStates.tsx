import React from 'react';
import {
  Box,
  Skeleton,
  CircularProgress,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

interface UserLoadingStatesProps {
  type: 'list' | 'form' | 'card' | 'stats' | 'table';
  count?: number;
}

export const UserLoadingStates: React.FC<UserLoadingStatesProps> = ({ type, count = 1 }) => {
  switch (type) {
    case 'list':
      return (
        <Box sx={{ p: 2 }}>
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Skeleton variant="rounded" width={80} height={24} />
                  <Skeleton variant="rounded" width={100} height={24} />
                </Box>
                <Skeleton variant="text" width="30%" height={20} />
              </CardContent>
            </Card>
          ))}
        </Box>
      );

    case 'form':
      return (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid component="div" size={{ xs: 12, sm: 6 }} key={index}>
                <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="100%" height={56} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Skeleton variant="rounded" width={120} height={40} />
            <Skeleton variant="rounded" width={120} height={40} />
          </Box>
        </Box>
      );

    case 'card':
      return (
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="50%" height={20} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </CardContent>
        </Card>
      );

    case 'stats':
      return (
        <Grid container spacing={2}>
          {Array.from({ length: 7 }).map((_, index) => (
            <Grid component="div" size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={8} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width={80} height={24} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );

    case 'table':
      return (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Box>
          {Array.from({ length: count }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Skeleton variant="text" width="15%" height={40} />
              <Skeleton variant="text" width="20%" height={40} />
              <Skeleton variant="text" width="15%" height={40} />
              <Skeleton variant="text" width="15%" height={40} />
              <Skeleton variant="text" width="20%" height={40} />
              <Skeleton variant="text" width="15%" height={40} />
            </Box>
          ))}
        </Box>
      );

    default:
      return null;
  }
};

// Loading overlay component
export const UserLoadingOverlay: React.FC<{
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}> = ({ loading, message = 'جاري التحميل...', children }) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

// Progress bar component
export const UserProgressBar: React.FC<{
  progress: number;
  message?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}> = ({ progress, message, color = 'primary' }) => {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {message}
        </Typography>
      )}
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {Math.round(progress)}%
      </Typography>
    </Box>
  );
};

// Skeleton for user avatar
export const UserAvatarSkeleton: React.FC<{
  size?: number;
  variant?: 'circular' | 'rounded' | 'rectangular';
}> = ({ size = 40, variant = 'circular' }) => {
  return <Skeleton variant={variant} width={size} height={size} />;
};

// Skeleton for user name
export const UserNameSkeleton: React.FC<{
  width?: string | number;
  height?: number;
}> = ({ width = '60%', height = 24 }) => {
  return <Skeleton variant="text" width={width} height={height} />;
};

// Skeleton for user phone
export const UserPhoneSkeleton: React.FC<{
  width?: string | number;
  height?: number;
}> = ({ width = '40%', height = 20 }) => {
  return <Skeleton variant="text" width={width} height={height} />;
};
