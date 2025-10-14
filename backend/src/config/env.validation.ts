import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  REFRESH_SECRET: z.string().min(32),
  OTP_TTL_SECONDS: z.coerce.number().default(300),
  RESERVATION_TTL_SECONDS: z.coerce.number().default(900),
  CACHE_PREFIX: z.string().default('solar:'),
  CACHE_TTL: z.coerce.number().default(3600), // 1 hour default
  CACHE_ENABLED: z.coerce.boolean().default(true),
});
export type EnvType = z.infer<typeof envSchema>;
