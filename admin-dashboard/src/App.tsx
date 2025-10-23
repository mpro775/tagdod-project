import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './core/theme/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { AppRouter } from './core/router/AppRouter';
import { ErrorBoundary } from './core/error/ErrorBoundary';
import { initializeGA4, setupScrollTracking } from './lib/analytics';
import { initSentry } from './core/sentry';
import './core/i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  // Initialize auth store
  useEffect(() => {
    const initializeAuth = async () => {
      await useAuthStore.getState().initialize();
    };
    initializeAuth();
  }, []);

  // Initialize analytics, tracking, and error monitoring
  useEffect(() => {
    // Initialize Sentry for error tracking
    initSentry();

    // Initialize analytics
    initializeGA4();
    const cleanupScrollTracking = setupScrollTracking();

    return () => {
      cleanupScrollTracking();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
          <Toaster position="top-center" />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
