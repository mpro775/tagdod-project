# 📊 C4 Model - Level 3: Component Diagram

## نظرة عامة
هذا المستوى يوضح **المكونات الداخلية** (Components) لحاوية **Backend API** وكيف تتفاعل مع بعضها.

---

## 🎯 معمارية Backend API

### النمط المعماري
**Modular Monolith with Layered Architecture**

```mermaid
graph TB
    subgraph Presentation["🎨 Presentation Layer"]
        Controllers["Controllers<br/>• REST Endpoints<br/>• Request Validation<br/>• Response Formatting"]
        Guards["Guards<br/>• JWT Auth<br/>• Role-Based<br/>• Rate Limiting"]
        Interceptors["Interceptors<br/>• Logging<br/>• Transform<br/>• Cache"]
    end

    subgraph Application["⚙️ Application Layer"]
        Services["Services<br/>• Business Logic<br/>• Orchestration<br/>• Validation"]
        DTOs["DTOs<br/>• Data Transfer<br/>• Validation Rules"]
    end

    subgraph Domain["🏛️ Domain Layer"]
        Schemas["Schemas<br/>• Mongoose Models<br/>• Business Rules<br/>• Relationships"]
        Entities["Domain Entities<br/>• Core Logic"]
    end

    subgraph Infrastructure["🔧 Infrastructure Layer"]
        Database["Database<br/>• MongoDB<br/>• Mongoose ODM"]
        Cache["Cache<br/>• Redis<br/>• ioredis"]
        External["External Services<br/>• Payment<br/>• SMS<br/>• Email<br/>• Storage"]
    end

    subgraph Shared["🔄 Shared Layer"]
        Utils["Utilities<br/>• Helpers<br/>• Constants"]
        Exceptions["Exceptions<br/>• Custom Errors"]
        Decorators["Decorators<br/>• Metadata"]
    end

    Controllers --> Guards
    Controllers --> Interceptors
    Controllers --> Services
    Services --> DTOs
    Services --> Schemas
    Schemas --> Database
    Services --> Cache
    Services --> External
    Services --> Utils
    Services --> Exceptions
    Controllers --> Decorators

    classDef presentation fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef application fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef domain fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef infrastructure fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef shared fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    class Controllers,Guards,Interceptors presentation
    class Services,DTOs application
    class Schemas,Entities domain
    class Database,Cache,External infrastructure
    class Utils,Exceptions,Decorators shared
```

---

## 📦 الوحدات الرئيسية (Modules)

### هيكل الوحدات

```
src/
├── main.ts                    # نقطة البداية
├── app.module.ts              # الوحدة الرئيسية
│
├── config/                    # إعدادات النظام
│   └── env.validation.ts
│
├── modules/                   # وحدات الأعمال
│   ├── auth/                  # 🔐 المصادقة
│   ├── users/                 # 👥 المستخدمون
│   ├── products/              # 📦 المنتجات
│   ├── categories/            # 📂 الفئات
│   ├── attributes/            # 🏷️ السمات
│   ├── brands/                # 🔖 الماركات
│   ├── catalog/               # 🛍️ الكتالوج
│   ├── cart/                  # 🛒 السلة
│   ├── checkout/              # 💳 الشراء
│   ├── services/              # 🔧 الخدمات
│   ├── coupons/               # 🎫 الكوبونات
│   ├── promotions/            # 🎉 العروض
│   ├── addresses/             # 📍 العناوين
│   ├── favorites/             # ❤️ المفضلة
│   ├── support/               # 💬 الدعم
│   ├── notifications/         # 🔔 الإشعارات
│   ├── analytics/             # 📊 التحليلات
│   ├── upload/                # 📤 الملفات
│   ├── search/                # 🔍 البحث
│   ├── banners/               # 🖼️ البنرات
│   ├── pricing/               # 💰 التسعير
│   └── security/              # 🛡️ الأمان
│
└── shared/                    # مشتركات
    ├── cache/                 # Cache Module
    ├── decorators/            # Custom Decorators
    ├── exceptions/            # Custom Exceptions
    ├── filters/               # Exception Filters
    ├── guards/                # Custom Guards
    ├── interceptors/          # Interceptors
    ├── middleware/            # Middleware
    └── utils/                 # Utilities
```

