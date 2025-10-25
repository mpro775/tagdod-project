import React, { Component, ErrorInfo, ReactNode } from 'react';
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
} from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

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

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: theme.palette.error.main,
                mr: 2,
              }}
            />
            <Typography variant="h4" color="error" component="h1">
              خطأ في التحليلات
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3, textAlign: 'right' }}>
            <AlertTitle>حدث خطأ غير متوقع</AlertTitle>
            <Typography variant="body2">
              حدث خطأ أثناء تحميل أو عرض البيانات التحليلية. يرجى المحاولة مرة أخرى.
            </Typography>
            {process.env.NODE_ENV === 'development' && error && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" component="pre" sx={{ textAlign: 'left' }}>
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </Typography>
              </Box>
            )}
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              color="primary"
            >
              إعادة المحاولة
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={onGoHome}
              color="secondary"
            >
              العودة للوحة التحكم
            </Button>
          </Box>

          <Paper
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'grey.50',
              textAlign: 'right',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>نصائح لحل المشكلة:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • تأكد من اتصالك بالإنترنت
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • تحقق من صلاحياتك للوصول للتحليلات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • جرب تحديث الصفحة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • إذا استمر الخطأ، يرجى التواصل مع الدعم الفني
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
    // Log error to external service
    console.error('Analytics Error:', error, errorInfo);

    // You can add error reporting service here
    // Example: Sentry.captureException(error);
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
