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
        const redisUrl = configService.get('REDIS_URL');
        return new Redis(redisUrl, {
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          reconnectOnError: (err) => {
            logger.warn(`Redis reconnect on error: ${err.message}`);
            return err.message.includes('READONLY');
          },
        });
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
