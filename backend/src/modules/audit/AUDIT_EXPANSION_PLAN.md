# خطة توسيع نظام التدقيق (Audit System Expansion Plan)

## 📋 نظرة عامة

هذا الملف يوضح الخطة الشاملة لإضافة العمليات المالية والحساسة إلى نظام التدقيق الحالي.

---

## 🎯 الهدف

توسيع نظام التدقيق ليشمل:
- ✅ العمليات المالية (طلبات، دفع، كوبونات)
- ✅ العمليات الحساسة (خدمات، تغييرات مهمة)
- ✅ العمليات الإدارية (تعديلات من الأدمن)

---

## 📊 التصنيفات المقترحة

### 1️⃣ العمليات المالية (Financial Operations)

#### الطلبات (Orders)
- `ORDER_CREATED` - إنشاء طلب جديد
- `ORDER_CANCELLED` - إلغاء طلب
- `ORDER_REFUNDED` - استرداد طلب
- `ORDER_STATUS_CHANGED` - تغيير حالة الطلب
- `ORDER_UPDATED_BY_ADMIN` - تعديل طلب من الأدمن

**الأماكن المطلوبة:**
- `backend/src/modules/checkout/controllers/order.controller.ts` - إنشاء طلب
- `backend/src/modules/checkout/controllers/admin-order.controller.ts` - تعديلات الأدمن
- `backend/src/modules/checkout/services/order.service.ts` - تغييرات الحالة

**معلومات يجب تسجيلها:**
```typescript
{
  userId: string,
  orderId: string,
  orderNumber: string,
  oldStatus?: OrderStatus,
  newStatus: OrderStatus,
  totalAmount: number,
  currency: string,
  reason?: string
}
```

#### المدفوعات (Payments)
- `PAYMENT_INITIATED` - بدء عملية دفع
- `PAYMENT_COMPLETED` - اكتمال الدفع
- `PAYMENT_FAILED` - فشل الدفع
- `PAYMENT_REFUNDED` - استرداد مبلغ
- `PAYMENT_STATUS_CHANGED` - تغيير حالة الدفع

**الأماكن المطلوبة:**
- `backend/src/modules/checkout/services/order.service.ts` - معالجة الدفع
- `backend/src/modules/checkout/controllers/webhook.controller.ts` - Webhooks

**معلومات يجب تسجيلها:**
```typescript
{
  userId: string,
  orderId: string,
  paymentMethod: PaymentMethod,
  amount: number,
  currency: string,
  transactionId?: string,
  failureReason?: string
}
```

#### الكوبونات (Coupons)
- `COUPON_APPLIED` - تطبيق كوبون بنجاح
- `COUPON_APPLICATION_FAILED` - فشل تطبيق كوبون
- `COUPON_CREATED` - إنشاء كوبون (Admin)
- `COUPON_ACTIVATED` - تفعيل كوبون (Admin)
- `COUPON_DEACTIVATED` - تعطيل كوبون (Admin)
- `COUPON_DELETED` - حذف كوبون (Admin)

**الأماكن المطلوبة:**
- `backend/src/modules/checkout/services/order.service.ts` - تطبيق الكوبون
- `backend/src/modules/marketing/controllers/coupon.controller.ts` - إدارة الكوبونات

**معلومات يجب تسجيلها:**
```typescript
{
  userId: string,
  couponCode: string,
  orderId?: string,
  discountAmount: number,
  failureReason?: string
}
```

---

### 2️⃣ العمليات الحساسة (Sensitive Operations)

#### الخدمات (Services)
- `SERVICE_REQUEST_CREATED` - إنشاء طلب خدمة
- `SERVICE_OFFER_ACCEPTED` - قبول عرض مهندس
- `SERVICE_OFFER_REJECTED` - رفض عرض
- `SERVICE_STARTED` - بدء الخدمة
- `SERVICE_COMPLETED` - إكمال الخدمة
- `SERVICE_CANCELLED` - إلغاء الخدمة

**الأماكن المطلوبة:**
- `backend/src/modules/services/customer.controller.ts` - طلبات العملاء
- `backend/src/modules/services/engineer.controller.ts` - عروض المهندسين
- `backend/src/modules/services/admin.controller.ts` - إدارة الأدمن

**معلومات يجب تسجيلها:**
```typescript
{
  userId: string,
  serviceRequestId: string,
  engineerId?: string,
  offerId?: string,
  price?: number,
  reason?: string
}
```

