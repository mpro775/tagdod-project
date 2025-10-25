import  { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

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

export class UserErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UserErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h5" fontWeight="bold" color="error">
                  خطأ في تحميل بيانات المستخدمين
                </Typography>
              </Box>

              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>حدث خطأ غير متوقع</AlertTitle>
                حدث خطأ أثناء تحميل أو عرض بيانات المستخدمين. يرجى المحاولة مرة أخرى.
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    تفاصيل الخطأ (وضع التطوير):
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      backgroundColor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  color="primary"
                >
                  إعادة المحاولة
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                >
                  تحديث الصفحة
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in functional components
export const useUserErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`User Error${context ? ` in ${context}` : ''}:`, error);
    
    // You can add additional error handling logic here
    // such as sending to error reporting service
  };

  const handleAsyncError = (error: unknown, context?: string) => {
    if (error instanceof Error) {
      handleError(error, context);
    } else {
      handleError(new Error(String(error)), context);
    }
  };

  return {
    handleError,
    handleAsyncError,
  };
};
