# نظام الطلبات - Orders System

## نظرة عامة

نظام شامل لإدارة الطلبات في الواجهة الإدارية، يوفر جميع العمليات المطلوبة لإدارة الطلبات من البداية إلى النهاية.

## الميزات الرئيسية

### 1. إدارة الطلبات
- ✅ عرض جميع الطلبات مع فلاتر متقدمة
- ✅ البحث والفلترة حسب الحالة، طريقة الدفع، التاريخ
- ✅ العمليات المجمعة (تحديث عدة طلبات)
- ✅ تحديث حالة الطلب
- ✅ شحن الطلبات
- ✅ معالجة الاستردادات
- ✅ إلغاء الطلبات
- ✅ إضافة ملاحظات إدارية

### 2. تفاصيل الطلب
- ✅ عرض شامل لتفاصيل الطلب
- ✅ تتبع حالة الطلب (Timeline)
- ✅ معلومات العميل وعنوان التوصيل
- ✅ تفاصيل المنتجات والأسعار
- ✅ معلومات الشحن والتتبع
- ✅ تاريخ تغيير الحالات
- ✅ الملاحظات والإضافات

### 3. التحليلات والتقارير
- ✅ تحليلات شاملة للطلبات
- ✅ تحليل الإيرادات
- ✅ تحليل الأداء
- ✅ إحصائيات مفصلة
- ✅ تقارير قابلة للتصدير

## البنية التقنية

### الملفات الرئيسية

```
orders/
├── api/
│   └── ordersApi.ts          # API calls للطلبات
├── hooks/
│   └── useOrders.ts          # React hooks للعمليات
├── pages/
│   ├── OrdersListPage.tsx    # صفحة قائمة الطلبات
│   ├── OrderDetailsPage.tsx  # صفحة تفاصيل الطلب
│   └── OrderAnalyticsPage.tsx # صفحة التحليلات
├── components/
│   ├── OrderStatusChip.tsx   # مكون حالة الطلب
│   ├── OrderTimeline.tsx     # مكون تتبع الطلب
│   └── OrderSummary.tsx      # مكون ملخص الطلب
├── types/
│   └── order.types.ts        # أنواع البيانات
└── index.ts                  # ملف التصدير الرئيسي
```

### أنواع البيانات (Types)

#### OrderStatus
```typescript
enum OrderStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  PAYMENT_FAILED = 'payment_failed',
  PROCESSING = 'processing',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  RETURNED = 'returned',
}
```

#### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}
```

### API Endpoints

#### العمليات الأساسية
- `GET /admin/orders` - قائمة الطلبات مع الفلاتر
- `GET /admin/orders/:id` - تفاصيل طلب محدد
- `PATCH /admin/orders/:id/status` - تحديث حالة الطلب
- `POST /admin/orders/:id/ship` - شحن الطلب
- `POST /admin/orders/:id/refund` - معالجة الاسترداد
- `POST /admin/orders/:id/cancel` - إلغاء الطلب
- `POST /admin/orders/:id/notes` - إضافة ملاحظات

#### العمليات المجمعة
- `POST /admin/orders/bulk/update-status` - تحديث عدة طلبات

#### التحليلات والتقارير
- `GET /admin/orders/analytics/summary` - تحليلات شاملة
- `GET /admin/orders/analytics/revenue` - تحليل الإيرادات
- `GET /admin/orders/analytics/performance` - تحليل الأداء
- `GET /admin/orders/reports/orders` - تقرير الطلبات
- `GET /admin/orders/reports/financial` - التقرير المالي

## الاستخدام

### 1. عرض قائمة الطلبات

```typescript
import { OrdersListPage } from '@/features/orders';

// في التوجيه (Routing)
<Route path="/orders" element={<OrdersListPage />} />
```

### 2. عرض تفاصيل الطلب

```typescript
import { OrderDetailsPage } from '@/features/orders';

// في التوجيه (Routing)
<Route path="/orders/:id" element={<OrderDetailsPage />} />
```

### 3. استخدام Hooks

```typescript
import { useOrders, useUpdateOrderStatus } from '@/features/orders';

function OrdersComponent() {
  const { data: orders, isLoading } = useOrders({ page: 1, limit: 20 });
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateStatus.mutateAsync({
      id: orderId,
      data: { status, notes: 'تم تحديث الحالة' }
    });
  };

  return (
    // JSX
  );
}
```

### 4. استخدام المكونات

```typescript
import { OrderStatusChip, OrderTimeline, OrderSummary } from '@/features/orders';

function OrderCard({ order }) {
  return (
    <Card>
      <CardContent>
        <OrderStatusChip status={order.status} />
        <OrderSummary order={order} />
        <OrderTimeline order={order} />
      </CardContent>
    </Card>
  );
}
```

## الميزات المتقدمة

### 1. الفلاتر المتقدمة
- فلترة حسب الحالة
- فلترة حسب طريقة الدفع
- فلترة حسب التاريخ
- البحث في رقم الطلب أو اسم العميل
- ترتيب متقدم

### 2. العمليات المجمعة
- تحديد عدة طلبات
- تحديث حالة عدة طلبات في عملية واحدة
- معالجة الأخطاء الفردية

### 3. التتبع والمراقبة
- خط زمني تفاعلي لتتبع الطلب
- تاريخ تغيير الحالات
- ملاحظات وتفاصيل كل تغيير

### 4. التحليلات المتقدمة
- إحصائيات شاملة
- تحليل الإيرادات
- تحليل الأداء
- تقارير قابلة للتصدير

## التكامل مع الباك إند

النظام متكامل بالكامل مع الباك إند ويستخدم نفس:
- أنواع البيانات (Types)
- أسماء العمليات (API endpoints)
- هيكل الاستجابة (Response structure)
- نمط الأخطاء (Error handling)

## الأمان

- جميع العمليات تتطلب صلاحيات إدارية
- التحقق من البيانات قبل الإرسال
- معالجة شاملة للأخطاء
- تسجيل جميع العمليات

## الأداء

- استخدام React Query للـ caching
- تحميل تدريجي للبيانات
- تحسين استعلامات قاعدة البيانات
- واجهة مستخدم سريعة ومتجاوبة

## الصيانة والتطوير

- كود منظم وقابل للقراءة
- مكونات قابلة لإعادة الاستخدام
- توثيق شامل
- اختبارات شاملة
- معالجة أخطاء احترافية

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