#### تغييرات البيانات الحساسة
- `ADDRESS_CHANGED` - تغيير عنوان التوصيل
- `PAYMENT_METHOD_CHANGED` - تغيير طريقة الدفع
- `PROFILE_SENSITIVE_UPDATED` - تحديث بيانات حساسة في الملف الشخصي

**الأماكن المطلوبة:**
- `backend/src/modules/users/controllers/user.controller.ts` - تحديث الملف الشخصي
- `backend/src/modules/checkout/controllers/order.controller.ts` - تغيير العنوان

---

### 3️⃣ العمليات الإدارية (Admin Operations)

#### المنتجات (Products)
- `PRODUCT_CREATED` - إنشاء منتج (Admin)
- `PRODUCT_UPDATED` - تحديث منتج (Admin)
- `PRODUCT_DELETED` - حذف منتج (Admin)
- `PRODUCT_PRICE_CHANGED` - تغيير سعر منتج (Admin)
- `PRODUCT_STATUS_CHANGED` - تغيير حالة منتج (Admin)
- `PRODUCT_STOCK_UPDATED` - تحديث المخزون (Admin)

**الأماكن المطلوبة:**
- `backend/src/modules/products/controllers/admin-product.controller.ts`

**معلومات يجب تسجيلها:**
```typescript
{
  performedBy: string, // Admin ID
  productId: string,
  oldValues: { price?: number, status?: string, stock?: number },
  newValues: { price?: number, status?: string, stock?: number }
}
```

#### الكوبونات (Admin)
- `COUPON_CREATED` - إنشاء كوبون
- `COUPON_UPDATED` - تحديث كوبون
- `COUPON_DELETED` - حذف كوبون
- `COUPON_ACTIVATED` - تفعيل كوبون
- `COUPON_DEACTIVATED` - تعطيل كوبون

**الأماكن المطلوبة:**
- `backend/src/modules/marketing/controllers/coupon.controller.ts`

---

## 🔧 التعديلات المطلوبة على Schema

### إضافة Actions جديدة

```typescript
export enum AuditAction {
  // ... الموجود حالياً
  
  // Orders
  ORDER_CREATED = 'order.created',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_REFUNDED = 'order.refunded',
  ORDER_STATUS_CHANGED = 'order.status.changed',
  ORDER_UPDATED_BY_ADMIN = 'order.updated.by.admin',
  
  // Payments
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  PAYMENT_STATUS_CHANGED = 'payment.status.changed',
  
  // Coupons
  COUPON_APPLIED = 'coupon.applied',
  COUPON_APPLICATION_FAILED = 'coupon.application.failed',
  COUPON_CREATED = 'coupon.created',
  COUPON_UPDATED = 'coupon.updated',
  COUPON_DELETED = 'coupon.deleted',
  COUPON_ACTIVATED = 'coupon.activated',
  COUPON_DEACTIVATED = 'coupon.deactivated',
  
  // Services
  SERVICE_REQUEST_CREATED = 'service.request.created',
  SERVICE_OFFER_ACCEPTED = 'service.offer.accepted',
  SERVICE_OFFER_REJECTED = 'service.offer.rejected',
  SERVICE_STARTED = 'service.started',
  SERVICE_COMPLETED = 'service.completed',
  SERVICE_CANCELLED = 'service.cancelled',
  
  // Products (Admin)
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  PRODUCT_PRICE_CHANGED = 'product.price.changed',
  PRODUCT_STATUS_CHANGED = 'product.status.changed',
  PRODUCT_STOCK_UPDATED = 'product.stock.updated',
  
  // Sensitive Data Changes
  ADDRESS_CHANGED = 'address.changed',
  PAYMENT_METHOD_CHANGED = 'payment.method.changed',
  PROFILE_SENSITIVE_UPDATED = 'profile.sensitive.updated',
}
```

### إضافة Resources جديدة

```typescript
export enum AuditResource {
  // ... الموجود حالياً
  ORDER = 'order',
  PAYMENT = 'payment',
  COUPON = 'coupon',
  SERVICE = 'service',
  PRODUCT = 'product',
  ADDRESS = 'address',
}
```

---

## 📝 دوال جديدة في AuditService

### 1. تسجيل أحداث الطلبات

```typescript
async logOrderEvent(data: {
  userId: string;
  orderId: string;
  action: 'created' | 'cancelled' | 'refunded' | 'status_changed' | 'updated_by_admin';
  orderNumber: string;
  oldStatus?: OrderStatus;
  newStatus?: OrderStatus;
  totalAmount?: number;
  currency?: string;
  performedBy?: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void>
```

### 2. تسجيل أحداث المدفوعات

