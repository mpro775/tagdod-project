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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface UserLoadingStatesProps {
  type: 'list' | 'form' | 'card' | 'stats' | 'table';
  count?: number;
}

export const UserLoadingStates: React.FC<UserLoadingStatesProps> = ({ type, count = 1 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  switch (type) {
    case 'list':
      return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {Array.from({ length: count }).map((_, index) => (
            <Card
              key={index}
              sx={{
                mb: 2,
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={isMobile ? 40 : 48}
                    height={isMobile ? 40 : 48}
                    sx={{ mr: { xs: 1, sm: 2 } }}
                  />
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Skeleton
                      variant="text"
                      width={isMobile ? '80%' : '60%'}
                      height={isMobile ? 20 : 24}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width={isMobile ? '60%' : '40%'}
                      height={isMobile ? 16 : 20}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Skeleton
                    variant="rounded"
                    width={isMobile ? 60 : 80}
                    height={isMobile ? 22 : 24}
                  />
                  <Skeleton
                    variant="rounded"
                    width={isMobile ? 80 : 100}
                    height={isMobile ? 22 : 24}
                  />
                </Box>
                <Skeleton
                  variant="text"
                  width={isMobile ? '50%' : '30%'}
                  height={isMobile ? 16 : 20}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      );

    case 'form':
      return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Skeleton
            variant="text"
            width={isMobile ? '60%' : '40%'}
            height={isMobile ? 28 : 32}
            sx={{ mb: 3 }}
          />
          <Grid container spacing={{ xs: 2, sm: 2 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid component="div" size={{ xs: 12, sm: 6 }} key={index}>
                <Skeleton
                  variant="text"
                  width={isMobile ? '40%' : '30%'}
                  height={isMobile ? 18 : 20}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={isMobile ? 48 : 56}
                />
              </Grid>
            ))}
          </Grid>
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Skeleton variant="rounded" width={isMobile ? '100%' : 120} height={isMobile ? 44 : 40} />
            <Skeleton variant="rounded" width={isMobile ? '100%' : 120} height={isMobile ? 44 : 40} />
          </Box>
        </Box>
      );

    case 'card':
      return (
        <Card
          sx={{
            height: '100%',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Skeleton
                variant="circular"
                width={isMobile ? 40 : 48}
                height={isMobile ? 40 : 48}
                sx={{ mr: { xs: 1, sm: 2 } }}
              />
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                <Skeleton
                  variant="text"
                  width={isMobile ? '70%' : '70%'}
                  height={isMobile ? 20 : 24}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width={isMobile ? '50%' : '50%'}
                  height={isMobile ? 16 : 20}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Skeleton
                variant="rounded"
                width={isMobile ? 60 : 80}
                height={isMobile ? 22 : 24}
              />
              <Skeleton
                variant="rounded"
                width={isMobile ? 80 : 100}
                height={isMobile ? 22 : 24}
              />
            </Box>
            <Skeleton
              variant="text"
              width={isMobile ? '60%' : '40%'}
              height={isMobile ? 16 : 20}
              sx={{ mb: 1 }}
            />
            <Skeleton
              variant="text"
              width={isMobile ? '80%' : '60%'}
              height={isMobile ? 16 : 20}
            />
          </CardContent>
        </Card>
      );

    case 'stats':
      return (
        <Grid container spacing={{ xs: 2, sm: 2 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid component="div" size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <Card
                sx={{
                  bgcolor: 'background.paper',
                  backgroundImage: 'none',
                  boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={isMobile ? 28 : 32}
                      height={isMobile ? 28 : 32}
                      sx={{ mr: { xs: 0, sm: 2 } }}
                    />
                    <Skeleton
                      variant="text"
                      width={isMobile ? '80%' : '60%'}
                      height={isMobile ? 18 : 20}
                    />
                  </Box>
                  <Skeleton
                    variant="text"
                    width={isMobile ? '50%' : '40%'}
                    height={isMobile ? 28 : 32}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={isMobile ? 6 : 8}
                    sx={{ mb: 1, borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rounded"
                    width={isMobile ? 70 : 80}
                    height={isMobile ? 22 : 24}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );

    case 'table':
      return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Skeleton
            variant="text"
            width={isMobile ? '50%' : '30%'}
            height={isMobile ? 28 : 32}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={isMobile ? 48 : 56}
              sx={{ borderRadius: 1 }}
            />
          </Box>
          {Array.from({ length: count }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                mb: 1,
                flexWrap: 'wrap',
              }}
            >
              <Skeleton
                variant="text"
                width={isMobile ? '15%' : '15%'}
                height={isMobile ? 36 : 40}
              />
              <Skeleton
                variant="text"
                width={isMobile ? '20%' : '20%'}
                height={isMobile ? 36 : 40}
              />
              <Skeleton
                variant="text"
                width={isMobile ? '15%' : '15%'}
                height={isMobile ? 36 : 40}
              />
              <Skeleton
                variant="text"
                width={isMobile ? '15%' : '15%'}
                height={isMobile ? 36 : 40}
              />
              <Skeleton
                variant="text"
                width={isMobile ? '20%' : '20%'}
                height={isMobile ? 36 : 40}
              />
              <Skeleton
                variant="text"
                width={isMobile ? '15%' : '15%'}
                height={isMobile ? 36 : 40}
              />
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
}> = ({ loading, message, children }) => {
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          borderRadius: 2,
        }}
      >
        <CircularProgress
          size={isMobile ? 32 : 40}
          sx={{ mb: 2 }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          }}
        >
          {message || t('common:loading', 'جاري التحميل...')}
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          }}
        >
          {message}
        </Typography>
      )}
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{
          height: { xs: 6, sm: 8 },
          borderRadius: 4,
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: 1,
          display: 'block',
          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
        }}
      >
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