---

## 🔐 Auth Module (وحدة المصادقة)

### المكونات

```mermaid
graph LR
    subgraph AuthModule["🔐 Auth Module"]
        AuthController["Auth Controller<br/><br/>POST /auth/register<br/>POST /auth/send-otp<br/>POST /auth/verify-otp<br/>POST /auth/login<br/>POST /auth/refresh<br/>POST /auth/logout"]
        
        AuthService["Auth Service<br/><br/>• التسجيل<br/>• إرسال OTP<br/>• التحقق<br/>• تسجيل الدخول<br/>• Refresh Token<br/>• Logout"]
        
        JWTStrategy["JWT Strategy<br/><br/>• Token Validation<br/>• User Extraction"]
        
        JWTGuard["JWT Guard<br/><br/>• حماية المسارات<br/>• التحقق من Token"]
    end

    subgraph External["خارجي"]
        SMS["SMS Service"]
        Redis["Redis<br/>OTP Storage"]
    end

    subgraph Database["قاعدة البيانات"]
        UserSchema["User Schema"]
    end

    AuthController --> AuthService
    AuthService --> JWTStrategy
    AuthService --> UserSchema
    AuthService --> SMS
    AuthService --> Redis
    JWTGuard --> JWTStrategy

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00
    classDef guard fill:#e8f5e9,stroke:#388e3c

    class AuthController controller
    class AuthService service
    class JWTGuard,JWTStrategy guard
```

### المسؤوليات

**AuthController**:
- استقبال طلبات المصادقة
- التحقق من البيانات (DTOs)
- إرجاع Tokens

**AuthService**:
- منطق المصادقة
- توليد JWT Tokens
- إرسال OTP عبر SMS
- التحقق من OTP
- Refresh Token Management

**JWTStrategy & Guard**:
- التحقق من صحة Token
- استخراج معلومات المستخدم
- حماية المسارات

---

## 👥 Users Module (وحدة المستخدمين)

### المكونات

```mermaid
graph TB
    subgraph UsersModule["👥 Users Module"]
        AdminController["Admin Users Controller<br/><br/>GET /admin/users<br/>GET /admin/users/:id<br/>PATCH /admin/users/:id<br/>DELETE /admin/users/:id<br/>PATCH /admin/users/:id/roles"]
        
        ProfileController["Profile Controller<br/><br/>GET /users/profile<br/>PATCH /users/profile<br/>PATCH /users/change-password"]
        
        UsersService["Users Service<br/><br/>• إدارة المستخدمين<br/>• الأدوار والصلاحيات<br/>• الملف الشخصي"]
    end

    subgraph Guards["الحماية"]
        JWTGuard["JWT Guard"]
        AdminGuard["Admin Guard"]
        RolesGuard["Roles Guard"]
    end

    subgraph Database["قاعدة البيانات"]
        UserSchema["User Schema<br/><br/>• الاسم والهاتف<br/>• الأدوار<br/>• الصلاحيات<br/>• الحالة"]
    end

    AdminController --> AdminGuard
    AdminController --> UsersService
    ProfileController --> JWTGuard
    ProfileController --> UsersService
    UsersService --> UserSchema

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00
    classDef guard fill:#e8f5e9,stroke:#388e3c

    class AdminController,ProfileController controller
    class UsersService service
    class JWTGuard,AdminGuard,RolesGuard guard
```

### الأدوار (Roles)

```typescript
enum UserRole {
  CUSTOMER = 'customer',      // العميل
  ADMIN = 'admin',            // المدير
  SUPER_ADMIN = 'super_admin', // المدير الأعلى
  ENGINEER = 'engineer',      // المهندس
  SUPPORT = 'support'         // الدعم الفني
}
```

