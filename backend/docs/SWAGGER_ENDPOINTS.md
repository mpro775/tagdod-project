# دليل Endpoints - Tagadod API

## نظرة عامة

هذا الدليل يوضح جميع الـ endpoints المتاحة في Tagadod API مع أمثلة شاملة للاستخدام.

## Authentication Endpoints

### POST /auth/send-otp
**إرسال رمز التحقق**
```json
{
  "phone": "+966501234567",
  "context": "register"
}
```

**Response:**
```json
{
  "sent": true,
  "devCode": "123456"
}
```

### POST /auth/verify-otp
**التحقق من رمز التحقق**
```json
{
  "phone": "+966501234567",
  "code": "123456",
  "firstName": "أحمد",
  "lastName": "محمد",
  "gender": "male",
  "capabilityRequest": "engineer",
  "jobTitle": "مهندس كهرباء",
  "deviceId": "device123"
}
```

**Response:**
```json
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "me": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "+966501234567",
    "preferredCurrency": "USD"
  }
}
```

### GET /auth/me
**الحصول على الملف الشخصي**
- **Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "+966501234567",
    "firstName": "أحمد",
    "lastName": "محمد",
    "gender": "male",
    "jobTitle": "مهندس كهرباء",
    "isAdmin": false
  },
  "capabilities": {
    "customer_capable": true,
    "engineer_capable": false,
    "wholesale_capable": false
  }
}
```

## Products Endpoints

### GET /products
**قائمة المنتجات**
```
GET /products?page=1&limit=20&search=solar&categoryId=123&brandId=456&isFeatured=true
```

**Response:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Solar Panel 300W",
      "description": "High efficiency solar panel",
      "price": 299.99,
      "currency": "USD",
      "images": ["https://example.com/image1.jpg"],
      "category": {
        "id": "507f1f77bcf86cd799439015",
        "name": "Solar Panels"
      },
      "brand": {
        "id": "507f1f77bcf86cd799439016",
        "name": "SunPower"
      },
      "isFeatured": true,
      "isNew": false,
      "views": 150
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### GET /products/:id
**تفاصيل منتج**
```
GET /products/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Solar Panel 300W",
    "description": "High efficiency solar panel with 20% efficiency",
    "price": 299.99,
    "currency": "USD",
    "images": ["https://example.com/image1.jpg"],
    "variants": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "300W - Black",
        "price": 299.99,
        "stock": 50,
        "attributes": {
          "color": "Black",
          "size": "300W"
        }
      }
    ],
    "specifications": {
      "efficiency": "20%",
      "power": "300W",
      "dimensions": "2000x1000x40mm"
    },
    "category": {
      "id": "507f1f77bcf86cd799439015",
      "name": "Solar Panels"
    },
    "brand": {
      "id": "507f1f77bcf86cd799439016",
      "name": "SunPower"
    },
    "isFeatured": true,
    "isNew": false,
    "views": 150
  }
}
```

## Cart Endpoints

### GET /cart
**عرض السلة**
- **Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "items": [
      {
        "id": "507f1f77bcf86cd799439013",
        "variantId": "507f1f77bcf86cd799439014",
        "quantity": 2,
        "product": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Solar Panel 300W",
          "price": 299.99
        },
        "variant": {
          "id": "507f1f77bcf86cd799439014",
          "name": "300W - Black",
          "price": 299.99,
          "stock": 50
        }
      }
    ],
    "totalItems": 3,
    "totalPrice": 599.98,
    "currency": "USD"
  }
}
```

### POST /cart/items
**إضافة منتج للسلة**
- **Headers:** `Authorization: Bearer <token>`

```json
{
  "variantId": "507f1f77bcf86cd799439014",
  "qty": 2
}
```

