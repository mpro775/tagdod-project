// In development, use Vite's proxy to avoid CORS issues.
// The proxy is configured in vite.config.ts to forward /api/* to the real API.
// In production, use the full API URL directly.
const isDev = import.meta.env.DEV

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isDev ? '/api/v1' : 'https://api.allawzi.net/api/v1')
