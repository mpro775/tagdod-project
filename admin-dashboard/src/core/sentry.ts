import * as Sentry from '@sentry/react';

// Sentry DSN - يجب تعيينه في متغيرات البيئة
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const initSentry = () => {
  if (!SENTRY_DSN) {
    // eslint-disable-next-line no-console
    console.warn('Sentry DSN not configured. Error tracking will not be available.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // This sets the sample rate to be 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // Capture 100% of the transactions in development, 10% in production
    // Session Replay
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

    // Environment
    environment: import.meta.env.MODE,

    // Release tracking (optional - useful for deployment tracking)
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Before sending the event to Sentry, you can modify it
    beforeSend(event) {
      // Don't send events in development unless explicitly configured
      if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }

      // Add custom context
      event.tags = {
        ...event.tags,
        app: 'admin-dashboard',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      };

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
      // Generic error codes
      'Script error.',
      'Script error',
    ],

    // Deny URLs
    denyUrls: [
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /^safari-extension:\/\//i,
    ],
  });

  // eslint-disable-next-line no-console
  console.log('Sentry initialized successfully');
};

// Utility functions for manual error tracking
export const captureException = (error: any, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setTag(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setTag(key, context[key]);
      });
    }
    Sentry.captureMessage(message);
  });
};

// Performance monitoring helpers
export const startTransaction = (name: string, op: string) => {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
};

// User context management
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const clearUser = () => {
  Sentry.setUser(null);
};

// Breadcrumb helpers
export const addBreadcrumb = (message: string, category?: string, level?: Sentry.SeverityLevel) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
  });
};
