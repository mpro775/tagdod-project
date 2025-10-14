# 📊 جدول مرجعي سريع للموديولات
# Quick Modules Reference Table

<div align="center">

**مرجع شامل لجميع الموديولات والـ Endpoints**

</div>

---

## 📋 جدول الموديولات الشامل

| # | الموديول | Controller | Endpoints | الحالة | الأولوية | الوقت | التبعيات |
|---|---------|-----------|-----------|--------|----------|-------|----------|
| 1 | **Users** | `/admin/users` | 14 | ✅ مكتمل | ⭐⭐⭐⭐⭐ | - | Capabilities |
| 2 | **Products** | `/admin/products` | 12 | ✅ مكتمل | ⭐⭐⭐⭐⭐ | - | Categories, Brands, Attributes |
| 3 | **Categories** | `/admin/categories` | 9 | 🔄 التالي | ⭐⭐⭐⭐⭐ | 6h | None |
| 4 | **Attributes** | `/admin/attributes` | 10 | 🔄 قريباً | ⭐⭐⭐⭐⭐ | 7h | Categories |
| 5 | **Brands** | `/admin/brands` | 6 | 🔄 قريباً | ⭐⭐⭐⭐ | 4h | Media |
| 6 | **Orders** | `/admin/orders` | 10 | 🔄 مهم | ⭐⭐⭐⭐⭐ | 10h | Users, Products, Coupons |
| 7 | **Coupons** | `/admin/coupons` | 9 | 🔄 قريباً | ⭐⭐⭐⭐ | 8h | Products, Categories |
| 8 | **Media** | `/admin/media` | 7 | 🔄 مهم | ⭐⭐⭐⭐ | 8h | None |
| 9 | **Banners** | `/admin/banners` | 6 | 🔄 قريباً | ⭐⭐⭐⭐ | 5h | Media, Products |
| 10 | **Promotions** | `/admin/promotions` | 5 | 🔄 متقدم | ⭐⭐⭐ | 6h | Products, Categories |
| 11 | **Catalog** | `/admin/catalog` | 10 | 🔄 متقدم | ⭐⭐⭐ | 9h | Products, Variants |
| 12 | **Analytics** | `/analytics/*` | 40+ | 🔄 مهم | ⭐⭐⭐⭐⭐ | 12h | All Modules |
| 13 | **Support** | `/admin/support` | 8 | 🔄 لاحقاً | ⭐⭐⭐ | 8h | Users, Orders |
| 14 | **Notifications** | `/admin/notifications` | 6 | 🔄 لاحقاً | ⭐⭐ | 5h | Users |
| 15 | **Services** | `/admin/services` | 4 | 🔄 لاحقاً | ⭐⭐ | 4h | Users, Capabilities |
| 16 | **Carts** | `/admin/carts` | 4 | 🔄 لاحقاً | ⭐⭐ | 3h | Users, Products |

**إجمالي:** 140+ endpoints | 103 ساعات (بدون المكتمل)

---

## 🗂️ Endpoints Breakdown

### Authentication (8 endpoints) ✅
```
✅ POST   /auth/send-otp
✅ POST   /auth/verify-otp
✅ POST   /auth/forgot-password
✅ POST   /auth/reset-password
✅ POST   /auth/set-password
✅ GET    /auth/me
✅ PATCH  /auth/me
✅ DELETE /auth/me
```

### Users (14 endpoints) ✅
```
✅ GET    /admin/users
✅ GET    /admin/users/:id
✅ POST   /admin/users
✅ PATCH  /admin/users/:id
✅ DELETE /admin/users/:id
✅ POST   /admin/users/:id/suspend
✅ POST   /admin/users/:id/activate
✅ POST   /admin/users/:id/restore
✅ DELETE /admin/users/:id/permanent
✅ GET    /admin/users/stats/summary
✅ POST   /admin/users/:id/assign-role
✅ POST   /admin/users/:id/remove-role
✅ POST   /admin/users/:id/add-permission
✅ POST   /admin/users/:id/remove-permission
```

### Products (12 endpoints) ✅
```
✅ POST   /admin/products
✅ GET    /admin/products
✅ GET    /admin/products/:id
✅ PATCH  /admin/products/:id
✅ DELETE /admin/products/:id
✅ POST   /admin/products/:id/restore
✅ POST   /admin/products/:id/update-stats
✅ POST   /admin/products/:id/variants
✅ PATCH  /admin/products/:id/variants/:variantId
✅ DELETE /admin/products/:id/variants/:variantId
✅ POST   /admin/products/:id/generate-variants
✅ POST   /admin/products/:id/variants/:variantId/set-default
```

