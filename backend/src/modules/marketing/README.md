# Marketing Module - Unified Marketing Management

This module provides a comprehensive solution for all marketing-related functionality including promotions, coupons, banners, and pricing.

## 🎯 Features

### Price Rules & Promotions
- **Complete Price Rules Management**: Create, read, update, delete, activate/deactivate price rules
- **Flexible Conditions**: Rules can be applied based on category, product, variant, brand, currency, quantity, and account type
- **Multiple Effects**: Support for percentage discount, fixed amount discount, special pricing, badges, and gift items
- **Usage Limits**: Control maximum uses per rule and per user
- **Metadata Support**: Title, description, and terms & conditions for each promotion
- **Priority System**: Rules are applied in priority order
- **Time-based Rules**: Rules have start and end dates
- **Statistics Tracking**: Views, applications, revenue, and savings tracking

### Coupons
- **Multiple Coupon Types**: Percentage, fixed amount, free shipping, buy X get Y
- **Flexible Targeting**: Apply to all products, specific products, categories, or brands
- **Usage Controls**: Global and per-user usage limits
- **User Restrictions**: Include or exclude specific users
- **Validation System**: Real-time coupon validation
- **Statistics**: Track redemptions, discounts given, and revenue

### Banners
- **Multiple Locations**: Home, category, product pages, sidebar, footer
- **Promotion Types**: Discount, free shipping, new arrivals, sales, seasonal
- **Targeting**: User type, audience, category, and product-specific targeting
- **User Type Targeting**: Display banners to specific user roles (user, engineer, merchant, admin, super_admin) or to everyone
- **Navigation Support**: When clicked, banners can navigate to:
  - **Category Details**: Navigate to a specific category page
  - **Product Details**: Navigate to a specific product page
  - **App Section**: Navigate to a specific section/screen in the app
  - **External URL**: Open an external link
  - **None**: No navigation (display only)
- **Scheduling**: Start and end dates with display duration
- **Analytics**: View and click tracking
- **Sorting**: Custom sort order for banner display

### Pricing Engine
- **Effective Price Calculation**: Calculate final prices after applying all applicable promotions
- **Multi-currency Support**: Handle different currencies
- **Cart-level Pricing**: Calculate prices for entire shopping carts
- **Real-time Updates**: Live price calculations

## 🚀 API Endpoints

### Admin Endpoints (require authentication)

#### Price Rules
- `POST /admin/marketing/price-rules` - Create a new price rule
- `GET /admin/marketing/price-rules` - List all price rules
- `GET /admin/marketing/price-rules/:id` - Get a specific price rule
- `PATCH /admin/marketing/price-rules/:id` - Update a price rule
- `DELETE /admin/marketing/price-rules/:id` - Delete a price rule
- `POST /admin/marketing/price-rules/:id/toggle` - Toggle rule active/inactive status
- `POST /admin/marketing/price-rules/preview` - Preview rule effect on a variant

#### Coupons
- `POST /admin/marketing/coupons` - Create a new coupon
- `GET /admin/marketing/coupons` - List all coupons with filters
- `GET /admin/marketing/coupons/:id` - Get a specific coupon
- `PATCH /admin/marketing/coupons/:id` - Update a coupon
- `DELETE /admin/marketing/coupons/:id` - Delete a coupon
- `POST /admin/marketing/coupons/validate` - Validate a coupon

#### Banners
- `POST /admin/marketing/banners` - Create a new banner
- `GET /admin/marketing/banners` - List all banners with filters
- `GET /admin/marketing/banners/:id` - Get a specific banner
- `PATCH /admin/marketing/banners/:id` - Update a banner
- `DELETE /admin/marketing/banners/:id` - Delete a banner

### Public Endpoints

#### Pricing
- `GET /marketing/pricing/variant` - Get effective price for a variant

#### Coupons
- `GET /marketing/coupons/validate` - Validate a coupon code

#### Banners
- `GET /marketing/banners` - Get active banners (optionally filtered by location and user type). Returns banners matching user's roles or general banners if not authenticated
- `GET /marketing/banners/:id/view` - Track banner view
- `GET /marketing/banners/:id/click` - Track banner click

