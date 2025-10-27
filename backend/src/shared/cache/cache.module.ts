import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { RedisCacheService } from './redis-cache.service';
import { ResponseCacheInterceptor } from '../interceptors/response-cache.interceptor';
import { CacheGuard } from '../guards/cache.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisClient');
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          logger.error('REDIS_URL is not set');
          throw new Error('REDIS_URL is required');
        }

        // استخرج الـ host لتعيينه كـ SNI servername في TLS
        let servername: string | undefined;
        try {
          const u = new URL(redisUrl);
          servername = u.hostname;
        } catch (e) {
          logger.warn('Invalid REDIS_URL; TLS servername will be undefined');
        }

        const isTLS = redisUrl.startsWith('rediss://');

        const client = new Redis(redisUrl, {
          // مهم جداً مع rediss على Render
          tls: isTLS ? { rejectUnauthorized: false, servername } : undefined,

          // ثبات أفضل
          connectTimeout: 10_000,
          keepAlive: 10_000,

          // لتجنب مشاكل ready check مع خدمات مُدارة
          enableReadyCheck: false,

          // إعادة المحاولة المنضبطة
          retryStrategy: (times) => {
            const delay = Math.min(1000 * times, 10_000);
            logger.warn(`Redis retry in ${delay}ms (attempt ${times})`);
            return delay;
          },
          maxRetriesPerRequest: 3,

          // اتصل لاحقاً، وسنستدعي connect() يدوياً عند الإقلاع
          lazyConnect: true,

          // سجل أي خطأ ليظهر بوضوح
          reconnectOnError: (err) => {
            logger.warn(`Redis reconnect on error: ${err.message}`);
            // اسمح بإعادة الاتصال على أخطاء قراءة/اتصال
            return /READONLY|ECONNRESET|ECONNREFUSED|ETIMEDOUT/.test(err.message);
          },
        });

        client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
        client.on('end', () => logger.warn('Redis connection ended'));
        client.on('connect', () => logger.log('Redis connecting...'));
        client.on('ready', () => logger.log('Redis ready'));

        return client;
      },
      inject: [ConfigService],
    },
    CacheService,
    RedisCacheService,
    ResponseCacheInterceptor,
    CacheGuard,
  ],
  exports: ['REDIS_CLIENT', CacheService, RedisCacheService, ResponseCacheInterceptor, CacheGuard],
})
export class CacheModule {}
