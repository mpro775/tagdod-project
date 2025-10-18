export interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  sx?: object;
}

export interface EmptyProps {
  message?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
  sx?: object;
}

export interface ErrorProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
  error?: any;
  showDetails?: boolean;
  sx?: object;
}
