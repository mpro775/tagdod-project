# API Endpoints Reference - Brands & Banners
# مرجع نقاط النهاية للبراندات والبنرات

## 🔐 Authentication

### Admin Endpoints
- **Authentication**: Required ✅
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Roles**: ADMIN, SUPER_ADMIN, MODERATOR

### Public Endpoints
- **Authentication**: Not Required ❌
- **Access**: Anyone (even not logged in)

---

## 📦 BRANDS API

### 🔒 Admin Endpoints

#### 1. Create Brand
```http
POST /admin/brands
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Samsung",
  "image": "https://cdn.example.com/samsung.png",
  "description": "Leading electronics manufacturer",
  "isActive": true,
  "sortOrder": 0
}

Response: 201 Created
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "_id": "65abc...",
    "name": "Samsung",
    "slug": "samsung",
    ...
  }
}
```

#### 2. List Brands (Admin)
```http
GET /admin/brands?page=1&limit=20&search=Samsung&isActive=true&sortBy=sortOrder&sortOrder=asc
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [...brands],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}

Query Parameters:
  page        number   Page number (default: 1)
  limit       number   Items per page (default: 20)
  search      string   Search in name/description
  isActive    boolean  Filter by active status
  sortBy      string   Sort field (name|createdAt|sortOrder)
  sortOrder   string   Sort direction (asc|desc)
```

#### 3. Get Brand by ID (Admin)
```http
GET /admin/brands/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "65abc...",
    "name": "Samsung",
    "slug": "samsung",
    "image": "https://...",
    "description": "...",
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 4. Update Brand
```http
PATCH /admin/brands/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Samsung Electronics",
  "description": "Updated description",
  "sortOrder": 5
}

Response: 200 OK
{
  "success": true,
  "message": "Brand updated successfully",
  "data": {...updated brand}
}
```

#### 5. Delete Brand
```http
DELETE /admin/brands/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

#### 6. Toggle Brand Status
```http
PATCH /admin/brands/:id/toggle-status
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Brand activated successfully",
  "data": {...brand with new status}
}
```

---

### 🌐 Public Endpoints (No Auth)

#### 1. List Active Brands
```http
GET /brands?page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "65abc...",
      "name": "Samsung",
      "slug": "samsung",
      "image": "https://...",
      "description": "...",
      "isActive": true,
      "sortOrder": 0
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}

Note: Only returns brands where isActive=true
```

#### 2. Get Brand by ID
```http
GET /brands/:id

Response: 200 OK
{
  "success": true,
  "data": {...brand}
}
```

#### 3. Get Brand by Slug
```http
GET /brands/slug/:slug

Example:
GET /brands/slug/samsung

Response: 200 OK
{
  "success": true,
  "data": {...brand}
}
```

---

## 🎪 BANNERS API

### 🔒 Admin Endpoints

#### 1. Create Banner
```http
POST /admin/banners
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Summer Sale 2024",
  "description": "Up to 50% off on all products",
  "image": "https://cdn.example.com/summer-sale.jpg",
  "type": "image",
  "location": "home_top",
  "linkUrl": "https://example.com/sale",
  "linkText": "Shop Now",
  "isActive": true,
  "sortOrder": 0,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z"
}

Response: 201 Created
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "_id": "65def...",
    "title": "Summer Sale 2024",
    ...
  }
}

Banner Types:
  - image      Static image banner
  - video      Video banner
  - carousel   Carousel/slider banner

Banner Locations:
  - home_top        Top of homepage
  - home_middle     Middle of homepage
  - home_bottom     Bottom of homepage
  - category_top    Top of category page
  - product_sidebar Product page sidebar
  - custom          Custom location
```

#### 2. List Banners (Admin)
```http
GET /admin/banners?page=1&limit=20&search=Sale&isActive=true&location=home_top&sortBy=sortOrder&sortOrder=asc
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [...banners],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}

Query Parameters:
  page        number          Page number
  limit       number          Items per page
  search      string          Search in title/description
  isActive    boolean         Filter by active status
  location    BannerLocation  Filter by location
  sortBy      string          Sort field (title|createdAt|sortOrder|startDate)
  sortOrder   string          Sort direction (asc|desc)
```

#### 3. Get Banner by ID (Admin)
```http
GET /admin/banners/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "65def...",
    "title": "Summer Sale 2024",
    "description": "Up to 50% off",
    "image": "https://...",
    "type": "image",
    "location": "home_top",
    "linkUrl": "https://...",
    "linkText": "Shop Now",
    "isActive": true,
    "sortOrder": 0,
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "clickCount": 245,
    "viewCount": 1523,
    "createdAt": "2024-05-20T10:00:00Z",
    "updatedAt": "2024-05-20T10:00:00Z"
  }
}
```

#### 4. Update Banner
```http
PATCH /admin/banners/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "isActive": false,
  "sortOrder": 5
}

Response: 200 OK
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {...updated banner}
}
```

#### 5. Delete Banner
```http
DELETE /admin/banners/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

#### 6. Toggle Banner Status
```http
PATCH /admin/banners/:id/toggle-status
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Banner activated successfully",
  "data": {...banner with new status}
}
```

---

### 🌐 Public Endpoints (No Auth)

#### 1. Get Active Banners
```http
GET /banners
GET /banners?location=home_top

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "65def...",
      "title": "Summer Sale 2024",
      "description": "Up to 50% off",
      "image": "https://...",
      "type": "image",
      "location": "home_top",
      "linkUrl": "https://...",
      "linkText": "Shop Now",
      "sortOrder": 0,
      "viewCount": 1523,
      "clickCount": 245
    }
  ]
}

