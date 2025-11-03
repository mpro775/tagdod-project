import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Send error to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', 'analytics');
      scope.setLevel('error');
      scope.setContext('react_error_boundary', {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AnalyticsErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

interface AnalyticsErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
  onGoHome: () => void;
}

const AnalyticsErrorFallback: React.FC<AnalyticsErrorFallbackProps> = ({
  error,
  onRetry,
  onGoHome,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        p: isMobile ? 1.5 : 3,
      }}
    >
      <Card sx={{ maxWidth: isMobile ? '100%' : 600, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: isMobile ? 2 : 4 }}>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 1 : 2}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              mb: isMobile ? 2 : 3,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: isMobile ? 48 : 64,
                color: theme.palette.error.main,
              }}
            />
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              color="error" 
              component="h1"
              sx={{ fontSize: isMobile ? '1.5rem' : undefined }}
            >
              {t('errorBoundary.title')}
            </Typography>
          </Stack>

          <Alert severity="error" sx={{ mb: isMobile ? 2 : 3, textAlign: 'right' }}>
            <AlertTitle sx={{ fontSize: isMobile ? '0.9375rem' : undefined }}>
              {t('errorBoundary.unexpectedError')}
            </AlertTitle>
            <Typography 
              variant="body2"
              sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
            >
              {t('errorBoundary.description')}
            </Typography>
            {process.env.NODE_ENV === 'development' && error && (
              <Box sx={{ 
                mt: 2, 
                p: isMobile ? 1.5 : 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100', 
                borderRadius: 1 
              }}>
                <Typography 
                  variant="caption" 
                  component="pre" 
                  sx={{ 
                    textAlign: 'left',
                    fontSize: isMobile ? '0.7rem' : undefined,
                    overflowX: 'auto',
                  }}
                >
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </Typography>
              </Box>
            )}
          </Alert>

          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 1.5 : 2}
            sx={{ 
              justifyContent: 'center',
              mb: isMobile ? 2 : 0,
            }}
          >
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              color="primary"
              size={isMobile ? 'medium' : 'large'}
              fullWidth={isMobile}
            >
              {t('errorBoundary.retry')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={onGoHome}
              color="secondary"
              size={isMobile ? 'medium' : 'large'}
              fullWidth={isMobile}
            >
              {t('errorBoundary.goHome')}
            </Button>
          </Stack>

          <Paper
            sx={{
              mt: isMobile ? 2 : 3,
              p: isMobile ? 1.5 : 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
              textAlign: 'right',
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: isMobile ? '0.8125rem' : undefined,
                fontWeight: 'bold',
              }}
            >
              {t('errorBoundary.tips')}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1,
                fontSize: isMobile ? '0.75rem' : undefined,
              }}
            >
              • {t('errorBoundary.tip1')}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
            >
              • {t('errorBoundary.tip2')}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
            >
              • {t('errorBoundary.tip3')}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
            >
              • {t('errorBoundary.tip4')}
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

// Hook for error boundary
export const useAnalyticsErrorHandler = () => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to console
    console.error('Analytics Error:', error, errorInfo);

    // Send error to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('error_source', 'analytics_hook');
      scope.setLevel('error');
      scope.setContext('analytics_error', {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });
  };

  return { handleError };
};

// Higher-order component for analytics error handling
export const withAnalyticsErrorBoundary = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    const { handleError } = useAnalyticsErrorHandler();

    return (
      <AnalyticsErrorBoundary onError={handleError}>
        <Component {...props} />
      </AnalyticsErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withAnalyticsErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};