### Categories (9 endpoints) 🔄
```
🔄 POST   /admin/categories
🔄 GET    /admin/categories
🔄 GET    /admin/categories/tree
🔄 GET    /admin/categories/:id
🔄 PATCH  /admin/categories/:id
🔄 DELETE /admin/categories/:id
🔄 POST   /admin/categories/:id/restore
🔄 POST   /admin/categories/reorder
🔄 GET    /admin/categories/stats
```

### Attributes (10 endpoints) 🔄
```
🔄 POST   /admin/attributes
🔄 GET    /admin/attributes
🔄 GET    /admin/attributes/:id
🔄 PATCH  /admin/attributes/:id
🔄 DELETE /admin/attributes/:id
🔄 POST   /admin/attributes/:id/restore
🔄 POST   /admin/attributes/:id/values
🔄 GET    /admin/attributes/:id/values
🔄 PATCH  /admin/attributes/values/:id
🔄 DELETE /admin/attributes/values/:id
```

### Brands (6 endpoints) 🔄
```
🔄 POST   /admin/brands
🔄 GET    /admin/brands
🔄 GET    /admin/brands/:id
🔄 PATCH  /admin/brands/:id
🔄 DELETE /admin/brands/:id
🔄 PATCH  /admin/brands/:id/toggle-status
```

### Banners (6 endpoints) 🔄
```
🔄 POST   /admin/banners
🔄 GET    /admin/banners
🔄 GET    /admin/banners/:id
🔄 PATCH  /admin/banners/:id
🔄 DELETE /admin/banners/:id
🔄 PATCH  /admin/banners/:id/toggle-status
```

### Orders (10 endpoints) 🔄
```
🔄 GET    /admin/orders
🔄 GET    /admin/orders/:id
🔄 PATCH  /admin/orders/:id/status
🔄 POST   /admin/orders/:id/ship
🔄 POST   /admin/orders/:id/cancel
🔄 POST   /admin/orders/:id/refund
🔄 POST   /admin/orders/:id/add-note
🔄 GET    /admin/orders/stats
🔄 GET    /admin/orders/:id/timeline
🔄 POST   /admin/orders/:id/resend-confirmation
```

### Coupons (9 endpoints) 🔄
```
🔄 POST   /admin/coupons
🔄 GET    /admin/coupons
🔄 GET    /admin/coupons/:id
🔄 PATCH  /admin/coupons/:id
🔄 DELETE /admin/coupons/:id
🔄 PATCH  /admin/coupons/:id/toggle-status
🔄 GET    /admin/coupons/:id/analytics
🔄 GET    /admin/coupons/:id/usage-history
🔄 POST   /admin/coupons/bulk-generate
```

### Media (7 endpoints) 🔄
```
🔄 POST   /admin/media/upload
🔄 GET    /admin/media
🔄 GET    /admin/media/:id
🔄 PATCH  /admin/media/:id
🔄 DELETE /admin/media/:id
🔄 POST   /admin/media/bulk-delete
🔄 POST   /admin/media/:id/regenerate-thumbnails
```

### Promotions (5 endpoints) 🔄
```
🔄 POST   /admin/promotions/rules
🔄 GET    /admin/promotions/rules
🔄 PATCH  /admin/promotions/rules/:id
🔄 POST   /admin/promotions/rules/:id/toggle
🔄 POST   /admin/promotions/preview
```

### Catalog (10 endpoints) 🔄
```
🔄 POST   /admin/catalog/products
🔄 GET    /admin/catalog/products/:id
🔄 PATCH  /admin/catalog/products/:id
🔄 POST   /admin/catalog/variants
🔄 PATCH  /admin/catalog/variants/:id
🔄 DELETE /admin/catalog/variants/:id
🔄 POST   /admin/catalog/variants/:id/price
🔄 POST   /admin/catalog/bulk-update-prices
🔄 POST   /admin/catalog/bulk-update-stock
🔄 GET    /admin/catalog/inventory
```

### Support (8 endpoints) 🔄
```
🔄 GET  /admin/support/tickets
🔄 GET  /admin/support/tickets/:id
🔄 PUT  /admin/support/tickets/:id
🔄 PUT  /admin/support/tickets/:id/assign
🔄 POST /admin/support/tickets/:id/messages
🔄 POST /admin/support/tickets/:id/close
🔄 GET  /admin/support/canned-responses
🔄 POST /admin/support/canned-responses
```