## 📊 Data Models

### Price Rule Schema
```typescript
{
  active: boolean,
  priority: number,
  startAt: Date,
  endAt: Date,
  conditions: {
    categoryId?: string,
    productId?: string,
    variantId?: string,
    brandId?: string,
    currency?: string,
    minQty?: number,
    accountType?: string
  },
  effects: {
    percentOff?: number,
    amountOff?: number,
    specialPrice?: number,
    badge?: string,
    giftSku?: string
  },
  usageLimits?: {
    maxUses?: number,
    maxUsesPerUser?: number,
    currentUses: number
  },
  metadata?: {
    title?: string,
    description?: string,
    termsAndConditions?: string
  },
  stats: {
    views: number,
    appliedCount: number,
    revenue: number,
    savings: number
  },
  couponCode?: string
}
```

### Coupon Schema
```typescript
{
  code: string,
  name: string,
  description?: string,
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y',
  status: 'active' | 'inactive' | 'expired' | 'exhausted',
  visibility: 'public' | 'private' | 'hidden',
  discountValue?: number,
  minimumOrderAmount?: number,
  maximumDiscountAmount?: number,
  usageLimit?: number,
  usageLimitPerUser?: number,
  usedCount: number,
  validFrom: Date,
  validUntil: Date,
  appliesTo: 'all_products' | 'specific_products' | 'specific_categories' | 'specific_brands' | 'minimum_order_amount',
  applicableProductIds: string[],
  applicableCategoryIds: string[],
  applicableBrandIds: string[],
  applicableUserIds: string[],
  excludedUserIds: string[],
  buyXQuantity?: number,
  getYQuantity?: number,
  getYProductId?: string,
  totalRedemptions: number,
  totalDiscountGiven: number,
  totalRevenue: number
}
```

### Banner Schema
```typescript
{
  title: string,
  description?: string,
  imageUrl: string,
  linkUrl?: string, // Legacy field - kept for backward compatibility
  altText?: string,
  // Navigation settings
  navigationType: 'external_url' | 'category' | 'product' | 'section' | 'none',
  navigationTarget?: string, // Category ID, Product ID, Section name, or external URL
  navigationParams?: Record<string, unknown>, // Additional parameters for navigation
  location: 'home_top' | 'home_middle' | 'home_bottom' | 'category_top' | 'product_page' | 'cart_page' | 'checkout_page' | 'sidebar' | 'footer',
  promotionType?: 'discount' | 'free_shipping' | 'new_arrival' | 'sale' | 'seasonal' | 'brand_promotion',
  isActive: boolean,
  sortOrder: number,
  startDate?: Date,
  endDate?: Date,
  displayDuration?: number,
  targetAudiences: string[],
  targetUserTypes: string[], // 'user' | 'engineer' | 'merchant' | 'admin' | 'super_admin'
  targetCategories: string[],
  targetProducts: string[],
  viewCount: number,
  clickCount: number,
  conversionCount: number
}
```

## 💡 Usage Examples

### Create a 20% discount for all products in a category
```json
POST /admin/marketing/price-rules
{
  "priority": 10,
  "startAt": "2024-01-01T00:00:00Z",
  "endAt": "2024-12-31T23:59:59Z",
  "conditions": {
    "categoryId": "electronics"
  },
  "effects": {
    "percentOff": 20,
    "badge": "خصم 20%"
  },
  "metadata": {
    "title": "عرض الإلكترونيات",
    "description": "خصم 20% على جميع الأجهزة الإلكترونية"
  }
}
```

### Create a limited-time coupon
```json
POST /admin/marketing/coupons
{
  "code": "SAVE20",
  "name": "خصم 20%",
  "description": "خصم 20% على الطلب الأول",
  "type": "percentage",
  "discountValue": 20,
  "minimumOrderAmount": 100,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T23:59:59Z",
  "appliesTo": "all_products"
}
```