### الصلاحيات (Permissions)

```typescript
// أمثلة على الصلاحيات
permissions: [
  'products.create',
  'products.update',
  'products.delete',
  'orders.view',
  'orders.update',
  'users.manage',
  // ... إلخ
]
```

---

## 📦 Products Module (وحدة المنتجات)

### المكونات

```mermaid
graph TB
    subgraph ProductsModule["📦 Products Module"]
        AdminController["Admin Products Controller<br/><br/>POST /admin/products<br/>PATCH /admin/products/:id<br/>DELETE /admin/products/:id<br/>GET /admin/products"]
        
        PublicController["Public Products Controller<br/><br/>GET /products<br/>GET /products/:id<br/>GET /products/slug/:slug"]
        
        ProductsService["Products Service<br/><br/>• CRUD المنتجات<br/>• التحقق من المخزون<br/>• حساب الأسعار<br/>• الفلترة والبحث"]
    end

    subgraph Related["وحدات ذات علاقة"]
        CategoriesService["Categories Service"]
        AttributesService["Attributes Service"]
        BrandsService["Brands Service"]
        MediaService["Media Service"]
        CacheService["Cache Service"]
    end

    subgraph Database["قاعدة البيانات"]
        ProductSchema["Product Schema<br/><br/>• معلومات أساسية<br/>• الأسعار<br/>• المخزون<br/>• الصور<br/>• المواصفات<br/>• SEO"]
    end

    AdminController --> ProductsService
    PublicController --> ProductsService
    ProductsService --> ProductSchema
    ProductsService --> CategoriesService
    ProductsService --> AttributesService
    ProductsService --> BrandsService
    ProductsService --> MediaService
    ProductsService --> CacheService

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00

    class AdminController,PublicController controller
    class ProductsService,CategoriesService,AttributesService,BrandsService,MediaService,CacheService service
```

### Product Schema

```typescript
Product {
  _id: ObjectId
  name: { ar: string, en: string }
  description: { ar: string, en: string }
  slug: { ar: string, en: string }
  sku: string
  
  // السعر
  price: number
  compareAtPrice: number
  cost: number
  
  // المخزون
  stock: number
  lowStockThreshold: number
  trackInventory: boolean
  
  // العلاقات
  category: ObjectId -> Category
  brand: ObjectId -> Brand
  attributes: [{
    attribute: ObjectId -> Attribute
    value: string
  }]
  
  // الصور
  images: [{
    url: string
    alt: string
    isPrimary: boolean
  }]
  
  // المواصفات
  specifications: [{
    name: { ar: string, en: string }
    value: { ar: string, en: string }
  }]
  
  // SEO
  seo: {
    title: { ar: string, en: string }
    description: { ar: string, en: string }
    keywords: string[]
  }
  
  // الحالة
  status: 'draft' | 'active' | 'archived'
  featured: boolean
  
  // التواريخ
  createdAt: Date
  updatedAt: Date
}
```

---

## 🛒 Cart Module (وحدة السلة)

### المكونات

```mermaid
graph TB
    subgraph CartModule["🛒 Cart Module"]
        CartController["Cart Controller<br/><br/>GET /cart<br/>POST /cart/items<br/>PATCH /cart/items/:id<br/>DELETE /cart/items/:id<br/>DELETE /cart/clear<br/>POST /cart/apply-coupon"]
        
        CartService["Cart Service<br/><br/>• إدارة السلة<br/>• حساب المجاميع<br/>• تطبيق الكوبونات<br/>• التحقق من المخزون<br/>• مزامنة السلة"]
        
        CartCron["Cart Cron<br/><br/>• تنظيف السلات القديمة<br/>• تحديث الأسعار"]
    end

    subgraph Related["وحدات ذات علاقة"]
        ProductsService["Products Service"]
        CouponsService["Coupons Service"]
        PricingService["Pricing Service"]
    end

    subgraph Database["قاعدة البيانات"]
        CartSchema["Cart Schema<br/><br/>• المستخدم/الجلسة<br/>• المنتجات<br/>• الكوبون<br/>• المجاميع"]
    end

    CartController --> CartService
    CartService --> ProductsService
    CartService --> CouponsService
    CartService --> PricingService
    CartService --> CartSchema
    CartCron --> CartService

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00
    classDef cron fill:#f3e5f5,stroke:#7b1fa2

    class CartController controller
    class CartService,ProductsService,CouponsService,PricingService service
    class CartCron cron
```

