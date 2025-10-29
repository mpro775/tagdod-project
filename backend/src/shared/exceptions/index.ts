// Legacy exception (backward compatibility)
export { AppException } from './app.exception';

// New unified domain exceptions
export * from './domain.exceptions';

// Error codes and messages
export { ErrorCode, ErrorMessages, getErrorMessage, getHttpStatusCode } from '../constants/error-codes';