```typescript
async logPaymentEvent(data: {
  userId: string;
  orderId: string;
  action: 'initiated' | 'completed' | 'failed' | 'refunded' | 'status_changed';
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  transactionId?: string;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void>
```

### 3. تسجيل أحداث الكوبونات

```typescript
async logCouponEvent(data: {
  userId?: string;
  couponCode: string;
  action: 'applied' | 'application_failed' | 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  orderId?: string;
  discountAmount?: number;
  failureReason?: string;
  performedBy?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void>
```

### 4. تسجيل أحداث الخدمات

```typescript
async logServiceEvent(data: {
  userId: string;
  serviceRequestId: string;
  action: 'request_created' | 'offer_accepted' | 'offer_rejected' | 'started' | 'completed' | 'cancelled';
  engineerId?: string;
  offerId?: string;
  price?: number;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void>
```

### 5. تسجيل أحداث المنتجات (Admin)

```typescript
async logProductEvent(data: {
  productId: string;
  action: 'created' | 'updated' | 'deleted' | 'price_changed' | 'status_changed' | 'stock_updated';
  performedBy: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void>
```

---

## 🗂️ قائمة الملفات المطلوب تعديلها

### Schema & Service
- [ ] `backend/src/modules/audit/schemas/audit-log.schema.ts` - إضافة Actions و Resources جديدة
- [ ] `backend/src/shared/services/audit.service.ts` - إضافة الدوال الجديدة

### Orders Module
- [ ] `backend/src/modules/checkout/controllers/order.controller.ts` - إضافة audit logging عند إنشاء/إلغاء طلب
- [ ] `backend/src/modules/checkout/controllers/admin-order.controller.ts` - إضافة audit logging للتعديلات الإدارية
- [ ] `backend/src/modules/checkout/services/order.service.ts` - إضافة audit logging لتغييرات الحالة والدفع

### Payments
- [ ] `backend/src/modules/checkout/controllers/webhook.controller.ts` - إضافة audit logging لـ webhooks
- [ ] `backend/src/modules/checkout/services/order.service.ts` - إضافة audit logging لمعالجة الدفع

### Coupons Module
- [ ] `backend/src/modules/marketing/controllers/coupon.controller.ts` - إضافة audit logging لإدارة الكوبونات
- [ ] `backend/src/modules/checkout/services/order.service.ts` - إضافة audit logging عند تطبيق الكوبون

### Services Module
- [ ] `backend/src/modules/services/customer.controller.ts` - إضافة audit logging لطلبات الخدمة
- [ ] `backend/src/modules/services/engineer.controller.ts` - إضافة audit logging للعروض
- [ ] `backend/src/modules/services/admin.controller.ts` - إضافة audit logging للإدارة

### Products Module
- [ ] `backend/src/modules/products/controllers/admin-product.controller.ts` - إضافة audit logging لإدارة المنتجات

### Users Module
- [ ] `backend/src/modules/users/controllers/user.controller.ts` - إضافة audit logging لتغييرات البيانات الحساسة

---

## ⚙️ الاعتبارات التقنية

### 1. الأداء
- ✅ جميع استدعاءات AuditService يجب أن تكون **async** مع `.catch()`
- ✅ استخدام **fire-and-forget** pattern لتجنب التأثير على الأداء
- ✅ إضافة **indexes** على `resource` و `resourceId` و `timestamp`

### 2. التخزين
- ✅ **Retention Policy**: 
  - العمليات المالية: **180+ يوم**
  - العمليات الحساسة: **180+ يوم**
  - العمليات الإدارية: **90 يوم**
  - العمليات العادية: **30 يوم**

### 3. التصنيف
- ✅ استخدام `isSensitive: true` للعمليات المالية والحساسة
- ✅ استخدام `metadata` لتخزين معلومات إضافية (مثل transactionId)

### 4. الأمان
- ✅ عدم تسجيل معلومات حساسة مثل:
  - أرقام البطاقات الكاملة
  - CVV
  - كلمات المرور
  - Tokens كاملة

---

## 📈 أولويات التنفيذ