### Cart Schema

```typescript
Cart {
  _id: ObjectId
  
  // المالك
  user?: ObjectId -> User        // للمستخدمين المسجلين
  sessionId?: string             // للضيوف
  
  // المنتجات
  items: [{
    product: ObjectId -> Product
    quantity: number
    price: number                // السعر وقت الإضافة
    subtotal: number
  }]
  
  // الكوبون
  coupon?: {
    code: string
    discount: number
    type: 'percentage' | 'fixed'
  }
  
  // المجاميع
  subtotal: number               // قبل الخصم
  discount: number               // قيمة الخصم
  tax: number                    // الضريبة
  shipping: number               // الشحن
  total: number                  // المجموع النهائي
  
  // الحالة
  status: 'active' | 'abandoned' | 'converted'
  
  // التواريخ
  createdAt: Date
  updatedAt: Date
  expiresAt: Date               // تنتهي بعد 30 يوم
}
```

### منطق حساب السعر

```typescript
// 1. حساب المجموع الفرعي
subtotal = sum(item.price * item.quantity)

// 2. تطبيق الكوبون
if (coupon.type === 'percentage') {
  discount = subtotal * (coupon.discount / 100)
} else {
  discount = coupon.discount
}

// 3. حساب الضريبة (15% في السعودية)
tax = (subtotal - discount) * 0.15

// 4. حساب الشحن (حسب المنطقة)
shipping = calculateShipping(address, weight)

// 5. المجموع النهائي
total = subtotal - discount + tax + shipping
```

---

## 💳 Checkout Module (وحدة الشراء)

### المكونات

```mermaid
graph TB
    subgraph CheckoutModule["💳 Checkout Module"]
        CheckoutController["Checkout Controller<br/><br/>POST /checkout<br/>POST /checkout/validate<br/>GET /orders/:id<br/>POST /orders/:id/cancel"]
        
        CheckoutService["Checkout Service<br/><br/>• التحقق من البيانات<br/>• إنشاء الطلب<br/>• معالجة الدفع<br/>• إرسال الإشعارات"]
        
        OrdersService["Orders Service<br/><br/>• إدارة الطلبات<br/>• تحديث الحالات<br/>• تتبع الطلبات"]
        
        PaymentService["Payment Service<br/><br/>• التكامل مع بوابة الدفع<br/>• معالجة Webhooks<br/>• Refunds"]
    end

    subgraph Related["وحدات ذات علاقة"]
        CartService["Cart Service"]
        ProductsService["Products Service"]
        NotificationsService["Notifications Service"]
        InvoiceService["Invoice Service"]
    end

    subgraph Database["قاعدة البيانات"]
        OrderSchema["Order Schema"]
        PaymentSchema["Payment Schema"]
        InvoiceSchema["Invoice Schema"]
    end

    CheckoutController --> CheckoutService
    CheckoutService --> OrdersService
    CheckoutService --> PaymentService
    CheckoutService --> CartService
    CheckoutService --> ProductsService
    CheckoutService --> NotificationsService
    CheckoutService --> InvoiceService
    
    OrdersService --> OrderSchema
    PaymentService --> PaymentSchema
    InvoiceService --> InvoiceSchema

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00

    class CheckoutController controller
    class CheckoutService,OrdersService,PaymentService,CartService,ProductsService,NotificationsService,InvoiceService service
```

