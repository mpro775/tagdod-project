import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Keep-Alive Service
 * Prevents Render free tier from going idle by pinging health endpoint
 * Only active in production environment
 */
@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KeepAliveService.name);
  private intervalId?: NodeJS.Timeout;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const isProduction = nodeEnv === 'production';
    
    // Only enable keep-alive in production (for Render free tier)
    if (isProduction) {
      const port = this.configService.get<number>('PORT') || 3000;
      // Ping every 10 minutes (less than Render's 15-minute idle timeout)
      const intervalMs = 10 * 60 * 1000;
      
      this.intervalId = setInterval(async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(`http://localhost:${port}/health/live`, {
            method: 'GET',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            this.logger.warn(`Keep-alive ping failed with status ${response.status}`);
          } else {
            this.logger.debug('Keep-alive ping successful');
          }
        } catch (error) {
          // Silently ignore errors (network may be temporarily unavailable)
          // Only log at debug level to avoid noise
          this.logger.debug(
            `Keep-alive ping error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }, intervalMs);
      
      this.logger.log(
        `Keep-alive service started (pinging every ${intervalMs / 1000 / 60} minutes)`,
      );
    } else {
      this.logger.debug('Keep-alive service disabled in non-production environment');
    }
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.logger.log('Keep-alive service stopped');
    }
  }
}

