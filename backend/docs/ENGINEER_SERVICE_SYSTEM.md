# نظام طلب المهندس والعروض - Tagadodo

> 🔧 **نظام بسيط واحترافي لطلب المهندسين واستقبال العروض مع حساب المسافات**

**التاريخ:** 14 أكتوبر 2025  
**الحالة:** ✅ مكتمل وجاهز

---

## 📋 نظرة عامة

نظام بسيط يتيح:
- ✅ **للعملاء:** طلب مهندس بناءً على الموقع
- ✅ **للمهندسين:** رؤية الطلبات القريبة وتقديم عروض
- ✅ **حساب المسافات:** تلقائياً عند تقديم العرض
- ✅ **العروض:** سعر + ملاحظة (بسيط)
- ✅ **الترتيب:** حسب المسافة والسعر

---

## 🎯 السير الكامل

### 1. العميل يطلب مهندس

```http
POST /services/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "تصليح ثلاجة",
  "type": "أجهزة منزلية",
  "description": "الثلاجة لا تبرد بشكل جيد",
  "addressId": "addr_123",
  "scheduledAt": "2025-10-20T10:00:00Z"  // optional
}
```

**Response:**
```json
{
  "data": {
    "_id": "req_001",
    "userId": "user_123",
    "title": "تصليح ثلاجة",
    "type": "أجهزة منزلية",
    "description": "الثلاجة لا تبرد بشكل جيد",
    "addressId": "addr_123",
    "location": {
      "type": "Point",
      "coordinates": [46.7382, 24.7136]  // [lng, lat] Riyadh
    },
    "status": "OPEN",
    "createdAt": "2025-10-14T10:00:00Z"
  }
}
```

---

### 2. المهندسون يرون الطلبات القريبة

```http
GET /services/requests/nearby?lat=24.7136&lng=46.7382&radiusKm=10
Authorization: Bearer <engineer_token>
```

**الشرح:**
- `lat`, `lng`: موقع المهندس الحالي
- `radiusKm`: نطاق البحث (افتراضي 10 كم)

**Response:**
```json
{
  "data": [
    {
      "_id": "req_001",
      "title": "تصليح ثلاجة",
      "type": "أجهزة منزلية",
      "description": "الثلاجة لا تبرد بشكل جيد",
      "location": {
        "type": "Point",
        "coordinates": [46.7382, 24.7136]
      },
      "status": "OPEN",
      "scheduledAt": "2025-10-20T10:00:00Z",
      "createdAt": "2025-10-14T10:00:00Z"
    }
  ]
}
```

**ملاحظة مهمة:** ✅ المهندس **لا يرى** طلباته الخاصة!

---

### 3. المهندس يقدم عرض

```http
POST /services/offers
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "requestId": "req_001",
  "amount": 150,
  "note": "متوفر اليوم بعد الظهر، خبرة 5 سنوات",
  "lat": 24.7200,  // موقع المهندس
  "lng": 46.7400
}
```

**الشرح:**
- `amount`: السعر (ريال)
- `note`: ملاحظة اختيارية
- `lat`, `lng`: موقع المهندس (لحساب المسافة)

**Response:**
```json
{
  "data": {
    "_id": "offer_001",
    "requestId": "req_001",
    "engineerId": "eng_123",
    "amount": 150,
    "note": "متوفر اليوم بعد الظهر، خبرة 5 سنوات",
    "distanceKm": 0.87,  ← حساب تلقائي!
    "status": "OFFERED",
    "createdAt": "2025-10-14T10:30:00Z"
  }
}
```

**ملاحظة:** النظام يحسب المسافة تلقائياً باستخدام **Haversine Formula** ✅

---

### 4. العميل يرى العروض

```http
GET /services/requests/req_001/offers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "_id": "offer_001",
      "requestId": "req_001",
      "engineerId": {
        "_id": "eng_123",
        "firstName": "أحمد",
        "lastName": "محمد",
        "phone": "+966500000001",
        "jobTitle": "فني أجهزة منزلية"
      },
      "amount": 150,
      "note": "متوفر اليوم بعد الظهر، خبرة 5 سنوات",
      "distanceKm": 0.87,  ← المسافة!
      "status": "OFFERED",
      "createdAt": "2025-10-14T10:30:00Z"
    },
    {
      "_id": "offer_002",
      "engineerId": {
        "firstName": "خالد",
        "lastName": "علي",
        "jobTitle": "فني تكييف"
      },
      "amount": 120,
      "distanceKm": 1.2,
      "status": "OFFERED"
    }
  ]
}
```

