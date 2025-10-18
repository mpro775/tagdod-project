import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { Security } from '@mui/icons-material';

interface TurnstileProps {
  siteKey?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  sx?: object;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
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
  }, [siteKey, theme, size]);

  const renderTurnstile = () => {
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
    } catch (err) {
      setError('Failed to render Turnstile widget');
      setIsLoading(false);
      if (onError) onError('Failed to render Turnstile widget');
    }
  };

  const resetTurnstile = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      localStorage.removeItem('cf-turnstile-token');
    }
  };

  const getResponse = () => {
    if (widgetIdRef.current && window.turnstile) {
      return window.turnstile.getResponse(widgetIdRef.current);
    }
    return '';
  };

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

// Hook for using Turnstile in forms
export const useTurnstile = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (newToken: string) => {
    setToken(newToken);
    setIsVerified(true);
    localStorage.setItem('cf-turnstile-token', newToken);
  };

  const handleError = (error: string) => {
    setToken(null);
    setIsVerified(false);
    localStorage.removeItem('cf-turnstile-token');
    console.error('Turnstile error:', error);
  };

  const handleExpire = () => {
    setToken(null);
    setIsVerified(false);
    localStorage.removeItem('cf-turnstile-token');
  };

  const reset = () => {
    setToken(null);
    setIsVerified(false);
    localStorage.removeItem('cf-turnstile-token');
  };

  return {
    token,
    isVerified,
    handleVerify,
    handleError,
    handleExpire,
    reset,
  };
};

export default Turnstile;
