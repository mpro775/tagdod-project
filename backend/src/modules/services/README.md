# Services Module

> 🔧 **نظام طلب المهندسين والعروض مع حساب المسافات**

---

## نظرة عامة

نظام بسيط ومحترف يتيح:
- ✅ للعملاء: طلب مهندس بناءً على الموقع
- ✅ للمهندسين: رؤية الطلبات القريبة وتقديم عروض
- ✅ حساب المسافات تلقائياً (Haversine Formula)
- ✅ العروض: سعر + ملاحظة
- ✅ الترتيب: حسب المسافة والسعر

---

## الملفات

```
services/
├── schemas/
│   ├── service-request.schema.ts   # طلبات الخدمة + GeoJSON
│   └── engineer-offer.schema.ts    # عروض المهندسين + المسافة
├── dto/
│   ├── requests.dto.ts             # DTOs للطلبات
│   └── offers.dto.ts               # DTOs للعروض
├── services.service.ts             # Business logic + حساب المسافات
├── customer.controller.ts          # API للعملاء (7 endpoints)
├── engineer.controller.ts          # API للمهندسين (6 endpoints)
└── admin.controller.ts             # API للأدمن (2 endpoints)
```

---

## API Endpoints

### للعملاء:
- `POST /services/requests` - إنشاء طلب
- `GET /services/requests/my` - طلباتي
- `GET /services/requests/:id` - تفاصيل
- `GET /services/requests/:id/offers` - عروض الطلب ← جديد!
- `POST /services/requests/:id/accept-offer` - قبول عرض
- `POST /services/requests/:id/cancel` - إلغاء
- `POST /services/requests/:id/rate` - تقييم

### للمهندسين:
- `GET /services/requests/nearby` - الطلبات القريبة
- `POST /services/offers` - تقديم عرض
- `GET /services/offers/my` - عروضي ← جديد!
- `PATCH /services/offers/:id` - تعديل عرض
- `POST /services/requests/:id/start` - بدء العمل
- `POST /services/requests/:id/complete` - إنهاء

---

## الاستخدام السريع

### 1. طلب مهندس:

```typescript
POST /services/requests
{
  "title": "تصليح ثلاجة",
  "type": "أجهزة منزلية",
  "addressId": "addr_123"
}
```

### 2. البحث عن طلبات:

```typescript
GET /services/requests/nearby?lat=24.7136&lng=46.7382&radiusKm=10
```

### 3. تقديم عرض:

```typescript
POST /services/offers
{
  "requestId": "req_001",
  "amount": 150,
  "note": "متوفر خلال ساعة",
  "lat": 24.7200,  // موقع المهندس
  "lng": 46.7400
}
// → distanceKm يحسب تلقائياً!
```

---

## حساب المسافات

النظام يستخدم **Haversine Formula** لحساب المسافة الدقيقة:

```typescript
calculateDistance(lat1, lng1, lat2, lng2) → distanceKm
```

**مثال:**
- موقع الطلب: 24.7136, 46.7382
- موقع المهندس: 24.7200, 46.7400
- **المسافة:** 0.87 كم

---

## الميزات

✅ **بساطة** - عرض = سعر + ملاحظة  
✅ **المسافات** - حساب تلقائي ودقيق  
✅ **GeoJSON** - 2dsphere index للبحث السريع  
✅ **الترتيب** - أقرب ثم أرخص  
✅ **الأمان** - المهندس لا يرى طلباته  
✅ **الأداء** - queries محسّنة  

---

## للتوثيق الكامل

اقرأ: [`ENGINEER_SERVICE_SYSTEM.md`](../../../ENGINEER_SERVICE_SYSTEM.md)

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready
