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
      // Ping every 5 minutes (less than Render's 15-minute idle timeout)
      // Reduced from 10 to 5 minutes for better reliability
      const intervalMs = 5 * 60 * 1000;
      
      // Try to get external URL from Render environment variable
      const renderExternalUrl = this.configService.get<string>('RENDER_EXTERNAL_URL');
      
      this.intervalId = setInterval(async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          // Use external URL if available (Render), otherwise use localhost
          // IMPORTANT: Use /api/v1/health/live because of global prefix
          const healthUrl = renderExternalUrl 
            ? `${renderExternalUrl}/api/v1/health/live`
            : `http://localhost:${port}/api/v1/health/live`;
          
          const response = await fetch(healthUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Keep-Alive-Service/1.0',
            },
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            this.logger.warn(`Keep-alive ping failed with status ${response.status} for ${healthUrl}`);
          } else {
            this.logger.log(`Keep-alive ping successful: ${healthUrl}`);
          }
        } catch (error) {
          // Log errors to help debug issues
          this.logger.error(
            `Keep-alive ping error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }, intervalMs);
      
      this.logger.log(
        `Keep-alive service started (pinging every ${intervalMs / 1000 / 60} minutes)`,
      );
      if (renderExternalUrl) {
        this.logger.log(`Using external URL: ${renderExternalUrl}`);
      }
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