**الترتيب:** أقرب مسافة أولاً، ثم أرخص سعر ✅

---

### 5. العميل يقبل عرض

```http
POST /services/requests/req_001/accept-offer
Authorization: Bearer <token>
Content-Type: application/json

{
  "offerId": "offer_001"
}
```

**Response:**
```json
{
  "data": {
    "ok": true
  }
}
```

**ماذا يحدث:**
- ✅ الطلب يتحول إلى `ASSIGNED`
- ✅ العرض المقبول يصبح `ACCEPTED`
- ✅ باقي العروض تتحول إلى `REJECTED`
- ✅ المهندس يستلم إشعار

---

### 6. المهندس يبدأ العمل

```http
POST /services/requests/req_001/start
Authorization: Bearer <engineer_token>
```

**Response:**
```json
{
  "data": {
    "ok": true
  }
}
```

الحالة: `ASSIGNED` → `IN_PROGRESS`

---

### 7. المهندس ينهي العمل

```http
POST /services/requests/req_001/complete
Authorization: Bearer <engineer_token>
```

**Response:**
```json
{
  "data": {
    "ok": true
  }
}
```

الحالة: `IN_PROGRESS` → `COMPLETED`

---

### 8. العميل يقيّم الخدمة

```http
POST /services/requests/req_001/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 5,
  "comment": "ممتاز، سريع ومحترف"
}
```

**Response:**
```json
{
  "data": {
    "ok": true
  }
}
```

الحالة: `COMPLETED` → `RATED`

---

## 🗺️ حساب المسافات

### Haversine Formula

النظام يستخدم **Haversine Formula** لحساب المسافة بين نقطتين على الأرض:

```typescript
R = 6371; // نصف قطر الأرض بالكيلومتر

// المسافة بين (lat1, lng1) و (lat2, lng2)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * π / 180;
  const dLng = (lng2 - lng1) * π / 180;
  
  const a = 
    sin(dLat/2)² + 
    cos(lat1) * cos(lat2) * sin(dLng/2)²;
  
  const c = 2 * atan2(√a, √(1-a));
  
  return R * c; // النتيجة بالكيلومتر
}
```

**مثال:**
```
موقع الطلب: 24.7136, 46.7382 (الرياض)
موقع المهندس: 24.7200, 46.7400

المسافة = 0.87 كم
```

---

## 📊 حالات الطلب (Status)

```typescript
OPEN              // جديد، لم يتلقى عروض
OFFERS_COLLECTING // تلقى عروض
ASSIGNED          // تم قبول عرض
IN_PROGRESS       // المهندس يعمل
COMPLETED         // انتهى
RATED             // تم التقييم
CANCELLED         // ملغي
```

---

## 🔐 API Endpoints

### للعملاء (Customer)

```http
POST   /services/requests              # إنشاء طلب
GET    /services/requests/my           # طلباتي
GET    /services/requests/:id          # تفاصيل طلب
GET    /services/requests/:id/offers   # عروض الطلب ← جديد!
POST   /services/requests/:id/accept-offer  # قبول عرض
POST   /services/requests/:id/cancel   # إلغاء طلب
POST   /services/requests/:id/rate     # تقييم
```

---

### للمهندسين (Engineer)

```http
GET    /services/requests/nearby       # الطلبات القريبة
POST   /services/offers                # تقديم عرض
GET    /services/offers/my             # عروضي ← جديد!
PATCH  /services/offers/:id            # تعديل عرض
POST   /services/requests/:id/start    # بدء العمل
POST   /services/requests/:id/complete # إنهاء العمل
```

---

### للأدمن (Admin)

```http
GET    /admin/services/requests        # جميع الطلبات
POST   /admin/services/requests/:id/cancel  # إلغاء طلب
```

---

## 📋 Schema

### ServiceRequest

