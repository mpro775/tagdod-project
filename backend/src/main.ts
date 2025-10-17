import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

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

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    // Suppress Zod reserved keys warning
    disableErrorMessages: false,
  }));

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Solar Commerce API')
    .setDescription('Complete e-commerce platform for solar products')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('products', 'Product management')
    .addTag('analytics', 'Analytics and reporting')
    .addTag('cart', 'Shopping cart')
    .addTag('checkout', 'Order processing')
    .addTag('support', 'Customer support')
    .addTag('services', 'Service requests')
    .addTag('marketing', 'Marketing and campaigns')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔍 Analytics Dashboard: http://localhost:${port}/api/analytics/dashboard`);
}

bootstrap();