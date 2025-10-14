import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { ResponseCacheInterceptor } from '../interceptors/response-cache.interceptor';
import { CacheGuard } from '../guards/cache.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService) => {
        const redisUrl = configService.get('REDIS_URL');
        return new Redis(redisUrl, {
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          reconnectOnError: (err) => {
            console.warn('Redis reconnect on error:', err.message);
            return err.message.includes('READONLY');
          },
          retryDelayOnClusterDown: 1000,
          clusterRetryDelay: 1000,
        });
      },
      inject: ['ConfigService'],
    },
    CacheService,
    ResponseCacheInterceptor,
    CacheGuard,
  ],
  exports: [CacheService, ResponseCacheInterceptor, CacheGuard],
})
export class CacheModule {}