### المرحلة 1: العمليات المالية (الأولوية العالية)
1. ✅ الطلبات (Orders) - `ORDER_CREATED`, `ORDER_CANCELLED`, `ORDER_REFUNDED`
2. ✅ المدفوعات (Payments) - `PAYMENT_COMPLETED`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`
3. ✅ الكوبونات (Coupons) - `COUPON_APPLIED`, `COUPON_APPLICATION_FAILED`

### المرحلة 2: العمليات الحساسة (الأولوية المتوسطة)
4. ✅ الخدمات (Services) - جميع الأحداث
5. ✅ تغييرات البيانات الحساسة

### المرحلة 3: العمليات الإدارية (الأولوية المنخفضة)
6. ✅ المنتجات (Products) - التعديلات الإدارية
7. ✅ الكوبونات (Admin) - الإدارة الكاملة

---

## 🧪 الاختبار

### اختبارات مطلوبة:
- [ ] اختبار تسجيل إنشاء طلب
- [ ] اختبار تسجيل فشل/نجاح الدفع
- [ ] اختبار تسجيل تطبيق كوبون
- [ ] اختبار تسجيل طلب خدمة
- [ ] اختبار تسجيل تعديل منتج من الأدمن
- [ ] اختبار الأداء مع حجم كبير من البيانات
- [ ] اختبار Retention Policy

---

## 📊 أمثلة على الاستخدام

### مثال 1: تسجيل إنشاء طلب

```typescript
// في order.controller.ts
async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
  const order = await this.orderService.createOrder(dto, req.user.sub);
  
  // تسجيل في audit
  this.auditService.logOrderEvent({
    userId: req.user.sub,
    orderId: String(order._id),
    action: 'created',
    orderNumber: order.orderNumber,
    newStatus: order.status,
    totalAmount: order.total,
    currency: order.currency,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  }).catch(err => this.logger.error('Failed to log order event', err));
  
  return order;
}
```

### مثال 2: تسجيل تطبيق كوبون

```typescript
// في order.service.ts
async applyCoupon(orderId: string, couponCode: string, userId: string) {
  const result = await this.validateAndApplyCoupon(orderId, couponCode);
  
  if (result.success) {
    this.auditService.logCouponEvent({
      userId,
      couponCode,
      action: 'applied',
      orderId,
      discountAmount: result.discount,
    }).catch(err => this.logger.error('Failed to log coupon event', err));
  } else {
    this.auditService.logCouponEvent({
      userId,
      couponCode,
      action: 'application_failed',
      orderId,
      failureReason: result.reason,
    }).catch(err => this.logger.error('Failed to log coupon event', err));
  }
  
  return result;
}
```

### مثال 3: تسجيل تغيير سعر منتج (Admin)

```typescript
// في admin-product.controller.ts
async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: Request) {
  const product = await this.productService.findById(id);
  const oldPrice = product.price;
  
  const updated = await this.productService.update(id, dto);
  
  // تسجيل في audit
  if (dto.price !== undefined && dto.price !== oldPrice) {
    this.auditService.logProductEvent({
      productId: id,
      action: 'price_changed',
      performedBy: req.user.sub,
      oldValues: { price: oldPrice },
      newValues: { price: dto.price },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch(err => this.logger.error('Failed to log product event', err));
  }
  
  return updated;
}
```

---

## ✅ Checklist التنفيذ

### التحضير
- [ ] تحديث Schema بإضافة Actions و Resources جديدة
- [ ] إضافة الدوال الجديدة في AuditService
- [ ] تحديث README.md

### التنفيذ - المرحلة 1
- [ ] إضافة audit logging في Orders Module
- [ ] إضافة audit logging في Payments
- [ ] إضافة audit logging في Coupons (تطبيق)

### التنفيذ - المرحلة 2
- [ ] إضافة audit logging في Services Module
- [ ] إضافة audit logging لتغييرات البيانات الحساسة

### التنفيذ - المرحلة 3
- [ ] إضافة audit logging في Products Module (Admin)
- [ ] إضافة audit logging في Coupons Module (Admin)

### الاختبار والتحسين
- [ ] اختبار جميع السيناريوهات
- [ ] اختبار الأداء
- [ ] إضافة Retention Policy
- [ ] تحديث الوثائق

---

## 📝 ملاحظات إضافية

1. **التوافق مع النظام الحالي**: جميع التعديلات يجب أن تكون متوافقة مع نظام التدقيق الموجود
2. **التدرج في التنفيذ**: يمكن تنفيذ المراحل بشكل تدريجي حسب الأولوية
3. **المراقبة**: بعد التنفيذ، يجب مراقبة حجم البيانات والأداء
4. **التوثيق**: تحديث README.md بعد كل مرحلة

---

## 🔗 روابط مفيدة

- [نظام التدقيق الحالي](./README.md)
- [Schema الحالي](./schemas/audit-log.schema.ts)
- [AuditService](../shared/services/audit.service.ts)

---

**تاريخ الإنشاء**: 2024  
**آخر تحديث**: 2024  
**الحالة**: 📋 خطة - جاهزة للتنفيذ

