import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { ValidationPipe, Logger } from '@nestjs/common';

import { AppModule } from './app.module';

import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from './shared/interceptors/response-envelope.interceptor';
import { CORSService } from './modules/security/cors.service';
import { SecurityLoggingInterceptor } from './modules/security/interceptors/security-logging.interceptor';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Get security services
  const corsService = app.get(CORSService);
  const securityLoggingInterceptor = app.get(SecurityLoggingInterceptor);

  // Configure CORS with advanced settings
  app.enableCors(corsService.getConfig());

  // Configure Helmet with custom settings
  app.use(helmet({
    contentSecurityPolicy: false, // We handle CSP in middleware
    crossOriginEmbedderPolicy: false,
  }));

  // Apply security middlewares (defined in SecurityModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseEnvelopeInterceptor(),
    securityLoggingInterceptor, // Add security logging
  );

  const config = new DocumentBuilder()
    .setTitle('Solar Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`API running on http://localhost:${port} (docs: /docs)`);
}
bootstrap();