### Create a promotional banner
```json
POST /admin/marketing/banners
{
  "title": "عرض الصيف الكبير",
  "description": "خصم يصل إلى 50% على جميع المنتجات",
  "imageUrl": "https://example.com/summer-sale.jpg",
  "linkUrl": "/summer-sale",
  "location": "home_top",
  "promotionType": "sale",
  "isActive": true,
  "sortOrder": 1,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "targetUserTypes": []  // Empty array = visible to everyone
}
```

### Create a banner targeting specific user types (e.g., engineers only)
```json
POST /admin/marketing/banners
{
  "title": "عرض خاص للمهندسين",
  "description": "معدات خاصة للمهندسين",
  "imageUrl": "https://example.com/engineers-sale.jpg",
  "linkUrl": "/engineers-sale",
  "location": "home_top",
  "promotionType": "discount",
  "isActive": true,
  "sortOrder": 2,
  "targetUserTypes": ["engineer"]  // Visible only to engineers
}
```

### Create a banner that navigates to a category when clicked
```json
POST /admin/marketing/banners
{
  "title": "عرض الإلكترونيات",
  "description": "تصفح فئة الإلكترونيات",
  "imageId": "507f1f77bcf86cd799439011",
  "location": "home_top",
  "promotionType": "sale",
  "isActive": true,
  "sortOrder": 1,
  "navigationType": "category",
  "navigationTarget": "507f1f77bcf86cd799439012",  // Category ID
  "targetUserTypes": []  // Visible to everyone
}
```

### Create a banner that navigates to a product when clicked
```json
POST /admin/marketing/banners
{
  "title": "منتج مميز",
  "description": "اكتشف هذا المنتج الرائع",
  "imageId": "507f1f77bcf86cd799439011",
  "location": "home_middle",
  "promotionType": "new_arrival",
  "isActive": true,
  "sortOrder": 2,
  "navigationType": "product",
  "navigationTarget": "507f1f77bcf86cd799439013",  // Product ID
  "targetUserTypes": []  // Visible to everyone
}
```

### Create a banner that navigates to an app section
```json
POST /admin/marketing/banners
{
  "title": "تسوق الآن",
  "description": "تصفح جميع المنتجات",
  "imageId": "507f1f77bcf86cd799439011",
  "location": "home_bottom",
  "isActive": true,
  "sortOrder": 3,
  "navigationType": "section",
  "navigationTarget": "products",  // Section name in the app
  "navigationParams": {
    "filter": "new",
    "sort": "popular"
  },
  "targetUserTypes": []  // Visible to everyone
}
```

### Create a banner with external URL
```json
POST /admin/marketing/banners
{
  "title": "زيارة موقعنا",
  "description": "تعرف على المزيد",
  "imageId": "507f1f77bcf86cd799439011",
  "location": "footer",
  "isActive": true,
  "sortOrder": 1,
  "navigationType": "external_url",
  "navigationTarget": "https://example.com/special-offer",
  "targetUserTypes": []  // Visible to everyone
}
```

## 🔧 Integration

This module replaces the separate `promotions`, `coupons`, `banners`, and `pricing` modules, providing a unified interface for all marketing functionality. The old modules can be safely removed once this module is fully integrated.

## 📈 Benefits

1. **Unified Management**: Single interface for all marketing activities
2. **Reduced Complexity**: No more duplicate functionality across modules
3. **Better Performance**: Optimized queries and shared resources
4. **Easier Maintenance**: Single codebase for all marketing features
5. **Consistent API**: Uniform response formats and error handling
6. **Better Analytics**: Combined statistics across all marketing channels

---

## ✅ System Status

**Marketing Module مكتمل بالكامل ويعمل كما هو موثق:**
- ✅ جميع Price Rules APIs مطبقة وتعمل
- ✅ نظام Coupons شامل ومتقدم
- ✅ إدارة Banners كاملة مع تتبع الإحصائيات
- ✅ Pricing Engine ذكي وفعال
- ✅ جميع Schemas دقيقة ومطابقة للواقع
- ✅ نظام الأمان والتحقق مفعل
- ✅ تكامل كامل مع باقي النظام