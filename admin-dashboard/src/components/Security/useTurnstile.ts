import { useState } from 'react';

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
    // eslint-disable-next-line no-console
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
