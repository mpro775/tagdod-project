import { z } from 'zod';

export const envSchema = z.object({
  // Application Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database
  MONGO_URI: z.string().min(1),
  
  // Redis
  REDIS_URL: z.string().min(1),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  REFRESH_SECRET: z.string().min(32),
  
  // OTP Configuration
  OTP_TTL_SECONDS: z.coerce.number().default(300),
  OTP_LENGTH: z.coerce.number().default(6),
  OTP_DEV_ECHO: z.coerce.boolean().default(false),
  
  // Reservation TTL
  RESERVATION_TTL_SECONDS: z.coerce.number().default(900),
  
  // Cache Configuration
  CACHE_PREFIX: z.string().default('solar:'),
  CACHE_TTL: z.coerce.number().default(3600), // 1 hour default
  CACHE_ENABLED: z.coerce.boolean().default(true),
  
  // Bunny.net Storage Configuration
  BUNNY_STORAGE_ZONE: z.string().min(1),
  BUNNY_API_KEY: z.string().min(1),
  BUNNY_HOSTNAME: z.string().default('storage.bunnycdn.com'),
  BUNNY_CDN_HOSTNAME: z.string().optional(),
  
  // Security Configuration
  CORS_ORIGINS: z.string().optional(),
  IP_WHITELIST: z.string().optional(),
  IP_BLACKLIST: z.string().optional(),
  DISABLE_THREAT_DETECTION: z.coerce.boolean().default(false),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvType = z.infer<typeof envSchema>;
