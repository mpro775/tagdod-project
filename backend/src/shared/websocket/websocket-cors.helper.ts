/**
 * Helper function to get CORS origins for WebSocket gateways
 * Supports multiple origins from CORS_ORIGINS env variable
 * Falls back to localhost origins in development
 */
export function getWebSocketCorsOrigins(): string[] | string {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const corsOrigins = process.env.CORS_ORIGINS;
  const frontendUrl = process.env.FRONTEND_URL;

  // If CORS_ORIGINS is set, use it (supports multiple origins)
  if (corsOrigins) {
    const origins = corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);
    if (origins.length > 0) {
      // In development, also add localhost origins if not already present
      if (nodeEnv === 'development') {
        const localhostOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://localhost:8080',
        ];
        localhostOrigins.forEach((origin) => {
          if (!origins.includes(origin)) {
            origins.push(origin);
          }
        });
      }
      return origins;
    }
  }

  // In development, allow localhost origins
  if (nodeEnv === 'development') {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080',
    ];
  }

  // In production, use FRONTEND_URL or allow all (fallback)
  if (frontendUrl) {
    return frontendUrl;
  }

  return '*';
}

