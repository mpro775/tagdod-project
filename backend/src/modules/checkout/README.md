# نظام الطلبات والدفع الموحد

## 📋 نظرة عامة

نظام موحد احترافي لإدارة الطلبات والدفع، يوفر:
- إدارة شاملة لحالات الطلبات
- نظام دفع متكامل
- تتبع الطلبات في الوقت الفعلي
- تحليلات وإحصائيات متقدمة
- واجهات API موحدة

## 🏗️ الهيكل الموحد

```
checkout/
├── schemas/
│   ├── order.schema.ts          # Schema موحد للطلبات
│   ├── inventory.schema.ts      # إدارة المخزون
│   ├── reservation.schema.ts    # حجز المنتجات
│   └── inventory-ledger.schema.ts # سجل المخزون
├── services/
│   └── order.service.ts          # خدمة موحدة للطلبات
├── controllers/
│   ├── order.controller.ts       # Controller للعملاء
│   ├── admin-order.controller.ts # Controller للإدارة
│   └── webhook.controller.ts     # Controller للـ Webhooks
├── dto/
│   └── order.dto.ts             # DTOs موحدة
├── utils/
│   └── order-state-machine.ts   # State Machine للطلبات
└── checkout.module.ts           # Module موحد
```

## 🔄 حالات الطلبات (OrderStatus)

### مراحل الإنشاء
- `DRAFT` - مسودة
- `PENDING_PAYMENT` - في انتظار الدفع

### مراحل التأكيد
- `CONFIRMED` - مؤكد
- `PAYMENT_FAILED` - فشل الدفع

### مراحل التنفيذ
- `PROCESSING` - قيد المعالجة
- `READY_TO_SHIP` - جاهز للشحن
- `SHIPPED` - تم الشحن
- `OUT_FOR_DELIVERY` - جاري التوصيل

### مراحل التسليم
- `DELIVERED` - تم التسليم
- `COMPLETED` - مكتمل

### حالات خاصة
- `ON_HOLD` - معلق
- `CANCELLED` - ملغي
- `REFUNDED` - مسترد
- `PARTIALLY_REFUNDED` - مسترد جزئياً
- `RETURNED` - مرتجع

## 💳 حالات الدفع (PaymentStatus)

- `PENDING` - في الانتظار
- `AUTHORIZED` - مخول
- `PAID` - مدفوع
- `FAILED` - فشل
- `REFUNDED` - مسترد
- `PARTIALLY_REFUNDED` - مسترد جزئياً
- `CANCELLED` - ملغي

## 🚚 طرق الشحن (ShippingMethod)

- `STANDARD` - عادي
- `EXPRESS` - سريع
- `SAME_DAY` - نفس اليوم
- `PICKUP` - استلام شخصي

## 💰 طرق الدفع (PaymentMethod)

- `COD` - الدفع عند الاستلام
- `ONLINE` - دفع إلكتروني
- `WALLET` - محفظة إلكترونية
- `BANK_TRANSFER` - تحويل بنكي

## 🔧 State Machine

نظام إدارة حالات متقدم يضمن:
- انتقالات صحيحة بين الحالات
- التحقق من الصلاحيات
- منع الانتقالات غير المسموحة
- تتبع تاريخ التغييرات

### مثال على الاستخدام:

```typescript
import { OrderStateMachine } from './utils/order-state-machine';

// التحقق من إمكانية الانتقال
const canTransition = OrderStateMachine.canTransition(
  OrderStatus.PENDING_PAYMENT, 
  OrderStatus.CONFIRMED
);

// الحصول على الحالات التالية
const nextStates = OrderStateMachine.getNextStates(OrderStatus.PROCESSING);

// التحقق من إمكانية الإلغاء
const canCancel = OrderStateMachine.canCancel(OrderStatus.CONFIRMED);
```

## 📡 API Endpoints

### للعملاء (`/orders`)

#### Checkout
- `POST /orders/checkout/preview` - معاينة الطلب
- `POST /orders/checkout/confirm` - تأكيد الطلب

#### إدارة الطلبات
- `GET /orders` - قائمة الطلبات
- `GET /orders/recent` - الطلبات الأخيرة
- `GET /orders/:id` - تفاصيل الطلب
- `GET /orders/:id/track` - تتبع الطلب
- `POST /orders/:id/cancel` - إلغاء الطلب
- `POST /orders/:id/rate` - تقييم الطلب
- `POST /orders/:id/notes` - إضافة ملاحظات

