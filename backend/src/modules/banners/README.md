# Banners Management System

نظام إدارة البنرات الشامل لعرض الإعلانات والعروض في مواقع مختلفة من التطبيق.

## Features / المميزات

### Admin Features (للمسؤولين)
- ✅ إنشاء بنر جديد (صورة، عنوان، رابط)
- ✅ أنواع متعددة للبنرات (صورة، فيديو، carousel)
- ✅ تحديد موقع عرض البنر
- ✅ تحديد فترة زمنية للعرض (Start/End Date)
- ✅ تفعيل/إيقاف البنر
- ✅ ترتيب البنرات
- ✅ تتبع الإحصائيات (Views, Clicks)
- ✅ البحث والفلترة
- ✅ Pagination

### Public Features (للمستخدمين)
- ✅ عرض البنرات النشطة (بدون حماية)
- ✅ فلترة حسب الموقع (location)
- ✅ تسجيل مشاهدة البنر
- ✅ تسجيل النقر على البنر

## Banner Types / أنواع البنرات

```typescript
enum BannerType {
  IMAGE = 'image',      // Static image
  VIDEO = 'video',      // Video banner
  CAROUSEL = 'carousel' // Multiple images carousel
}
```

## Banner Locations / مواقع عرض البنرات

```typescript
enum BannerLocation {
  HOME_TOP = 'home_top',           // أعلى الصفحة الرئيسية
  HOME_MIDDLE = 'home_middle',     // وسط الصفحة الرئيسية
  HOME_BOTTOM = 'home_bottom',     // أسفل الصفحة الرئيسية
  CATEGORY_TOP = 'category_top',   // أعلى صفحة الفئة
  PRODUCT_SIDEBAR = 'product_sidebar', // جانب صفحة المنتج
  CUSTOM = 'custom'                // موقع مخصص
}
```

## API Endpoints

### Admin Endpoints (محمية - تتطلب صلاحيات Admin)

#### Create Banner
```http
POST /admin/banners
Authorization: Bearer {token}

Body:
{
  "title": "Summer Sale 2024",
  "description": "Get up to 50% off on selected items",
  "image": "https://cdn.example.com/banners/summer-sale.jpg",
  "type": "image",
  "location": "home_top",
  "linkUrl": "https://example.com/sale",
  "linkText": "Shop Now",
  "isActive": true,
  "sortOrder": 0,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "metadata": {}
}
```

#### List Banners
```http
GET /admin/banners?page=1&limit=20&search=Sale&isActive=true&location=home_top&sortBy=sortOrder&sortOrder=asc
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [...banners],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### Get Banner by ID
```http
GET /admin/banners/:id
Authorization: Bearer {token}
```

#### Update Banner
```http
PATCH /admin/banners/:id
Authorization: Bearer {token}

Body:
{
  "title": "Updated Title",
  "isActive": false,
  "sortOrder": 5
}
```

#### Delete Banner
```http
DELETE /admin/banners/:id
Authorization: Bearer {token}
```

#### Toggle Banner Status
```http
PATCH /admin/banners/:id/toggle-status
Authorization: Bearer {token}
```

### Public Endpoints (بدون حماية)

#### Get Active Banners
```http
GET /banners?location=home_top

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Summer Sale 2024",
      "description": "...",
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
```

**Query Parameters:**
- `location` (optional): Filter by banner location

#### Get Banner by ID
```http
GET /banners/:id
```

#### Track Banner View
```http
POST /banners/:id/view

Response:
{
  "success": true,
  "message": "View count incremented"
}
```

#### Track Banner Click
```http
POST /banners/:id/click

Response:
{
  "success": true,
  "message": "Click count incremented"
}
```

## Frontend/Mobile Integration / التكامل مع الواجهة الأمامية

### سيناريو 1: عرض بنرات الصفحة الرئيسية

```javascript
// Get banners for home page top section
const topBanners = await fetch('/banners?location=home_top');

// Display banners
topBanners.data.forEach(banner => {
  displayBanner(banner);
  
  // Track view when banner appears on screen
  trackBannerView(banner._id);
});

// When user clicks on banner
function onBannerClick(banner) {
  // Track click
  await fetch(`/banners/${banner._id}/click`, { method: 'POST' });
  
  // Navigate to link
  window.location.href = banner.linkUrl;
}
```

### سيناريو 2: عرض بنرات مختلفة في صفحات مختلفة

```javascript
// Home page - top section
const homeTopBanners = await fetch('/banners?location=home_top');

// Home page - middle section
const homeMiddleBanners = await fetch('/banners?location=home_middle');

// Category page - top section
const categoryBanners = await fetch('/banners?location=category_top');

// Product page - sidebar
const sidebarBanners = await fetch('/banners?location=product_sidebar');
```

### سيناريو 3: Carousel Banner

```javascript
// Get carousel banners
const carouselBanners = await fetch('/banners?location=home_top');

// Initialize carousel
const carousel = new Carousel({
  items: carouselBanners.data,
  autoPlay: true,
  interval: 5000
});

// Track view for each banner in carousel
carousel.on('slideChange', (banner) => {
  trackBannerView(banner._id);
});
```

### سيناريو 4: تتبع الإحصائيات بذكاء

```javascript
// Track view only once per session
const viewedBanners = new Set();

