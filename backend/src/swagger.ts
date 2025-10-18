import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { join } from 'path';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Tagadod API')
    .setDescription('Complete e-commerce platform for solar products with advanced analytics and multi-language support')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User management and profiles')
    .addTag('products', 'Product catalog and management')
    .addTag('categories', 'Product categories and organization')
    .addTag('brands', 'Brand management')
    .addTag('attributes', 'Product attributes and specifications')
    .addTag('cart', 'Shopping cart operations')
    .addTag('checkout', 'Order processing and checkout')
    .addTag('orders', 'Order management and tracking')
    .addTag('analytics', 'Analytics and reporting')
    .addTag('marketing', 'Marketing campaigns and promotions')
    .addTag('notifications', 'Notification system')
    .addTag('support', 'Customer support and tickets')
    .addTag('services', 'Service requests and management')
    .addTag('favorites', 'User favorites and wishlist')
    .addTag('addresses', 'Address management')
    .addTag('exchange-rates', 'Currency conversion and exchange rates')
    .addTag('search', 'Product search and filtering')
    .addTag('upload', 'File upload and media management')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.tagadod.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Setup Swagger UI
  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Tagadod API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #1f2937 }
    `,
  });

  // Export OpenAPI specification
  try {
    const outputPath = join(process.cwd(), 'docs', 'api');
    const fs = require('fs');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Export as JSON
    const jsonPath = join(outputPath, 'openapi.json');
    writeFileSync(jsonPath, JSON.stringify(document, null, 2));
    console.log(`📄 OpenAPI JSON exported to: ${jsonPath}`);

    // Export as YAML
    const yaml = require('js-yaml');
    const yamlPath = join(outputPath, 'openapi.yaml');
    writeFileSync(yamlPath, yaml.dump(document, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true 
    }));
    console.log(`📄 OpenAPI YAML exported to: ${yamlPath}`);

    // Export Postman Collection
    const postmanCollection = {
      info: {
        name: 'Tagadod API',
        description: 'Complete e-commerce platform for solar products',
        version: '1.0.0',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string'
          }
        ]
      },
      variable: [
        {
          key: 'base_url',
          value: 'http://localhost:3000/api/v1',
          type: 'string'
        },
        {
          key: 'jwt_token',
          value: '',
          type: 'string'
        }
      ],
      item: generatePostmanItems(document)
    };

    const postmanPath = join(outputPath, 'postman-collection.json');
    writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
    console.log(`📄 Postman Collection exported to: ${postmanPath}`);

  } catch (error) {
    console.warn('⚠️  Could not export OpenAPI specification:', error.message);
  }

  return document;
}

// Helper function to generate Postman collection items
function generatePostmanItems(document: any): any[] {
  const items: any[] = [];
  const paths = document.paths || {};

  // Group endpoints by tags
  const groupedEndpoints: { [key: string]: any[] } = {};

  Object.entries(paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, details]: [string, any]) => {
      const tags = details.tags || ['General'];
      const tag = tags[0];
      
      if (!groupedEndpoints[tag]) {
        groupedEndpoints[tag] = [];
      }

      groupedEndpoints[tag].push({
        name: details.summary || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              type: 'text'
            }
          ],
          url: {
            raw: '{{base_url}}' + path,
            host: ['{{base_url}}'],
            path: path.split('/').filter(Boolean)
          },
          description: details.description || ''
        }
      });
    });
  });

  // Create Postman collection structure
  Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
    items.push({
      name: tag,
      item: endpoints,
      description: `Endpoints for ${tag} functionality`
    });
  });

  return items;
}