Query Parameters:
  location  BannerLocation  Filter by location (optional)

Notes:
  - Only returns active banners (isActive=true)
  - Only returns banners within date range (if dates set)
  - Sorted by sortOrder, then createdAt DESC
```

#### 2. Get Banner by ID
```http
GET /banners/:id

Response: 200 OK
{
  "success": true,
  "data": {...banner}
}
```

#### 3. Track Banner View
```http
POST /banners/:id/view

Response: 200 OK
{
  "success": true,
  "message": "View count incremented"
}

Note: Call this when banner appears on user's screen
```

#### 4. Track Banner Click
```http
POST /banners/:id/click

Response: 200 OK
{
  "success": true,
  "message": "Click count incremented"
}

Note: Call this when user clicks on banner
```

---

## 🛍️ PRODUCTS API (Enhanced)

### Filter Products by Brand
```http
GET /products?brandId=65abc...&page=1&limit=20

Response: 200 OK
{
  "data": [...products],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Filter Products by Brand + Category
```http
GET /products?brandId=65abc...&categoryId=65xyz...&page=1&limit=20

Response: 200 OK
{
  "data": [...filtered products],
  "meta": {...}
}
```

### Get Categories for Brand
```http
GET /brands/:brandId/categories

Response: 200 OK
{
  "data": [
    {
      "_id": "65xyz...",
      "name": "Smartphones",
      "slug": "smartphones",
      "path": "/electronics/smartphones",
      "depth": 1
    },
    {
      "_id": "65mno...",
      "name": "Tablets",
      "slug": "tablets",
      "path": "/electronics/tablets",
      "depth": 1
    }
  ]
}

Note: Returns all categories that have active products for this brand
```

---

## 📊 Common Query Patterns

### Homepage Data
```javascript
// Get homepage banners
const banners = await fetch('/banners?location=home_top');

// Get featured brands
const brands = await fetch('/brands?limit=10&sortBy=sortOrder');

// Get featured products
const products = await fetch('/products?isFeatured=true&limit=20');
```

### Brand Page Data
```javascript
// Get brand info
const brand = await fetch(`/brands/slug/${slug}`);

// Get categories for filtering
const categories = await fetch(`/brands/${brand._id}/categories`);

// Get products
const products = await fetch(`/products?brandId=${brand._id}`);
```

### Filtered Products
```javascript
// Products by brand
const products = await fetch(`/products?brandId=${brandId}`);

// Products by brand + category
const products = await fetch(`/products?brandId=${brandId}&categoryId=${catId}`);

// Products by brand + search
const products = await fetch(`/products?brandId=${brandId}&search=galaxy`);
```

---

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Brand not found",
  "error": "Not Found"
}
```

---

## 📝 Request/Response Examples

### Complete Example: Creating and Using a Brand

```bash
# Step 1: Admin creates brand
curl -X POST http://localhost:3000/admin/brands \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung",
    "image": "https://cdn.example.com/samsung.png",
    "description": "Leading electronics brand"
  }'

# Response
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "_id": "65abc123...",
    "name": "Samsung",
    "slug": "samsung",
    ...
  }
}

# Step 2: Admin creates product with brand
curl -X POST http://localhost:3000/admin/catalog/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "categoryId": "65xyz789...",
    "brandId": "65abc123...",
    "description": "Latest flagship smartphone"
  }'

# Step 3: Users get products by brand (no auth needed)
curl http://localhost:3000/products?brandId=65abc123...

# Step 4: Users get brand page data
curl http://localhost:3000/brands/slug/samsung
curl http://localhost:3000/brands/65abc123.../categories
```

---

## 🚀 Rate Limits

- **Admin Endpoints**: 100 requests/minute per IP
- **Public Endpoints**: 200 requests/minute per IP
- **Analytics Endpoints** (view/click): 1000 requests/minute per IP

---

## 📚 Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/api-docs
```

---

## ✅ Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/admin/brands` | POST | ✅ | Create brand |
| `/admin/brands` | GET | ✅ | List brands |
| `/admin/brands/:id` | GET | ✅ | Get brand |
| `/admin/brands/:id` | PATCH | ✅ | Update brand |
| `/admin/brands/:id` | DELETE | ✅ | Delete brand |
| `/brands` | GET | ❌ | List active brands |
| `/brands/:id` | GET | ❌ | Get brand |
| `/brands/slug/:slug` | GET | ❌ | Get brand by slug |
| `/admin/banners` | POST | ✅ | Create banner |
| `/admin/banners` | GET | ✅ | List banners |
| `/admin/banners/:id` | GET | ✅ | Get banner |
| `/admin/banners/:id` | PATCH | ✅ | Update banner |
| `/admin/banners/:id` | DELETE | ✅ | Delete banner |
| `/banners` | GET | ❌ | List active banners |
| `/banners/:id` | GET | ❌ | Get banner |
| `/banners/:id/view` | POST | ❌ | Track view |
| `/banners/:id/click` | POST | ❌ | Track click |
| `/products?brandId=X` | GET | ❌ | Filter by brand |
| `/brands/:id/categories` | GET | ❌ | Get brand categories |

---

## 🎯 Pro Tips

1. **Use slugs for SEO**: `/brands/slug/samsung` instead of `/brands/65abc...`
2. **Cache brands**: They rarely change, cache on frontend
3. **Track views smartly**: Once per session, not on every render
4. **Optimize images**: Compress and use CDN
5. **Use pagination**: Don't load all data at once

---

**Happy coding!** 🚀

