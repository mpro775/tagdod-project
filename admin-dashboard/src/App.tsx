import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './core/theme/ThemeProvider';
import { Toaster, ToastBar, resolveValue } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { AppRouter } from './core/router/AppRouter';
import { ErrorBoundary } from './core/error/ErrorBoundary';
import { initializeGA4, setupScrollTracking } from './lib/analytics';
import { initSentry } from './core/sentry';
import './core/i18n/config';
import './assets/toast-fix.css';

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
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={12}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                padding: '0',
                minWidth: '280px',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
              },
              success: {
                duration: 4000,
                style: {
                  background: '#2e7d32',
                  color: '#ffffff',
                },
              },
              error: {
                duration: 6000,
                style: {
                  background: '#c62828',
                  color: '#ffffff',
                },
              },
            }}
          >
            {(t) => (
              <ToastBar
                toast={t}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  padding: '16px 20px',
                  direction: 'rtl',
                }}
              >
                {({ icon }) => (
                  <div className="toast-bar-content">
                    <span className="toast-bar-icon">{icon}</span>
                    <span className="toast-bar-message">
                      {resolveValue(t.message, t)}
                    </span>
                  </div>
                )}
              </ToastBar>
            )}
          </Toaster>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