**Response:**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "variantId": "507f1f77bcf86cd799439014",
    "quantity": 2,
    "product": { ... },
    "variant": { ... }
  }
}
```

## Checkout Endpoints

### POST /checkout/preview
**معاينة الطلب**
- **Headers:** `Authorization: Bearer <token>`

```json
{
  "currency": "USD"
}
```

**Response:**
```json
{
  "data": {
    "items": [
      {
        "product": { ... },
        "variant": { ... },
        "quantity": 2,
        "price": 299.99
      }
    ],
    "subtotal": 599.98,
    "shipping": 25.00,
    "tax": 62.50,
    "total": 687.48,
    "currency": "USD",
    "deliveryOptions": [
      {
        "id": "standard",
        "name": "Standard Delivery",
        "cost": 25.00,
        "estimatedDays": 3
      }
    ]
  }
}
```

### POST /checkout/confirm
**تأكيد الطلب**
- **Headers:** `Authorization: Bearer <token>`

```json
{
  "currency": "USD",
  "paymentMethod": "card",
  "paymentProvider": "stripe",
  "deliveryAddressId": "507f1f77bcf86cd799439017"
}
```

**Response:**
```json
{
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-2024-001",
    "status": "PENDING",
    "totalAmount": 687.48,
    "currency": "USD",
    "paymentUrl": "https://payment.example.com/checkout/...",
    "estimatedDelivery": "2024-01-20T00:00:00Z"
  }
}
```

## Orders Endpoints

### GET /orders
**قائمة الطلبات**
- **Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-2024-001",
      "status": "PENDING",
      "totalAmount": 687.48,
      "currency": "USD",
      "createdAt": "2024-01-15T10:30:00Z",
      "items": [
        {
          "product": { ... },
          "variant": { ... },
          "quantity": 2,
          "unitPrice": 299.99,
          "totalPrice": 599.98
        }
      ]
    }
  ]
}
```

### GET /orders/:id
**تفاصيل طلب**
- **Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-2024-001",
    "status": "PENDING",
    "items": [ ... ],
    "subtotal": 599.98,
    "shipping": 25.00,
    "tax": 62.50,
    "totalAmount": 687.48,
    "currency": "USD",
    "createdAt": "2024-01-15T10:30:00Z",
    "estimatedDelivery": "2024-01-20T00:00:00Z"
  }
}
```

## Analytics Endpoints (Admin Only)

### GET /analytics/dashboard
**لوحة التحكم التحليلية**
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?period=monthly&startDate=2024-01-01&endDate=2024-01-31`

**Response:**
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalRevenue": 125000.50,
    "totalOrders": 89,
    "averageOrderValue": 1404.50
  },
  "kpis": [
    {
      "metric": "totalRevenue",
      "value": 125000.50,
      "change": 15.5,
      "currency": "USD"
    }
  ],
  "charts": [
    {
      "type": "revenue",
      "title": "Revenue Trends",
      "chartType": "line",
      "data": [
        { "date": "2024-01-01", "value": 5000 },
        { "date": "2024-01-02", "value": 7500 }
      ]
    }
  ]
}
```

### GET /analytics/revenue
**تحليل الإيرادات**
- **Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": {
    "totalRevenue": 125000.50,
    "monthlyRevenue": 125000.50,
    "dailyRevenue": 4166.68,
    "revenueByCategory": [
      {
        "category": "Solar Panels",
        "revenue": 75000.30,
        "percentage": 60
      }
    ],
    "revenueTrends": [
      { "date": "2024-01-01", "value": 5000 },
      { "date": "2024-01-02", "value": 7500 }
    ]
  },
  "period": "monthly"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    "Phone number is required",
    "Invalid phone number format"
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Admin access required",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Authentication

جميع الـ endpoints المحمية تتطلب JWT token في الـ header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General endpoints:** 100 requests per minute
- **Authentication:** 5 requests per minute
- **File upload:** 10 requests per minute

## Pagination

جميع الـ endpoints التي تعيد قوائم تدعم الـ pagination:

```
GET /products?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering & Search

### Products
```
GET /products?search=solar&categoryId=123&brandId=456&isFeatured=true&minPrice=100&maxPrice=1000
```

### Analytics
```
GET /analytics/dashboard?period=monthly&startDate=2024-01-01&endDate=2024-01-31
```

## File Upload

### POST /upload/image
**رفع صورة**
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (binary)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "filename": "image.jpg",
    "url": "https://cdn.example.com/uploads/image.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

## Webhooks

### POST /payments/webhook
**Webhook للدفعات**
```json
{
  "intentId": "pi_1234567890",
  "status": "succeeded",
  "amount": 68748,
  "signature": "webhook_signature"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## Testing

### Postman Collection
استيراد ملف `postman-collection.json` من مجلد `docs/api/`

### Environment Variables
```json
{
  "base_url": "http://localhost:3000/api/v1",
  "jwt_token": "your-jwt-token-here"
}
```

### Sample Requests
جميع الـ endpoints متاحة للاختبار من Swagger UI:
```
http://localhost:3000/api/docs
```
