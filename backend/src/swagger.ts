import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { INestApplication, Logger } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string; type: string }>;
    url: { raw: string; host: string[]; path: string[] };
    description: string;
  };
}

interface PostmanItem {
  name: string;
  item: PostmanRequest[];
  description: string;
}
export function setupSwagger(app: INestApplication) {
  const logger = new Logger('Swagger');
  const config = new DocumentBuilder()
    .setTitle('Tagadod API')
    .setDescription(
      'Complete e-commerce platform for solar products with advanced analytics and multi-language support',
    )
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
      'JWT-auth',
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
    .addServer('https://tagdod-project.onrender.com', 'Production server')
    .addServer('http://api.allawzi.net', 'VPS Server')  // أضف هذا
    .addServer('https://api.allawzi.net', 'VPS Server (HTTPS)')  // وأضف هذا
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

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Export as JSON
    const jsonPath = join(outputPath, 'openapi.json');
    writeFileSync(jsonPath, JSON.stringify(document, null, 2));
    logger.log(`📄 OpenAPI JSON exported to: ${jsonPath}`);

    // Export as YAML
    const yamlPath = join(outputPath, 'openapi.yaml');
    writeFileSync(
      yamlPath,
      yaml.dump(document, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      }),
    );
    logger.log(`📄 OpenAPI YAML exported to: ${yamlPath}`);

    // Export Postman Collection
    const postmanCollection = {
      info: {
        name: 'Tagadod API',
        description: 'Complete e-commerce platform for solar products',
        version: '1.0.0',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string',
          },
        ],
      },
      variable: [
        {
          key: 'base_url',
          value: 'http://localhost:3000/api/v1',
          type: 'string',
        },
        {
          key: 'jwt_token',
          value: '',
          type: 'string',
        },
      ],
      item: generatePostmanItems(document),
    };

    const postmanPath = join(outputPath, 'postman-collection.json');
    writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
    logger.log(`📄 Postman Collection exported to: ${postmanPath}`);
  } catch (error) {
    logger.warn('⚠️  Could not export OpenAPI specification:', (error as Error).message);
  }

  return document;
}

// Helper function to generate Postman collection items
function generatePostmanItems(document: OpenAPIObject): PostmanItem[] {
  const items: PostmanItem[] = [];
  const paths = document.paths || {};

  // Group endpoints by tags
  const groupedEndpoints: { [key: string]: PostmanRequest[] } = {};

  Object.entries(paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      const tags = operation.tags || ['General'];
      const tag = tags[0];

      if (!groupedEndpoints[tag]) {
        groupedEndpoints[tag] = [];
      }

      groupedEndpoints[tag].push({
        name: operation.summary || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              type: 'text',
            },
          ],
          url: {
            raw: '{{base_url}}' + path,
            host: ['{{base_url}}'],
            path: path.split('/').filter(Boolean),
          },
          description: operation.description || '',
        },
      });
    });
  });

  // Create Postman collection structure
  Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
    items.push({
      name: tag,
      item: endpoints,
      description: `Endpoints for ${tag} functionality`,
    });
  });

  return items;
}