```typescript
{
  userId: ObjectId,
  title: string,               // "تصليح ثلاجة"
  type?: string,               // "أجهزة منزلية"
  description?: string,
  images?: string[],
  addressId: ObjectId,
  location: {                  // GeoJSON Point
    type: 'Point',
    coordinates: [lng, lat]
  },
  status: 'OPEN' | 'OFFERS_COLLECTING' | 'ASSIGNED' | ...,
  scheduledAt?: Date,          // موعد مفضل
  engineerId?: ObjectId,       // المهندس المختار
  acceptedOffer?: {
    offerId: string,
    amount: number,
    note?: string
  },
  rating?: {
    score: number,             // 1-5
    comment?: string,
    at: Date
  }
}
```

---

### EngineerOffer

```typescript
{
  requestId: ObjectId,
  engineerId: ObjectId,
  amount: number,              // السعر
  note?: string,               // ملاحظة
  distanceKm?: number,         // المسافة ← جديد!
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
}
```

---

## 🎯 السيناريوهات الكاملة

### سيناريو 1: طلب عادي

```
1. عميل: POST /services/requests
   → status: OPEN

2. مهندس 1 (2 كم): POST /services/offers { amount: 150 }
   → status: OFFERS_COLLECTING
   → distanceKm: 2

3. مهندس 2 (0.5 كم): POST /services/offers { amount: 120 }
   → distanceKm: 0.5

4. عميل: GET /services/requests/req_001/offers
   → يرى عرضين، مرتبين:
     [0.5 كم, 120 ريال] ← الأقرب والأرخص
     [2 كم, 150 ريال]

5. عميل: POST /services/requests/req_001/accept-offer
   { offerId: "offer_002" }
   → status: ASSIGNED
   → engineerId: مهندس 2

6. مهندس 2: POST /services/requests/req_001/start
   → status: IN_PROGRESS

7. مهندس 2: POST /services/requests/req_001/complete
   → status: COMPLETED

8. عميل: POST /services/requests/req_001/rate
   { score: 5 }
   → status: RATED

✅ انتهى!
```

---

### سيناريو 2: مهندس يقدم عرض

```
1. مهندس: GET /services/requests/nearby?lat=24.7136&lng=46.7382&radiusKm=10
   → يرى 3 طلبات قريبة

2. مهندس يختار طلب ويقدم عرض:
   POST /services/offers
   {
     "requestId": "req_001",
     "amount": 150,
     "note": "متوفر بعد ساعة",
     "lat": 24.7200,  ← موقعه الحالي
     "lng": 46.7400
   }

3. النظام:
   - يحسب المسافة بين (24.7200, 46.7400) و (24.7136, 46.7382)
   - distanceKm = 0.87 كم
   - يحفظ العرض

4. العميل يرى العرض مع المسافة!

✅ بسيط وسريع!
```

---

### سيناريو 3: مهندس يرى عروضه

```
1. مهندس: GET /services/offers/my

Response:
{
  "data": [
    {
      "_id": "offer_001",
      "requestId": {
        "title": "تصليح ثلاجة",
        "status": "OFFERS_COLLECTING"
      },
      "amount": 150,
      "distanceKm": 0.87,
      "status": "OFFERED"
    },
    {
      "_id": "offer_002",
      "requestId": {
        "title": "تصليح مكيف",
        "status": "ASSIGNED"
      },
      "amount": 200,
      "distanceKm": 1.2,
      "status": "ACCEPTED"  ← تم قبول هذا العرض!
    }
  ]
}
```

---

## 🔍 البحث بالموقع (2dsphere Index)

### كيف يعمل:

```typescript
// في Schema
location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [number, number]  // [lng, lat]
}

// Index
Schema.index({ location: '2dsphere' });

// Query
requests.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      $maxDistance: radiusKm * 1000  // meters
    }
  }
});
```

**النتيجة:** استعلامات جغرافية سريعة جداً! ⚡

---

## 🎨 في الواجهة (Frontend)

### React/Next.js Example