### Analytics (40+ endpoints) 🔄
```
🔄 GET /analytics/dashboard
🔄 GET /analytics/overview
🔄 GET /analytics/revenue
🔄 GET /analytics/users
🔄 GET /analytics/products
🔄 GET /analytics/services
🔄 GET /analytics/support
🔄 GET /analytics/performance
... (32+ more endpoints)
```

### Notifications (6 endpoints) 🔄
```
🔄 POST /admin/notifications/send
🔄 GET  /admin/notifications
🔄 POST /admin/notifications/broadcast
🔄 POST /admin/notifications/segment
🔄 GET  /admin/notifications/templates
🔄 POST /admin/notifications/templates
```

### Services (4 endpoints) 🔄
```
🔄 GET  /admin/services/requests
🔄 POST /admin/services/requests/:id/cancel
🔄 GET  /admin/services/engineers
🔄 POST /admin/services/engineers/:id/approve
```

### Carts (4 endpoints) 🔄
```
🔄 GET    /admin/carts
🔄 GET    /admin/carts/:id
🔄 DELETE /admin/carts/:id
🔄 GET    /admin/carts/abandoned
```

---

## 📊 Statistics Summary

### Progress
```
✅ Completed Modules: 2/16 (12.5%)
✅ Completed Endpoints: 33/140 (24%)
🔄 Remaining Modules: 14/16 (87.5%)
🔄 Remaining Endpoints: 107/140 (76%)
```

### Time Estimates
```
⏱️ Completed: ~30 hours (value)
⏱️ Remaining: ~103 hours
⏱️ Total: ~133 hours
📅 Timeline: 5 weeks (if full-time)
```

### Complexity Distribution
```
⭐⭐⭐⭐⭐ Critical: 6 modules (Categories, Attributes, Orders, Analytics, Users✅, Products✅)
⭐⭐⭐⭐ Important: 5 modules (Brands, Coupons, Media, Banners, Support)
⭐⭐⭐ Medium: 3 modules (Promotions, Catalog, Notifications)
⭐⭐ Low: 2 modules (Services, Carts)
```

---

## 🎯 الترتيب الموصى به

### المسار المثالي (3 أسابيع)

```
Week 1: Categories → Attributes → Brands
  ├─ Day 1-2: Categories (6h)
  ├─ Day 3-4: Attributes (7h)
  └─ Day 5: Brands (4h)
  Total: 17h | 3 modules

Week 2: Media → Orders → Coupons  
  ├─ Day 1-2: Media Library (8h)
  ├─ Day 3-4: Orders (10h)
  └─ Day 5: Coupons (8h)
  Total: 26h | 3 modules

Week 3: Banners → Analytics → Testing
  ├─ Day 1: Banners (5h)
  ├─ Day 2-4: Analytics (12h)
  └─ Day 5: Testing + Polish (8h)
  Total: 25h | 2 modules + testing

Grand Total: 68h | 8 modules (priority ones)
```

---

## 🔗 Dependency Chain

### يجب تنفيذها بالترتيب:

```
Level 0 (No Dependencies):
  ├─ Categories    → يمكن البدء فوراً
  ├─ Media Library → يمكن البدء فوراً
  └─ Brands        → يمكن البدء فوراً

Level 1 (Depends on Level 0):
  ├─ Attributes    → يحتاج Categories
  └─ Banners       → يحتاج Media

Level 2 (Depends on Level 0-1):
  ├─ Products      → يحتاج Categories + Brands + Attributes ✅
  └─ Coupons       → يحتاج Products + Categories

Level 3 (Depends on Level 0-2):
  └─ Orders        → يحتاج Users + Products + Coupons

Level 4 (Depends on All):
  └─ Analytics     → يحتاج جميع الموديولات
```

---

## 📚 Quick Reference

### For Each Module, You Need:

```
1. Types (types/*.types.ts)
   └─ Interface, Enums, DTOs

2. API Service (api/*Api.ts)
   └─ All CRUD methods

3. Custom Hooks (hooks/use*.ts)
   └─ useQuery & useMutation wrappers

4. List Page (pages/*ListPage.tsx)
   └─ DataTable + Filters

5. Form Page (pages/*FormPage.tsx)
   └─ Create/Edit form

6. Special Components (components/*)
   └─ Module-specific UI

7. Routes (core/router/routes.tsx)
   └─ Add to routes array
```

---

## 🎯 Next Steps

### ابدأ بـ Categories (الموصى به)

```bash
cd frontend/src/features
mkdir -p categories/{api,types,hooks,pages,components}
# ثم ابدأ التطوير حسب الخطة
```

---

**راجع:** `DASHBOARD_COMPLETION_PLAN.md` للتفاصيل الكاملة