### تدفق عملية الشراء

```mermaid
sequenceDiagram
    participant C as Customer
    participant API as Checkout Service
    participant Cart as Cart Service
    participant Prod as Products Service
    participant Order as Orders Service
    participant Pay as Payment Service
    participant Notif as Notifications

    C->>API: POST /checkout
    API->>Cart: احصل على السلة
    Cart-->>API: بيانات السلة
    
    API->>Prod: تحقق من المخزون
    Prod-->>API: متوفر ✓
    
    API->>Order: إنشاء طلب (pending)
    Order-->>API: Order Created
    
    API->>Pay: طلب جلسة دفع
    Pay-->>API: payment_url
    API-->>C: payment_url
    
    C->>Pay: يدفع
    Pay->>API: Webhook: success
    
    API->>Order: تحديث (paid)
    API->>Prod: خصم من المخزون
    API->>Cart: تحويل إلى converted
    API->>Notif: إرسال إشعارات
    
    API-->>C: تأكيد الطلب
```

### Order States

```typescript
enum OrderStatus {
  PENDING = 'pending',              // في انتظار الدفع
  PAYMENT_FAILED = 'payment_failed', // فشل الدفع
  PAID = 'paid',                    // تم الدفع
  CONFIRMED = 'confirmed',          // تم التأكيد
  PROCESSING = 'processing',        // قيد التجهيز
  SHIPPED = 'shipped',              // تم الشحن
  OUT_FOR_DELIVERY = 'out_for_delivery', // في الطريق
  DELIVERED = 'delivered',          // تم التوصيل
  CANCELLED = 'cancelled',          // ملغي
  REFUNDED = 'refunded'            // مسترد
}
```

---

## 🔧 Services Module (وحدة الخدمات)

### المكونات

```mermaid
graph TB
    subgraph ServicesModule["🔧 Services Module"]
        CustomerController["Customer Controller<br/><br/>GET /services<br/>POST /services/request<br/>GET /services/my-requests"]
        
        EngineerController["Engineer Controller<br/><br/>GET /engineer/services<br/>PATCH /engineer/services/:id<br/>POST /engineer/services/:id/notes"]
        
        AdminController["Admin Controller<br/><br/>GET /admin/services<br/>PATCH /admin/services/:id/assign<br/>GET /admin/services/analytics"]
        
        ServicesService["Services Service<br/><br/>• إدارة الطلبات<br/>• تعيين المهندسين<br/>• تتبع الحالة<br/>• جدولة المواعيد"]
    end

    subgraph Database["قاعدة البيانات"]
        ServiceSchema["Service Schema<br/><br/>• نوع الخدمة<br/>• العميل<br/>• المهندس<br/>• الموعد<br/>• الحالة<br/>• الملاحظات"]
    end

    CustomerController --> ServicesService
    EngineerController --> ServicesService
    AdminController --> ServicesService
    ServicesService --> ServiceSchema

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00

    class CustomerController,EngineerController,AdminController controller
    class ServicesService service
```

---

## 🔔 Notifications Module (وحدة الإشعارات)

### المكونات

```mermaid
graph TB
    subgraph NotificationsModule["🔔 Notifications Module"]
        NotifController["Notifications Controller<br/><br/>GET /notifications<br/>PATCH /notifications/:id/read<br/>PATCH /notifications/read-all"]
        
        NotifService["Notifications Service<br/><br/>• إنشاء الإشعارات<br/>• إرسال متعدد القنوات<br/>• تتبع الحالة"]
        
        Providers["Notification Providers<br/><br/>• SMS Provider<br/>• Email Provider<br/>• Push Provider<br/>• In-App Provider"]
    end

    subgraph External["خارجي"]
        SMS["SMS Service"]
        Email["Email Service"]
        Firebase["Firebase FCM"]
    end

    subgraph Database["قاعدة البيانات"]
        NotifSchema["Notification Schema"]
    end

    NotifController --> NotifService
    NotifService --> Providers
    NotifService --> NotifSchema
    
    Providers --> SMS
    Providers --> Email
    Providers --> Firebase

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00

    class NotifController controller
    class NotifService service
```

