# دليل Swagger الكامل - Tagadod API

## نظرة عامة

تم إعداد نظام Swagger كامل مع تصدير OpenAPI لـ Tagadod API. يتضمن النظام:

- ✅ إعداد Swagger مع تصدير OpenAPI تلقائي
- ✅ وثائق تفاعلية في `/api/docs`
- ✅ تصدير JSON و YAML
- ✅ أمثلة شاملة لجميع الـ endpoints
- ✅ دعم المصادقة JWT
- ✅ تصنيف الـ endpoints حسب الوحدة

## الملفات المُنشأة

### 1. ملف إعداد Swagger الرئيسي
```
backend/src/swagger.ts
```

### 2. دليل API
```
backend/docs/api/
├── README.md
├── openapi.json (يتم إنشاؤه تلقائياً)
└── openapi.yaml (يتم إنشاؤه تلقائياً)
```

### 3. أمثلة DTOs
```
backend/src/shared/dto/swagger-examples.dto.ts
```

## الاستخدام

### 1. تشغيل الخادم مع Swagger
```bash
npm run start:dev
```

### 2. الوصول للوثائق التفاعلية
```
http://localhost:3000/api/docs
```

### 3. تصدير OpenAPI
```bash
# تصدير تلقائي عند تشغيل الخادم
npm run docs:generate

# أو تصدير مباشر
npm run docs:openapi
```

## إعداد Controllers

### مثال كامل لـ Controller مع Swagger

```typescript
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  
  @Get()
  @ApiOperation({ 
    summary: 'Get products list',
    description: 'Retrieves a paginated list of products with optional filtering'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiOkResponse({ 
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              name: { type: 'string', example: 'Solar Panel 300W' },
              price: { type: 'number', example: 299.99 }
            }
          }
        }
      }
    }
  })
  async getProducts() {
    // Implementation
  }
}
```

## إعداد DTOs مع Swagger

### مثال DTO مع وثائق كاملة

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ 
    example: 'Solar Panel 300W', 
    description: 'Product name' 
  })
  name: string;

  @ApiProperty({ 
    example: 'High efficiency solar panel', 
    description: 'Product description' 
  })
  description: string;

  @ApiProperty({ 
    example: 299.99, 
    description: 'Product price' 
  })
  price: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Product currency' 
  })
  currency: string;
}
```

## تصدير OpenAPI

### 1. تصدير JSON
```bash
curl http://localhost:3000/api/docs-json > openapi.json
```

### 2. تصدير YAML
```bash
curl http://localhost:3000/api/docs-yaml > openapi.yaml
```

### 3. استخدام السكريبتات
```bash
# تصدير كامل
npm run docs:generate

# تصدير OpenAPI فقط
npm run docs:openapi
```

## استخدام OpenAPI مع أدوات أخرى

### 1. Postman
- استيراد ملف `openapi.json`
- إنشاء Collection تلقائياً
- اختبار جميع الـ endpoints

### 2. Insomnia
- استيراد ملف `openapi.yaml`
- إنشاء Workspace تلقائياً

### 3. إنشاء Client SDKs
```bash
# تثبيت openapi-generator
npm install -g @openapitools/openapi-generator-cli

# إنشاء TypeScript client
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o client-sdk/typescript

# إنشاء Python client
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g python \
  -o client-sdk/python
```

## إعدادات متقدمة

### 1. تخصيص Swagger UI
```typescript
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
```

### 2. إضافة Security Schemes
```typescript
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
```

### 3. تصنيف الـ Endpoints
```typescript
.addTag('auth', 'Authentication and authorization endpoints')
.addTag('users', 'User management and profiles')
.addTag('products', 'Product catalog and management')
.addTag('cart', 'Shopping cart operations')
.addTag('orders', 'Order management and tracking')
.addTag('analytics', 'Analytics and reporting')
```

## أفضل الممارسات

### 1. وثائق الـ Controllers
- استخدم `@ApiOperation` لكل endpoint
- أضف `@ApiResponse` للاستجابات المختلفة
- استخدم `@ApiBody` للـ request bodies
- أضف `@ApiParam` للـ path parameters
- استخدم `@ApiQuery` للـ query parameters

### 2. وثائق الـ DTOs
- استخدم `@ApiProperty` لكل خاصية
- أضف أمثلة واقعية
- اكتب أوصاف واضحة
- حدد الأنواع المطلوبة

### 3. تنظيم الكود
- اجمع الـ decorators في بداية الملف
- استخدم ملفات منفصلة للـ DTOs
- أنشئ أمثلة مشتركة في `swagger-examples.dto.ts`

## استكشاف الأخطاء

### 1. مشاكل التصدير
```bash
# تحقق من وجود js-yaml
npm install js-yaml

# تحقق من صلاحيات الكتابة
ls -la docs/api/
```

### 2. مشاكل Swagger UI
```bash
# تحقق من تشغيل الخادم
curl http://localhost:3000/api/docs

# تحقق من الـ CORS
curl -H "Origin: http://localhost:3000" http://localhost:3000/api/docs
```

### 3. مشاكل الـ Authentication
- تأكد من إضافة `@ApiBearerAuth()` للـ endpoints المحمية
- تحقق من صحة JWT token
- تأكد من إعداد الـ guards بشكل صحيح

## التطوير المستمر

### 1. تحديث الوثائق
- أضف وثائق جديدة عند إضافة endpoints
- حدث الأمثلة عند تغيير الـ schemas
- راجع الوثائق بانتظام

### 2. اختبار الوثائق
- اختبر جميع الـ endpoints من Swagger UI
- تحقق من صحة الأمثلة
- تأكد من عمل الـ authentication

### 3. مشاركة الوثائق
- شارك رابط `/api/docs` مع فريق التطوير
- استخدم ملفات OpenAPI للـ integration
- أنشئ client SDKs للـ frontend

## الخلاصة

تم إعداد نظام Swagger كامل ومتقدم لـ Tagadod API يتضمن:

✅ **إعداد كامل**: ملف `swagger.ts` مع جميع الإعدادات
✅ **تصدير OpenAPI**: JSON و YAML تلقائي
✅ **وثائق تفاعلية**: في `/api/docs`
✅ **أمثلة شاملة**: لجميع الـ endpoints
✅ **دعم المصادقة**: JWT Bearer token
✅ **تصنيف منظم**: حسب الوحدات
✅ **سكريبتات مفيدة**: للتصدير والاختبار
✅ **دليل شامل**: للاستخدام والتطوير

النظام جاهز للاستخدام والتطوير المستمر! 🚀
