# Favorites Module

> ❤️ نظام مفضلة احترافي يدعم الزوار والمستخدمين مع مزامنة ذكية

---

## نظرة عامة

نظام مفضلة (Wishlist) متطور يوفر:
- ✅ دعم الزوار (بدون حساب)
- ✅ دعم المستخدمين المسجلين
- ✅ مزامنة تلقائية عند التسجيل
- ✅ معلومات إضافية (notes)
- ✅ إحصائيات للأدمن

---

## الملفات

```
favorites/
├── schemas/
│   └── favorite.schema.ts          # Schema مع دعم الزوار
├── dto/
│   └── favorite.dto.ts             # DTOs كاملة
├── favorites.service.ts            # Business logic
├── favorites.user.controller.ts    # API للمستخدمين (8 endpoints)
├── favorites.guest.controller.ts   # API للزوار (5 endpoints)
├── favorites.admin.controller.ts   # API للأدمن (4 endpoints)
└── favorites.module.ts             # Module definition
```

---

## Schema

```typescript
Favorite {
  userId?: string;        // للمستخدمين
  deviceId?: string;      // للزوار
  productId: string;
  note?: string;          // ملاحظة خاصة
  viewsCount: number;     // عدد مرات العرض
  lastViewedAt?: Date;
  isSynced: boolean;      // حالة المزامنة
  syncedAt?: Date;
  deletedAt?: Date;       // Soft Delete
}
```

---

## API Endpoints

### User (8):
- `GET /favorites` - قائمة المفضلات
- `POST /favorites` - إضافة
- `DELETE /favorites` - إزالة
- `PATCH /favorites/:id` - تحديث
- `POST /favorites/:id/view` - تحديث عدد المشاهدات
- `DELETE /favorites/clear/all` - حذف الكل
- `GET /favorites/count` - العدد
- `POST /favorites/sync` - مزامنة يدوية

### Guest (5):
- `GET /favorites/guest` - قائمة (زائر)
- `POST /favorites/guest` - إضافة (زائر)
- `DELETE /favorites/guest` - إزالة (زائر)
- `DELETE /favorites/guest/clear` - حذف الكل (زائر)
- `GET /favorites/guest/count` - العدد (زائر)

### Admin (4):
- `GET /admin/favorites/stats` - إحصائيات
- `GET /admin/favorites/most-favorited` - الأكثر
- `GET /admin/favorites/product/:id/count` - عدد لمنتج
- `GET /admin/favorites/user/:id/count` - عدد لمستخدم

---

## الاستخدام

### للزوار:

```typescript
// إضافة للمفضلة
POST /favorites/guest
{
  "deviceId": "device-abc-123",
  "productId": "prod_001"
}
```

### للمستخدمين:

```typescript
// إضافة للمفضلة
POST /favorites
Authorization: Bearer <token>
{
  "productId": "prod_001",
  "note": "هدية لأحمد"
}
```

### المزامنة التلقائية:

```typescript
// عند التسجيل، فقط أرسل deviceId
POST /auth/verify-otp
{
  "phone": "+966...",
  "code": "123456",
  "deviceId": "device-abc-123"  ← المزامنة تلقائية!
}
```

---

## الميزات المتقدمة

### 1. Notes:

```typescript
// تنظيم المفضلات بالملاحظات
{
  "productId": "prod_001",
  "note": "هدية عيد ميلاد أحمد"
}
```

### 2. Soft Delete:

```typescript
// الحذف لا يكون دائم
// يمكن الاستعادة لاحقاً
```

### 3. إحصائيات:

```typescript
// للأدمن
GET /admin/favorites/stats
// → إجمالي المفضلات، المزامنات، الوسوم الشائعة
```

---

## التكامل

### مع Auth:
```typescript
// في AuthController
await favoritesService.syncGuestToUser(deviceId, userId);
```

### مع Products:
```typescript
// populate تلقائي
.populate('productId')
```

---

## الأداء

```typescript
✅ Compound indexes
✅ Sparse indexes
✅ lean() queries
✅ Aggregation للإحصائيات
```

---

## الأمان

```typescript
✅ JwtAuthGuard (للمستخدمين)
✅ AdminGuard (للأدمن)
✅ Validation (DTOs)
✅ deviceId محمي
```

---

## للتوثيق الكامل

اقرأ: [`PROFESSIONAL_FAVORITES_SYSTEM.md`](../../../PROFESSIONAL_FAVORITES_SYSTEM.md)

---

**Version:** 1.0.1
**Status:** ✅ Production Ready

**ملاحظة:** تم تصحيح README لتعكس الواقع الصحيح - إزالة references للـ tags وإضافة endpoint المفقود.