### أنواع الإشعارات

```typescript
enum NotificationType {
  // الطلبات
  ORDER_CREATED = 'order_created',
  ORDER_PAID = 'order_paid',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  
  // الخدمات
  SERVICE_REQUESTED = 'service_requested',
  SERVICE_ASSIGNED = 'service_assigned',
  SERVICE_SCHEDULED = 'service_scheduled',
  SERVICE_COMPLETED = 'service_completed',
  
  // الدعم
  TICKET_CREATED = 'ticket_created',
  TICKET_REPLIED = 'ticket_replied',
  TICKET_CLOSED = 'ticket_closed',
  
  // النظام
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  PROMOTION = 'promotion',
  LOW_STOCK = 'low_stock'
}
```

---

## 📊 Analytics Module (وحدة التحليلات)

### المكونات

```mermaid
graph TB
    subgraph AnalyticsModule["📊 Analytics Module"]
        AnalyticsController["Analytics Controller<br/><br/>GET /admin/analytics/overview<br/>GET /admin/analytics/sales<br/>GET /admin/analytics/products<br/>GET /admin/analytics/customers"]
        
        AdvancedController["Advanced Analytics<br/><br/>GET /admin/analytics/cohort<br/>GET /admin/analytics/retention<br/>GET /admin/analytics/funnel"]
        
        AnalyticsService["Analytics Service<br/><br/>• جمع البيانات<br/>• معالجة الإحصائيات<br/>• إنشاء التقارير<br/>• تحليل متقدم"]
        
        EventsService["Events Service<br/><br/>• تتبع الأحداث<br/>• تخزين البيانات<br/>• معالجة الأحداث"]
    end

    subgraph Database["قاعدة البيانات"]
        AnalyticsSchema["Analytics Events<br/><br/>• نوع الحدث<br/>• البيانات<br/>• الوقت<br/>• المستخدم"]
    end

    subgraph Cache["التخزين المؤقت"]
        Redis["Redis<br/>Real-time Counters"]
    end

    AnalyticsController --> AnalyticsService
    AdvancedController --> AnalyticsService
    AnalyticsService --> EventsService
    EventsService --> AnalyticsSchema
    AnalyticsService --> Redis

    classDef controller fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#fff3e0,stroke:#f57c00

    class AnalyticsController,AdvancedController controller
    class AnalyticsService,EventsService service
```

### الأحداث المتتبعة

```typescript
// أحداث المنتجات
- product_viewed
- product_added_to_cart
- product_removed_from_cart
- product_purchased

// أحداث الطلبات
- order_created
- order_completed
- order_cancelled

// أحداث المستخدمين
- user_registered
- user_logged_in
- user_profile_updated

// أحداث البحث
- search_performed
- search_no_results
```

---

## 🛡️ Security Module (وحدة الأمان)

### المكونات

```mermaid
graph TB
    subgraph SecurityModule["🛡️ Security Module"]
        RateLimitService["Rate Limiting Service<br/><br/>• تحديد معدل الطلبات<br/>• منع DDoS<br/>• قواعد مخصصة"]
        
        CORSService["CORS Service<br/><br/>• إعدادات CORS<br/>• Whitelist<br/>• Preflight"]
        
        Guards["Security Guards<br/><br/>• Admin Guard<br/>• Engineer Guard<br/>• Permissions Guard"]
        
        Interceptors["Security Interceptors<br/><br/>• Logging<br/>• Sanitization"]
    end

    subgraph Infrastructure["البنية التحتية"]
        Redis["Redis<br/>Rate Limit Counters"]
        Helmet["Helmet<br/>Security Headers"]
    end

    RateLimitService --> Redis
    CORSService --> Helmet

    classDef service fill:#fff3e0,stroke:#f57c00
    classDef guard fill:#e8f5e9,stroke:#388e3c

    class RateLimitService,CORSService service
    class Guards,Interceptors guard
```

### Rate Limiting Rules

```typescript
// قواعد عامة
{
  '/api': { points: 100, duration: 60 },  // 100 طلب في الدقيقة
  
  // حساسة
  '/auth/send-otp': { points: 3, duration: 300 },   // 3 في 5 دقائق
  '/auth/verify-otp': { points: 5, duration: 300 }, // 5 في 5 دقائق
  '/auth/login': { points: 5, duration: 900 },      // 5 في 15 دقيقة
  
  // Admin
  '/admin': { points: 200, duration: 60 },  // 200 في الدقيقة
}
```

---

## 🔄 Shared Layer (الطبقة المشتركة)

### المكونات

```mermaid
graph TB
    subgraph SharedLayer["🔄 Shared Layer"]
        CacheModule["Cache Module<br/><br/>• Redis Client<br/>• Cache Decorators<br/>• TTL Management"]
        
        Decorators["Custom Decorators<br/><br/>@Language()<br/>@Permissions()<br/>@Roles()<br/>@CurrentUser()"]
        
        Exceptions["Custom Exceptions<br/><br/>• AppException<br/>• ValidationException<br/>• BusinessException"]
        
        Filters["Exception Filters<br/><br/>• Global Filter<br/>• Error Formatting<br/>• Logging"]
        
        Guards["Guards<br/><br/>• CacheGuard<br/>• RoleGuard<br/>• PermissionGuard"]
        
        Interceptors["Interceptors<br/><br/>• Response Envelope<br/>• Cache Interceptor<br/>• Transform"]
        
        Middleware["Middleware<br/><br/>• Request ID<br/>• Cache Headers<br/>• Logger"]
        
        Utils["Utilities<br/><br/>• i18n Util<br/>• Slug Generator<br/>• Helpers"]
    end

    classDef shared fill:#f3e5f5,stroke:#7b1fa2

    class CacheModule,Decorators,Exceptions,Filters,Guards,Interceptors,Middleware,Utils shared
```

### Cache Strategy

```typescript
// استراتيجية التخزين المؤقت

// 1. Products - 1 ساعة
@CacheTTL(3600)
getProduct(id: string): Promise<Product>

// 2. Categories - 6 ساعات
@CacheTTL(21600)
getCategories(): Promise<Category[]>

// 3. User Profile - 15 دقيقة
@CacheTTL(900)
getUserProfile(userId: string): Promise<User>

// 4. Cart - لا يُخزن مؤقتاً (Dynamic)
getCart(userId: string): Promise<Cart>
```

---

## 🔌 التكامل مع الخدمات الخارجية

### Architecture Pattern: Ports & Adapters

```mermaid
graph LR
    subgraph Core["النواة"]
        Service["Service<br/>(Business Logic)"]
    end

    subgraph Ports["المنافذ"]
        IPayment["IPaymentProvider"]
        ISMS["ISMSProvider"]
        IEmail["IEmailProvider"]
        IStorage["IStorageProvider"]
    end

    subgraph Adapters["المحولات"]
        StripeAdapter["Stripe Adapter"]
        TwilioAdapter["Twilio Adapter"]
        SendGridAdapter["SendGrid Adapter"]
        S3Adapter["S3 Adapter"]
    end

    Service --> IPayment
    Service --> ISMS
    Service --> IEmail
    Service --> IStorage

    IPayment --> StripeAdapter
    ISMS --> TwilioAdapter
    IEmail --> SendGridAdapter
    IStorage --> S3Adapter

    classDef core fill:#fff3e0,stroke:#f57c00
    classDef port fill:#e3f2fd,stroke:#1976d2
    classDef adapter fill:#e8f5e9,stroke:#388e3c

    class Service core
    class IPayment,ISMS,IEmail,IStorage port
    class StripeAdapter,TwilioAdapter,SendGridAdapter,S3Adapter adapter
```

