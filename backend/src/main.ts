import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
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
    transformOptions: {
      enableImplicitConversion: true,
    },
    // Suppress Zod reserved keys warning
    disableErrorMessages: false,
  }));

  // CORS configuration
  const allowed = (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean);
  const corsOrigins = allowed.length ? allowed : [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:8080',
    /^https?:\/\/localhost(:\d+)?$/
  ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Custom-Header'],
    maxAge: 86400, // 24 hours
  });

  // Setup Swagger documentation
  try {
    console.log('\n📝 Setting up Swagger documentation...');
    setupSwagger(app);
    console.log('✅ Swagger documentation setup completed\n');
  } catch (error) {
    logger.warn('Failed to setup Swagger documentation:', error instanceof Error ? error.message : 'Unknown error');
  }

  const port = process.env.PORT || 3000;
  
  try {
    console.log(`🔌 Starting server on port ${port}...`);
    console.log(`📍 Attempting to bind to: 0.0.0.0:${port}`);
    console.log('⏳ This may take a few seconds...\n');
    
    await app.listen(port, '0.0.0.0');
    
    console.log('\n✅ Server started successfully!');
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`🔍 Analytics Dashboard: http://localhost:${port}/api/analytics/dashboard`);
  } catch (error) {
    logger.error(`❌ Failed to start server on port ${port}:`, error instanceof Error ? error.message : 'Unknown error');
    logger.error('Error details:', error instanceof Error ? error.stack : error);
    logger.error('⚠️ Port might be already in use. Try stopping other processes or change the PORT in .env file');
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});