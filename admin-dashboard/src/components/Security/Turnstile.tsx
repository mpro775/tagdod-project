import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { Security } from '@mui/icons-material';

interface TurnstileProps {
  siteKey?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  // eslint-disable-next-line no-unused-vars
  onVerify: (token: string) => void;
  // eslint-disable-next-line no-unused-vars
  onError?: (error: string) => void;
  onExpire?: () => void;
  sx?: object;
}

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    turnstile: {
      // eslint-disable-next-line no-unused-vars
      render: (element: string | HTMLElement, options: any) => string;
      // eslint-disable-next-line no-unused-vars
      remove: (widgetId: string) => void;
      // eslint-disable-next-line no-unused-vars
      reset: (widgetId?: string) => void;
      // eslint-disable-next-line no-unused-vars
      getResponse: (widgetId?: string) => string;
    };
  }
}

export const Turnstile: React.FC<TurnstileProps> = ({
  siteKey = import.meta.env.VITE_TURNSTILE_SITEKEY,
  theme = 'light',
  size = 'normal',
  onVerify,
  onError,
  onExpire,
  sx = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderTurnstile = useCallback(() => {
    if (!window.turnstile || !containerRef.current) {
      return;
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: (token: string) => {
          // Store token in localStorage for HTTP requests
          localStorage.setItem('cf-turnstile-token', token);
          onVerify(token);
        },
        'error-callback': (error: string) => {
          setError(error);
          if (onError) onError(error);
        },
        'expired-callback': () => {
          localStorage.removeItem('cf-turnstile-token');
          if (onExpire) onExpire();
        },
      });
      
      widgetIdRef.current = widgetId;
      setIsLoading(false);
      setError(null);
    } catch {
      setError('Failed to render Turnstile widget');
      setIsLoading(false);
      if (onError) onError('Failed to render Turnstile widget');
    }
  }, [siteKey, theme, size, onVerify, onError, onExpire]);

  useEffect(() => {
    if (!siteKey) {
      setError('Turnstile site key not configured');
      setIsLoading(false);
      return;
    }

    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        renderTurnstile();
      };
      
      script.onerror = () => {
        setError('Failed to load Turnstile script');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    } else {
      renderTurnstile();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, theme, size, renderTurnstile]);

  if (error) {
    return (
      <Alert severity="error" sx={{ ...sx }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security />
          <Box>
            <strong>خطأ في التحقق الأمني</strong>
            <br />
            {error}
          </Box>
        </Box>
      </Alert>
    );
  }

  return (
    <Box sx={{ ...sx }}>
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
          <CircularProgress size={20} />
          <span>جاري تحميل التحقق الأمني...</span>
        </Box>
      )}
      <div ref={containerRef} />
    </Box>
  );
};


export default Turnstile;
