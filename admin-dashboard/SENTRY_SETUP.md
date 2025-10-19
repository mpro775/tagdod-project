# Sentry Error Tracking Setup

This project is configured with Sentry for comprehensive error tracking and monitoring.

## Configuration

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_DEBUG=false  # Set to true for development debugging
VITE_APP_VERSION=1.0.0   # Your app version for release tracking
```

### 2. Sentry Project Setup

1. Go to [Sentry.io](https://sentry.io) and create an account
2. Create a new project (React/JavaScript)
3. Copy the DSN from the project settings
4. Add the DSN to your environment variables

### 3. Features Included

#### Error Tracking
- Automatic error capture for unhandled exceptions
- API error tracking with request/response details
- Network error monitoring
- Custom error logging with context

#### Performance Monitoring
- Page load performance
- API call performance tracking
- Custom transaction monitoring

#### Session Replay
- User session recordings for debugging
- Privacy-compliant (text masking, media blocking)

#### User Context
- User identification for error correlation
- Custom user properties and metadata

### 4. Usage in Code

#### Manual Error Logging
```typescript
import { captureException, captureMessage } from '@/core/sentry';

// Log an exception
try {
  // Some code that might fail
} catch (error) {
  captureException(error, { userId: '123', action: 'create_product' });
}

// Log a custom message
captureMessage('User performed invalid action', 'warning', {
  userId: '123',
  action: 'invalid_action'
});
```

#### User Context
```typescript
import { setUser, clearUser } from '@/core/sentry';

// Set user context
setUser({
  id: '123',
  email: 'user@example.com',
  username: 'johndoe'
});

// Clear user context (on logout)
clearUser();
```

#### Performance Monitoring
```typescript
import { startTransaction, addBreadcrumb } from '@/core/sentry';

// Start a custom transaction
const transaction = startTransaction('user_registration', 'auth');

// Add breadcrumbs for debugging
addBreadcrumb('User started registration', 'auth', 'info');
addBreadcrumb('Validation failed', 'validation', 'warning');

// Finish transaction
transaction.finish();
```

### 5. Error Handler Integration

The `ErrorHandler` class automatically sends errors to Sentry with appropriate context:

- API errors include request/response details
- Network errors are marked with appropriate severity
- User context is automatically attached
- Development console logging is preserved

### 6. Privacy & Security

- **Data Sanitization**: Sensitive data is automatically masked
- **URL Filtering**: Certain URLs (extensions, external services) are filtered out
- **Error Filtering**: Common browser extension errors are ignored
- **Environment Control**: Sentry can be disabled in development

### 7. Monitoring Dashboard

Once configured, you can access your Sentry dashboard to:

- View real-time error rates
- Analyze error trends and patterns
- Monitor performance metrics
- Review user session recordings
- Set up alerts and notifications

### 8. Troubleshooting

#### Errors not appearing in Sentry
1. Check that `VITE_SENTRY_DSN` is correctly set
2. Verify the DSN format and project permissions
3. Check browser console for any Sentry-related errors
4. Ensure you're not in development mode without `VITE_SENTRY_DEBUG=true`

#### Performance data not showing
1. Check that tracing integrations are properly configured
2. Verify `tracesSampleRate` settings
3. Ensure transactions are properly started and finished

#### Session replays not working
1. Check `replaysSessionSampleRate` and `replaysOnErrorSampleRate`
2. Ensure privacy settings allow session recording
3. Verify that the replay integration is loaded

### 9. Best Practices

- Use meaningful error messages and context
- Include user actions that led to errors
- Tag errors with relevant categories
- Monitor error rates and set up alerts
- Regularly review and fix high-impact errors
- Use releases for deployment tracking

For more information, visit the [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/).
