import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
}

export class AnalyticsCardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('AnalyticsCardErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <AnalyticsCardErrorFallback
          title={this.props.fallbackTitle}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

const AnalyticsCardErrorFallback: React.FC<{
  title?: string;
  onRetry?: () => void;
}> = ({ title, onRetry }) => {
  const { isMobile } = useBreakpoint();

  return (
    <Card>
      <CardContent
        sx={{
          p: isMobile ? 3 : 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} color="error" sx={{ fontWeight: 600 }}>
          {title ?? 'تعذر عرض البيانات'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          حدث خطأ غير متوقع أثناء تحميل هذا القسم.
        </Typography>
        {onRetry && (
          <Box sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              إعادة المحاولة
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
