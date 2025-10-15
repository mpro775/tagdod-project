## موديول الخدمات الميدانية (Services Module)

### ما الهدف؟
- **الغرض**: تمكين العملاء من إنشاء طلبات خدمة حسب الموقع، وتمكين المهندسين من رؤية الطلبات القريبة وتقديم عروض بأسعار وملاحظات، مع حساب المسافات وترتيب العروض.
- **المكان**: `backend/src/modules/services/`.

### المكونات
- **ServicesModule**: يهيئ مخططات `ServiceRequest`, `EngineerOffer`, `Address`, `Capabilities` ويعرّف الكنترولرز.
- **ServicesService**: يحتوي منطق الأعمال: إنشاء الطلبات، حساب المسافات (Haversine)، إدارة الحالات، العروض، الإشعارات.
- **CustomerServicesController**: واجهات العميل تحت `services/requests`.
- **EngineerServicesController**: واجهات المهندس تحت `services`.
- **AdminServicesController**: واجهات الأدمن تحت `admin/services`.

### تدفق الاستخدام
1) العميل ينشئ طلب خدمة يحدد العنوان (يُستخرج GeoJSON من `Address`).
2) المهندسون يستعرضون الطلبات القريبة `nearby` بناءً على دائرة نصف قطرها.
3) المهندس يقدّم عرضًا (سعر + ملاحظة) مع إحداثياته؛ النظام يحسب `distanceKm` ويحوّل حالة الطلب إلى `OFFERS_COLLECTING` عند أول عرض.
4) العميل يستعرض العروض مرتبة: الأقرب ثم الأرخص، ويقبل عرضًا واحدًا؛ تُعين حالة الطلب إلى `ASSIGNED`.
5) المهندس يبدأ العمل `IN_PROGRESS` ثم يُكمله `COMPLETED`.
6) العميل يقيم الخدمة؛ تُصبح `RATED`.

### أهم الـ Endpoints
- للعميل (`services/requests`):
  - `POST /services/requests` إنشاء طلب.
  - `GET /services/requests/my` طلباتي.
  - `GET /services/requests/:id` تفاصيل الطلب.
  - `GET /services/requests/:id/offers` عروض الطلب.
  - `POST /services/requests/:id/accept-offer` قبول عرض.
  - `POST /services/requests/:id/cancel` إلغاء.
  - `POST /services/requests/:id/rate` تقييم.

- للمهندس (`services`):
  - `GET /services/requests/nearby?lat=&lng=&radiusKm=` الطلبات القريبة.
  - `POST /services/offers` تقديم عرض (amount/note/lat/lng).
  - `PATCH /services/offers/:id` تعديل العرض.
  - `GET /services/offers/my` عروضي.
  - `POST /services/requests/:id/start` بدء.
  - `POST /services/requests/:id/complete` إنهاء.

- للأدمن (`admin/services`):
  - `GET /admin/services/requests?status=&page=&limit=` قائمة الطلبات.
  - `POST /admin/services/requests/:id/cancel` إلغاء إداري.

### منطق أساسي في الخدمة
- استخراج موقع الطلب من عنوان المستخدم إلى GeoJSON `Point`.
- البحث المكاني باستخدام `$near` مع `2dsphere` (أداء جيد للطلبات القريبة).
- حساب المسافة بـ Haversine لتخزين `distanceKm` داخل العرض.
- حالات الطلب: `OPEN → OFFERS_COLLECTING → ASSIGNED → IN_PROGRESS → COMPLETED → RATED` (مع احتمالية `CANCELLED`).
- عند قبول عرض: تعيين المهندس ورفض بقية العروض المفتوحة.
- إشعارات اختيارية عبر `NotificationsPort` لأحداث رئيسية.

### أمثلة سريعة
- إنشاء طلب:
```json
POST /services/requests
{
  "title": "تصليح ثلاجة",
  "type": "أجهزة منزلية",
  "addressId": "addr_123",
  "images": [],
  "scheduledAt": null
}
```

- طلبات قريبة للمهندس:
```http
GET /services/requests/nearby?lat=24.7136&lng=46.7382&radiusKm=10
```

- تقديم عرض:
```json
POST /services/offers
{
  "requestId": "req_001",
  "amount": 150,
  "note": "متوفر خلال ساعة",
  "lat": 24.7200,
  "lng": 46.7400
}
```

### ملاحظات
- يمنع النظام المهندس من رؤية طلباته الخاصة.
- ترتيب العروض: حسب `distanceKm` ثم `amount` تصاعديًا.
- حراسة الوصول: العملاء بـ `JwtAuthGuard`، المهندسون أيضًا بـ `EngineerGuard`، الأدمن بـ `AdminGuard`.


