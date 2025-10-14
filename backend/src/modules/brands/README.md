# Brands Management System

نظام إدارة البراندات الشامل يوفر إمكانية إنشاء وإدارة العلامات التجارية مع ربطها بالمنتجات.

## Features / المميزات

### Admin Features (للمسؤولين)
- ✅ إنشاء براند جديد (اسم وصورة)
- ✅ تعديل بيانات البراند
- ✅ حذف براند
- ✅ تفعيل/إيقاف البراند
- ✅ ترتيب البراندات (Sort Order)
- ✅ البحث والفلترة
- ✅ Pagination للقوائم

### Public Features (للمستخدمين)
- ✅ عرض جميع البراندات النشطة (بدون حماية)
- ✅ عرض تفاصيل براند محدد
- ✅ عرض المنتجات حسب البراند
- ✅ عرض الفئات المتاحة للمنتجات في البراند (للفلترة)

## API Endpoints

### Admin Endpoints (محمية - تتطلب صلاحيات Admin)

#### Create Brand
```http
POST /admin/brands
Authorization: Bearer {token}

Body:
{
  "name": "Apple",
  "image": "https://example.com/apple-logo.png",
  "description": "Leading technology company",
  "isActive": true,
  "sortOrder": 0,
  "metadata": {}
}
```

#### List Brands
```http
GET /admin/brands?page=1&limit=20&search=Apple&isActive=true&sortBy=sortOrder&sortOrder=asc
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [...brands],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Get Brand by ID
```http
GET /admin/brands/:id
Authorization: Bearer {token}
```

#### Update Brand
```http
PATCH /admin/brands/:id
Authorization: Bearer {token}

Body:
{
  "name": "Apple Inc.",
  "description": "Updated description",
  "sortOrder": 5
}
```

#### Delete Brand
```http
DELETE /admin/brands/:id
Authorization: Bearer {token}
```

#### Toggle Brand Status
```http
PATCH /admin/brands/:id/toggle-status
Authorization: Bearer {token}
```

### Public Endpoints (بدون حماية)

#### Get All Active Brands
```http
GET /brands?page=1&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Apple",
      "slug": "apple",
      "image": "https://...",
      "description": "...",
      "isActive": true,
      "sortOrder": 0
    }
  ],
  "pagination": {...}
}
```

#### Get Brand by ID
```http
GET /brands/:id
```

#### Get Brand by Slug
```http
GET /brands/slug/:slug

Example:
GET /brands/slug/apple
```

## Integration with Products / الربط مع المنتجات

### في إضافة/تعديل المنتج (Admin Product Controller)

عند إنشاء أو تعديل منتج، يمكن للأدمن اختيار `brandId`:

```http
POST /admin/catalog/products
Authorization: Bearer {token}

Body:
{
  "name": "iPhone 15 Pro",
  "categoryId": "...",
  "brandId": "...",  // <-- Brand ID
  "description": "Latest iPhone",
  "images": [...],
  "specs": [...]
}
```

### عرض المنتجات حسب البراند

```http
GET /products?brandId=...&page=1&limit=20

Response:
{
  "data": [...products with this brand],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### عرض الفئات المتاحة للمنتجات في براند معين

```http
GET /brands/:brandId/categories

Response:
{
  "data": [
    {
      "_id": "...",
      "name": "Smartphones",
      "slug": "smartphones",
      "path": "/electronics/smartphones"
    },
    {
      "_id": "...",
      "name": "Laptops",
      "slug": "laptops",
      "path": "/electronics/laptops"
    }
  ]
}
```

## Frontend/Mobile Integration / التكامل مع الواجهة الأمامية

### سيناريو 1: عرض صفحة البراند

```javascript
// 1. Get brand details
const brand = await fetch(`/brands/${brandId}`);

// 2. Get products for this brand
const products = await fetch(`/products?brandId=${brandId}&page=1`);

// 3. Get available categories for filtering
const categories = await fetch(`/brands/${brandId}/categories`);

// Now you can display:
// - Brand info (name, image, description)
// - List of products
// - Categories for filtering
```

### سيناريو 2: فلترة المنتجات حسب البراند والفئة

```javascript
// User clicks on brand, then filters by category
const products = await fetch(
  `/products?brandId=${brandId}&categoryId=${categoryId}&page=1`
);
```

### سيناريو 3: عرض قائمة البراندات في الصفحة الرئيسية

```javascript
// Show all active brands
const brands = await fetch('/brands?limit=50');

// Display as grid/carousel
brands.data.forEach(brand => {
  // Show brand.image, brand.name
  // Link to: /brands/${brand._id} or /brands/${brand.slug}
});
```

## Database Schema

```typescript
{
  name: string;           // Brand name (required)
  slug: string;           // Auto-generated from name (unique)
  image: string;          // Brand logo/image URL (required)
  description?: string;   // Optional description
  isActive: boolean;      // Active status (default: true)
  sortOrder: number;      // For ordering (default: 0)
  metadata?: object;      // Additional data
  createdAt: Date;
  updatedAt: Date;
}
```

## Notes / ملاحظات

1. **Slug Generation**: يتم إنشاء الـ slug تلقائياً من الاسم (lowercase, spaces replaced with hyphens)
2. **Unique Names**: لا يمكن إنشاء براندين بنفس الاسم (slug must be unique)
3. **Product Relationship**: العلاقة بين Product و Brand هي Many-to-One (منتجات كثيرة لبراند واحد)
4. **Deletion**: عند حذف براند، تأكد من فصل العلاقة مع المنتجات أولاً
5. **Public Access**: جميع الـ endpoints العامة لا تتطلب Authentication
6. **Caching**: يتم cache الفئات للبراند لمدة 30 دقيقة

## Examples / أمثلة

### مثال 1: إنشاء براند Apple
```json
POST /admin/brands
{
  "name": "Apple",
  "image": "https://cdn.example.com/brands/apple.png",
  "description": "Think Different",
  "sortOrder": 1
}
```

### مثال 2: عرض جميع منتجات Apple في فئة Smartphones
```bash
# Step 1: Get Apple brand ID
GET /brands/slug/apple
# Response: { "_id": "abc123", ... }

# Step 2: Get Smartphones category ID
GET /categories
# Find category with name "Smartphones", get its ID: "xyz789"

# Step 3: Get products
GET /products?brandId=abc123&categoryId=xyz789&page=1&limit=20
```

### مثال 3: عرض صفحة براند كاملة
```bash
# Get brand info
GET /brands/abc123

# Get products
GET /products?brandId=abc123&page=1

# Get available categories for filtering
GET /brands/abc123/categories
```

## Security / الحماية

- ✅ Admin endpoints محمية بـ JWT + Roles Guard
- ✅ Public endpoints متاحة بدون authentication
- ✅ Validation على جميع الـ inputs
- ✅ Error handling شامل

## Performance / الأداء

- ✅ Indexes على الحقول الهامة (slug, isActive, sortOrder)
- ✅ Lean queries for better performance
- ✅ Pagination support
- ✅ Caching للفئات حسب البراند