### فوائد هذا النمط:
1. **سهولة تبديل الخدمات**: يمكن تغيير Stripe إلى PayPal بسهولة
2. **قابلية الاختبار**: يمكن عمل Mock للمحولات
3. **فصل المسؤوليات**: النواة لا تعتمد على تفاصيل الخدمات الخارجية

---

## 📈 الأداء والتحسينات

### 1. Database Indexing

```typescript
// Product Schema
@Schema({ timestamps: true })
class Product {
  @Index()
  sku: string;
  
  @Index()
  slug: { ar: string, en: string };
  
  @Index()
  category: ObjectId;
  
  @Index()
  status: string;
  
  @Index({ featured: 1, status: 1 })
  // Compound index
}
```

### 2. Query Optimization

```typescript
// ✅ جيد: استعلام محسّن
const products = await this.productModel
  .find({ status: 'active' })
  .select('name price images')
  .limit(20)
  .lean(); // لا نحتاج Mongoose Document

// ❌ سيء: استعلام غير محسّن
const products = await this.productModel.find();
```

### 3. Pagination

```typescript
// Cursor-based pagination (أفضل للبيانات الكبيرة)
async findProducts(cursor?: string, limit = 20) {
  const query = cursor 
    ? { _id: { $gt: cursor } }
    : {};
    
  const products = await this.productModel
    .find(query)
    .limit(limit)
    .sort({ _id: 1 });
    
  return {
    data: products,
    nextCursor: products.length === limit 
      ? products[products.length - 1]._id 
      : null
  };
}
```

### 4. Caching Strategy

```mermaid
graph LR
    Request["طلب"] --> L1["L1 Cache<br/>(Memory)<br/>10 ثوانٍ"]
    L1 -->|Miss| L2["L2 Cache<br/>(Redis)<br/>1 ساعة"]
    L2 -->|Miss| DB["Database<br/>(MongoDB)"]
    
    DB --> L2
    L2 --> L1
    L1 --> Response["استجابة"]

    classDef cache fill:#e1f5ff,stroke:#01579b
    classDef db fill:#e8f5e9,stroke:#388e3c

    class L1,L2 cache
    class DB db
```

---

## 🔄 Event-Driven Architecture (مستقبلاً)

### الرؤية المستقبلية

```mermaid
graph TB
    subgraph Services["الخدمات"]
        OrderService["Order Service"]
        PaymentService["Payment Service"]
        NotifService["Notification Service"]
        InventoryService["Inventory Service"]
    end

    subgraph EventBus["ناقل الأحداث"]
        RabbitMQ["RabbitMQ / Kafka"]
    end

    OrderService -->|OrderCreated| RabbitMQ
    PaymentService -->|PaymentCompleted| RabbitMQ
    
    RabbitMQ -->|Subscribe| NotifService
    RabbitMQ -->|Subscribe| InventoryService

    classDef service fill:#fff3e0,stroke:#f57c00
    classDef bus fill:#f3e5f5,stroke:#7b1fa2

    class OrderService,PaymentService,NotifService,InventoryService service
    class RabbitMQ bus
```

---

## 📊 مقاييس الأداء المتوقعة

### Response Times

| Endpoint | المتوقع | المقبول | حرج |
|----------|---------|---------|-----|
| GET /products | < 100ms | < 300ms | > 500ms |
| POST /checkout | < 500ms | < 1000ms | > 2000ms |
| GET /cart | < 50ms | < 150ms | > 300ms |
| POST /auth/login | < 300ms | < 600ms | > 1000ms |

### Cache Hit Rates

| Resource | المستهدف |
|----------|---------|
| Products | > 85% |
| Categories | > 95% |
| User Profile | > 70% |
| Overall | > 80% |

---

**السابق**: [← Level 2 - Container Diagram](./02-container-diagram.md)  
**التالي**: [Level 4 - Code Diagrams →](./04-code-diagrams.md)