#### الإحصائيات
- `GET /orders/stats/summary` - إحصائيات المستخدم

### للإدارة (`/admin/orders`)

#### إدارة الطلبات
- `GET /admin/orders` - جميع الطلبات
- `GET /admin/orders/:id` - تفاصيل الطلب
- `PATCH /admin/orders/:id/status` - تحديث الحالة
- `POST /admin/orders/:id/ship` - شحن الطلب
- `POST /admin/orders/:id/refund` - معالجة الاسترداد
- `POST /admin/orders/:id/notes` - ملاحظات إدارية

#### العمليات المجمعة
- `POST /admin/orders/bulk/update-status` - تحديث عدة طلبات

#### التحليلات
- `GET /admin/orders/analytics/summary` - تحليلات شاملة
- `GET /admin/orders/analytics/revenue` - تحليل الإيرادات
- `GET /admin/orders/analytics/performance` - تحليل الأداء

#### التقارير
- `GET /admin/orders/reports/orders` - تقرير الطلبات
- `GET /admin/orders/reports/financial` - التقرير المالي

### Webhooks (`/webhooks`)

- `POST /webhooks/payment` - إشعارات الدفع
- `POST /webhooks/shipping` - إشعارات الشحن
- `POST /webhooks/inventory` - إشعارات المخزون

## 📊 الميزات المتقدمة

### 1. تتبع الطلبات
- خط زمني تفاعلي
- تحديثات في الوقت الفعلي
- إشعارات تلقائية

### 2. إدارة المخزون
- حجز تلقائي للمنتجات
- تتبع المخزون المتاح
- تنبيهات نفاد المخزون

### 3. التحليلات المتقدمة
- إحصائيات شاملة
- تحليل الإيرادات
- تقارير الأداء
- تحليل سلوك العملاء

### 4. الأمان
- تشفير البيانات الحساسة
- التحقق من التوقيعات
- تسجيل جميع العمليات

## 🔧 التكوين

### متغيرات البيئة المطلوبة:

```env
# إعدادات الحجز
RESERVATION_TTL_SECONDS=900

# مفتاح توقيع الدفع
PAYMENT_SIGNING_KEY=your_signing_key

# إعدادات قاعدة البيانات
MONGODB_URI=mongodb://localhost:27017/tagadodo
```

## 🚀 الاستخدام

### 1. استيراد الـ Module:

```typescript
import { CheckoutModule } from './modules/checkout/checkout.module';

@Module({
  imports: [CheckoutModule],
})
export class AppModule {}
```

### 2. استخدام الخدمة:

```typescript
import { OrderService } from './modules/checkout/services/order.service';

@Injectable()
export class MyService {
  constructor(private orderService: OrderService) {}

  async createOrder(dto: CreateOrderDto) {
    return this.orderService.confirmCheckout(userId, dto);
  }
}
```

## 📈 الأداء

### فهارس قاعدة البيانات المحسنة:
- فهرس رقم الطلب (فريد)
- فهرس المستخدم والحالة
- فهرس تاريخ الإنشاء
- فهرس رقم التتبع
- فهرس المدينة والحالة

### تحسينات الأداء:
- استعلامات محسنة
- تجميع البيانات
- تخزين مؤقت للنتائج
- معالجة متوازية

## 🔒 الأمان

### حماية البيانات:
- تشفير البيانات الحساسة
- التحقق من الصلاحيات
- تسجيل العمليات
- حماية من SQL Injection

### التحقق من التوقيعات:
- HMAC للـ Webhooks
- التحقق من المصدر
- منع التلاعب

## 🧪 الاختبار

### اختبارات الوحدة:
```bash
npm run test:unit
```

### اختبارات التكامل:
```bash
npm run test:e2e
```

### اختبارات الأداء:
```bash
npm run test:performance
```

## 📝 السجلات

### أنواع السجلات:
- سجل العمليات
- سجل الأخطاء
- سجل الأداء
- سجل الأمان

### مستويات السجلات:
- `ERROR` - أخطاء
- `WARN` - تحذيرات
- `INFO` - معلومات
- `DEBUG` - تفاصيل

## 🔄 التحديثات

### إصدار 1.0.0:
- نظام موحد للطلبات
- State Machine متقدم
- API موحدة
- تحليلات شاملة

### الميزات المستقبلية:
- دعم العملات المتعددة
- تكامل مع أنظمة الشحن
- ذكاء اصطناعي للتنبؤات
- تطبيق جوال

## 📞 الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني
- مراجعة الوثائق

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.