```typescript
// 1. الحصول على موقع المهندس
const [location, setLocation] = useState<{lat: number, lng: number}>();

useEffect(() => {
  navigator.geolocation.getCurrentPosition(pos => {
    setLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });
  });
}, []);

// 2. جلب الطلبات القريبة
const getNearbyRequests = async () => {
  const res = await fetch(
    `/services/requests/nearby?lat=${location.lat}&lng=${location.lng}&radiusKm=10`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return res.json();
};

// 3. تقديم عرض
const submitOffer = async (requestId: string, amount: number, note?: string) => {
  await fetch('/services/offers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requestId,
      amount,
      note,
      lat: location.lat,  // موقع المهندس
      lng: location.lng
    })
  });
};

// 4. عرض الطلبات مع المسافة
{requests.map(req => (
  <div key={req._id}>
    <h3>{req.title}</h3>
    <p>{req.description}</p>
    {/* المسافة تحسب في الواجهة أيضاً للعرض فقط */}
    <span>المسافة: ~{calculateDistance(location, req.location)} كم</span>
    <button onClick={() => submitOffer(req._id, 150)}>
      قدّم عرض
    </button>
  </div>
))}
```

---

## 📊 مثال كامل (End to End)

### 1. العميل ينشئ طلب

```bash
curl -X POST https://api.tagadodo.com/services/requests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "تصليح ثلاجة سامسونج",
    "type": "أجهزة منزلية",
    "description": "الثلاجة لا تبرد، ممكن يكون مشكلة في الضاغط",
    "addressId": "addr_123"
  }'
```

---

### 2. المهندسون يبحثون

```bash
curl -X GET "https://api.tagadodo.com/services/requests/nearby?lat=24.7136&lng=46.7382&radiusKm=10" \
  -H "Authorization: Bearer <engineer_token>"
```

---

### 3. مهندس يقدم عرض

```bash
curl -X POST https://api.tagadodo.com/services/offers \
  -H "Authorization: Bearer <engineer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "req_001",
    "amount": 150,
    "note": "متوفر خلال ساعة، خبرة 5 سنوات في صيانة Samsung",
    "lat": 24.7200,
    "lng": 46.7400
  }'

# Response: { distanceKm: 0.87 }
```

---

### 4. العميل يرى العروض

```bash
curl -X GET https://api.tagadodo.com/services/requests/req_001/offers \
  -H "Authorization: Bearer <token>"
```

---

### 5. العميل يقبل

```bash
curl -X POST https://api.tagadodo.com/services/requests/req_001/accept-offer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "offerId": "offer_001" }'
```

---

## ✨ المزايا

### 1. **بساطة**
```
✅ عرض = سعر + ملاحظة فقط
✅ لا تعقيدات زائدة
✅ سهل الاستخدام
```

---

### 2. **المسافات**
```
✅ حساب تلقائي
✅ دقيق (Haversine)
✅ ترتيب حسب المسافة
```

---

### 3. **الأمان**
```
✅ المهندس لا يرى طلباته
✅ Guards محمية
✅ Validation كامل
```

---

### 4. **الأداء**
```
✅ 2dsphere index
✅ $near query (سريع جداً)
✅ populate efficient
```

---

## 🔐 الأمان

```typescript
✅ JwtAuthGuard (User)
✅ EngineerGuard (Engineer only)
✅ AdminGuard (Admin only)
✅ userId === requestUserId (في كل عملية)
✅ engineerId === offerEngineerId (في التحديث)
```

---

## 📝 الملفات

```
services/
├── schemas/
│   ├── service-request.schema.ts    # ✅ 2dsphere index
│   └── engineer-offer.schema.ts     # ✅ + distanceKm
├── dto/
│   ├── requests.dto.ts              # ✅ NearbyQueryDto
│   └── offers.dto.ts                # ✅ + lat, lng
├── services.service.ts              # ✅ + calculateDistance()
├── customer.controller.ts           # ✅ + getOffers endpoint
├── engineer.controller.ts           # ✅ + myOffers endpoint
└── admin.controller.ts
```

---

## 🎉 الخلاصة

**نظام بسيط ومحترف:**
- ✅ طلب + عرض بسيط
- ✅ حساب مسافات تلقائي
- ✅ ترتيب ذكي (أقرب وأرخص)
- ✅ GeoJSON + 2dsphere
- ✅ Haversine Formula
- ✅ بدون تعقيدات
- ✅ سريع وآمن
- ✅ **جاهز للإنتاج 100%**

---

**🔧 نظام خدمات احترافي وبسيط!**

**Version:** 1.0.0  
**Date:** October 14, 2025  
**Status:** ✅ Production Ready