function trackBannerView(bannerId) {
  if (!viewedBanners.has(bannerId)) {
    fetch(`/banners/${bannerId}/view`, { method: 'POST' });
    viewedBanners.add(bannerId);
  }
}

// Track click
async function trackBannerClick(banner) {
  await fetch(`/banners/${banner._id}/click`, { method: 'POST' });
  
  // Redirect to link
  if (banner.linkUrl) {
    window.location.href = banner.linkUrl;
  }
}
```

## Database Schema

```typescript
{
  title: string;              // Banner title (required)
  description?: string;       // Banner description
  image: string;              // Banner image/video URL (required)
  type: BannerType;          // Type: image/video/carousel
  location: BannerLocation;  // Display location
  linkUrl?: string;          // Click destination URL
  linkText?: string;         // CTA text
  isActive: boolean;         // Active status
  sortOrder: number;         // Display order
  startDate?: Date;          // Start display date
  endDate?: Date;            // End display date
  clickCount: number;        // Number of clicks
  viewCount: number;         // Number of views
  metadata?: object;         // Additional data
  createdAt: Date;
  updatedAt: Date;
}
```

## Date Range Filtering / تصفية الفترة الزمنية

البنرات تُعرض فقط إذا كانت ضمن الفترة الزمنية المحددة:

- **No dates**: البنر يُعرض دائماً
- **Start date only**: يُعرض من تاريخ البدء فصاعداً
- **End date only**: يُعرض حتى تاريخ الانتهاء
- **Both dates**: يُعرض فقط بين التاريخين

```javascript
// Example: Winter sale banner
{
  "title": "Winter Sale",
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  // Will only show during December 2024 - January 2025
}
```

## Analytics / الإحصائيات

كل بنر يتتبع:
- **viewCount**: عدد مرات المشاهدة
- **clickCount**: عدد مرات النقر
- **CTR (Click-Through Rate)**: معدل النقر = (clickCount / viewCount) * 100

```javascript
// Calculate CTR
const ctr = (banner.clickCount / banner.viewCount) * 100;
console.log(`Banner CTR: ${ctr.toFixed(2)}%`);
```

## Examples / أمثلة

### مثال 1: بنر عرض موسمي

```json
POST /admin/banners
{
  "title": "Ramadan Special Offers",
  "description": "Exclusive deals for Ramadan",
  "image": "https://cdn.example.com/ramadan-banner.jpg",
  "type": "image",
  "location": "home_top",
  "linkUrl": "/promotions/ramadan",
  "linkText": "Explore Offers",
  "isActive": true,
  "sortOrder": 0,
  "startDate": "2024-03-10T00:00:00Z",
  "endDate": "2024-04-10T23:59:59Z"
}
```

### مثال 2: بنر دائم في الصفحة الرئيسية

```json
POST /admin/banners
{
  "title": "Free Shipping on Orders Over $50",
  "image": "https://cdn.example.com/free-shipping.jpg",
  "type": "image",
  "location": "home_middle",
  "isActive": true,
  "sortOrder": 0
  // No start/end dates - always visible
}
```

### مثال 3: بنر فيديو في جانب صفحة المنتج

```json
POST /admin/banners
{
  "title": "How to Use This Product",
  "image": "https://cdn.example.com/tutorial-video.mp4",
  "type": "video",
  "location": "product_sidebar",
  "isActive": true,
  "sortOrder": 0
}
```

## Best Practices / أفضل الممارسات

### 1. Image Optimization
- استخدم صور بجودة عالية لكن بحجم مناسب
- الأبعاد المقترحة:
  - Home Top: 1920x600px
  - Home Middle/Bottom: 1920x400px
  - Sidebar: 300x600px

### 2. Performance
- قلل عدد البنرات في الصفحة الواحدة (3-5 maximum)
- استخدم lazy loading للصور
- استخدم CDN لتحميل سريع

### 3. User Experience
- لا تجعل البنرات مزعجة
- اجعل زر الإغلاق واضحاً (للـ popups)
- تأكد من أن البنرات responsive

### 4. Analytics
- تتبع الـ views بذكاء (مرة واحدة per session)
- حلل الـ CTR لتحسين أداء البنرات
- أزل البنرات ذات الأداء الضعيف

## Notes / ملاحظات

1. **Auto-filtering**: البنرات تُفلتر تلقائياً حسب التاريخ الحالي
2. **Public Access**: جميع الـ endpoints العامة لا تتطلب Authentication
3. **Sorting**: البنرات تُرتب حسب `sortOrder` ثم `createdAt`
4. **Validation**: التحقق من صحة جميع الـ inputs
5. **Statistics**: الإحصائيات تُحفظ في الـ database بشكل فوري

## Security / الحماية

- ✅ Admin endpoints محمية بـ JWT + Roles Guard
- ✅ Public endpoints متاحة بدون authentication
- ✅ Validation على جميع الـ inputs
- ✅ Rate limiting على endpoints الإحصائيات

## Performance / الأداء

- ✅ Indexes على الحقول الهامة
- ✅ Lean queries for better performance
- ✅ Pagination support
- ✅ Date range filtering at database level

