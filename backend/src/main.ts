import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  let app;
  try {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'verbose'],
    });
  } catch (error) {
    logger.error('Failed to create NestJS application:', error);
    logger.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    process.exit(1);
  }

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Security and performance middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    // Suppress Zod reserved keys warning
    disableErrorMessages: false,
  }));

  // CORS configuration
  const allowed = (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean);
  app.enableCors({ 
    origin: allowed.length ? allowed : [/localhost/], 
    credentials: true 
  });

  // Setup Swagger documentation
  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔍 Analytics Dashboard: http://localhost:${port}/api/analytics/dashboard`);
}

bootstrap();