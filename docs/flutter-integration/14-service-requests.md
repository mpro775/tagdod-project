# 🔧 طلبات الخدمات (Service Requests)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: يناير 2025

خدمة طلبات الخدمات توفر endpoints لإدارة طلبات الخدمات من قبل العملاء والمهندسين.

> ℹ️ **هيكل الاستجابة**: جميع الاستجابات الناجحة تُغلّف تلقائياً بواسطة `ResponseEnvelopeInterceptor` وتعود بالشكل `{ success, data, requestId }`. معظم الـ endpoints تُرجع بياناتها تحت المفتاح `data` داخل الحقل `data` الرئيسي (أي `apiResponse.data['data']`). راجع `docs/flutter-integration/01-response-structure.md` للتفاصيل الكاملة.

---

## 📋 جدول المحتويات

### للعملاء (Customers)
1. [إنشاء طلب خدمة](#1-إنشاء-طلب-خدمة)
2. [طلباتي](#2-طلباتي)
   - [طلبات بلا عروض](#طلبات-بلا-عروض)
   - [طلبات بعروض غير مقبولة](#طلبات-بعروض-غير-مقبولة)
   - [طلبات بعروض مقبولة](#طلبات-بعروض-مقبولة)
3. [تفاصيل طلب](#3-تفاصيل-طلب)
4. [تعديل طلب خدمة](#4-تعديل-طلب-خدمة)
5. [إلغاء طلب](#5-إلغاء-طلب)
6. [حذف طلب خدمة](#6-حذف-طلب-خدمة)
7. [قبول عرض](#7-قبول-عرض)
8. [تقييم الخدمة](#8-تقييم-الخدمة)
9. [إكمال الطلب](#9-إكمال-الطلب)

### للمهندسين (Engineers)
10. [الطلبات القريبة](#10-الطلبات-القريبة)
   - [الطلبات في مدينتي](#الطلبات-في-مدينتي)
   - [جميع الطلبات المتاحة](#جميع-الطلبات-المتاحة)
11. [تفاصيل طلب خدمة](#11-تفاصيل-طلب-خدمة)

---

## للعملاء (Customers)

### 1. إنشاء طلب خدمة

ينشئ طلب خدمة جديد للمهندسين مع رفع الصور تلقائياً إلى Bunny.net.

**Method:** `POST`  
**Endpoint:** `/services/customer`  
**Auth Required:** ✅ نعم  
**Content-Type:** `multipart/form-data` (لرفع الصور)

#### Request Body (multipart/form-data)

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `title` | `string` | ✅ | عنوان الطلب |
| `type` | `string` | ❌ | نوع الخدمة |
| `description` | `string` | ❌ | وصف الطلب |
| `images` | `File[]` | ❌ | صور الطلب (حتى 10 صور) - يتم رفعها تلقائياً إلى Bunny.net |
| `addressId` | `string` | ✅ | معرف العنوان |
| `scheduledAt` | `string` (ISO 8601) | ❌ | موعد التنفيذ |

> ✅ **ميزة:** يمكنك رفع الصور مباشرة مع الطلب. يتم رفعها تلقائياً إلى Bunny.net CDN.

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64service123",
      "userId": "64user123",
      "title": "تركيب نظام طاقة شمسية",
      "type": "INSTALLATION",
      "description": "أحتاج تركيب نظام 10 كيلو واط",
      "images": ["https://cdn.example.com/services/requests/uuid-photo-1.jpg"],
      "city": "صنعاء",
      "addressId": "64address123",
      "location": {
        "type": "Point",
        "coordinates": [44.2060, 15.3694]
      },
      "status": "OPEN",
      "scheduledAt": "2025-10-20T10:00:00.000Z",
      "engineerId": null,
      "acceptedOffer": null,
      "rating": null,
      "cancellationReason": null,
      "cancelledAt": null,
      "adminNotes": [],
      "createdAt": "2025-01-15T12:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ **معلومة مهمة:** لا ترسل حقل `city` عند إنشاء الطلب. الخادم يستخرج المدينة تلقائياً من العنوان المحدد (`addressId`).

---

### 2. طلباتي

يسترجع قائمة طلبات المستخدم.

**Method:** `GET`  
**Endpoint:** `/services/customer/my`  
**Auth Required:** ✅ نعم

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64service123",
        "userId": "64user123",
        "title": "تركيب نظام طاقة شمسية",
        "status": "OPEN",
        "statusLabel": "بانتظار العروض",
        "city": "صنعاء",
        "createdAt": "2025-01-15T12:00:00.000Z"
      }
    ]
  }
}
```

> ℹ️ يتم إرجاع `engineerId` ككائن `populated` يحتوي على `_id`, `firstName`, `lastName`, `phone`, `jobTitle`.

#### تصنيفات الطلبات

##### طلبات بلا عروض
- **Endpoint:** `GET /services/customer/my/no-offers`

##### طلبات بعروض غير مقبولة
- **Endpoint:** `GET /services/customer/my/with-offers`

##### طلبات بعروض مقبولة
- **Endpoint:** `GET /services/customer/my/with-accepted-offer?status=ASSIGNED|COMPLETED|RATED`

جميع الاستجابات تُعيد هيكل الطلب نفسه مع الحقول الإضافية (`statusLabel`, `address`, `offers/engineer`) حسب الحالة.

---

### 3. تفاصيل طلب

يسترجع تفاصيل طلب محدد.

**Method:** `GET`  
**Endpoint:** `/services/customer/:id`  
**Auth Required:** ✅ نعم

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64service123",
      "title": "تركيب نظام طاقة شمسية",
      "status": "OPEN",
      "statusLabel": "بانتظار العروض",
      "cancellationReason": null,
      "cancelledAt": null,
      "createdAt": "2025-01-15T12:00:00.000Z"
    }
  }
}
```

---

### 4. تعديل طلب خدمة

يعدل طلب خدمة موجود - مسموح فقط إذا لم يتم تلقي أي عروض على الطلب.

**Method:** `PATCH`  
**Endpoint:** `/services/customer/:id`  
**Auth Required:** ✅ نعم  
**Content-Type:** `multipart/form-data` (لرفع الصور)

#### Request Body (multipart/form-data)

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `title` | `string` | ❌ | عنوان الطلب |
| `type` | `string` | ❌ | نوع الخدمة |
| `description` | `string` | ❌ | وصف الطلب |
| `images` | `File[]` | ❌ | صور الطلب (حتى 10 صور) |
| `addressId` | `string` | ❌ | معرف العنوان |
| `scheduledAt` | `string` (ISO 8601) | ❌ | موعد التنفيذ |

> ⚠️ **مهم:** يمكن تعديل الطلب فقط إذا:
> - لم يتم تلقي أي عروض على الطلب (`offersCount === 0`)
> - حالة الطلب هي `OPEN`

#### Response - خطأ (400) - يوجد عروض

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "HAS_OFFERS"
    }
  }
}
```

---

### 5. إلغاء طلب

يلغي طلب خدمة. **يسمح فقط من حالة `ASSIGNED` (بعد قبول عرض)**.

**Method:** `POST`  
**Endpoint:** `/services/customer/:id/cancel`  
**Auth Required:** ✅ نعم

#### Request Body

```json
{
  "reason": "سبب الإلغاء (إجباري)"
}
```

> ⚠️ **قيود مهمة:**
> - **السبب إجباري** - يجب كتابة سبب الإلغاء
> - **حد أقصى 3 إلغاءات** - لا يمكن الإلغاء إذا وصلت للحد الأقصى
> - **فقط من حالة ASSIGNED** - يمكن الإلغاء فقط بعد قبول عرض من مهندس

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  }
}
```

#### Response - خطأ (400) - سبب مطلوب

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "REASON_REQUIRED"
    }
  }
}
```

#### Response - خطأ (400) - حالة غير صالحة

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "CANNOT_CANCEL",
      "message": "يمكن إلغاء الطلب فقط بعد قبول عرض من مهندس"
    }
  }
}
```

#### Response - خطأ (400) - وصلت للحد الأقصى

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "CANCELLATION_LIMIT_REACHED",
      "message": "لقد وصلت إلى الحد الأقصى المسموح به من الإلغاءات (3). يرجى الانتظار حتى يتم التعامل مع الخدمات الحالية."
    }
  }
}
```

#### كود Flutter

```dart
Future<bool> cancelServiceRequest(String requestId, String reason) async {
  final response = await _dio.post(
    '/services/customer/$requestId/cancel',
    data: { 'reason': reason },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    
    if (result != null && result.containsKey('error')) {
      final error = result['error'] as String;
      switch (error) {
        case 'REASON_REQUIRED':
          throw ApiException('يجب كتابة سبب الإلغاء');
        case 'CANNOT_CANCEL':
          throw ApiException(result['message'] as String? ?? 'لا يمكن إلغاء هذا الطلب');
        case 'CANCELLATION_LIMIT_REACHED':
          throw ApiException(result['message'] as String? ?? 'وصلت للحد الأقصى من الإلغاءات');
        default:
          throw ApiException('حدث خطأ أثناء الإلغاء');
      }
    }
    
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 6. حذف طلب خدمة

يحذف طلب خدمة نهائياً من قاعدة البيانات - مسموح فقط للطلبات المفتوحة أو الملغاة.

> ⚠️ **مهم:** يختلف الحذف عن الإلغاء:
> - **الإلغاء (`cancel`)**: يغير حالة الطلب إلى `CANCELLED` ويبقي الطلب في قاعدة البيانات
> - **الحذف (`delete`)**: يحذف الطلب نهائياً من قاعدة البيانات مع جميع العروض المرتبطة به

**Method:** `DELETE`  
**Endpoint:** `/services/customer/:id`  
**Auth Required:** ✅ نعم

#### القيود

- يمكن حذف الطلب فقط إذا كان في حالة `OPEN` أو `CANCELLED`
- لا يمكن حذف الطلبات التي تم قبول عروض عليها (`ASSIGNED`, `COMPLETED`, `RATED`)
- يتم حذف جميع العروض المرتبطة بالطلب تلقائياً

---

### 7. قبول عرض

يقبل عرض مهندس على طلب.

**Method:** `POST`  
**Endpoint:** `/services/customer/:id/accept-offer`  
**Auth Required:** ✅ نعم

#### Request Body

```json
{
  "offerId": "64offer123"
}
```

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  }
}
```

> ℹ️ عند قبول عرض:
> - يتم تحديث حالة الطلب إلى `ASSIGNED`
> - يتم تحديث حالة العرض المقبول إلى `ACCEPTED`
> - **يتم تحديث حالة العروض الأخرى إلى `OUTBID`** (تم قبول عرض آخر)
> - يتم إرسال إشعارات للمهندسين الذين تم رفض عروضهم

---

### 8. تقييم الخدمة

يقيم المستخدم الخدمة المقدمة.

**Method:** `POST`  
**Endpoint:** `/services/customer/:id/rate`  
**Auth Required:** ✅ نعم

#### Request Body

```json
{
  "score": 5,
  "comment": "خدمة ممتازة وجودة عالية"
}
```

> ⚠️ **مهم:** التعليق (`comment`) **إجباري** عند التقييم.

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  }
}
```

---

### 9. إكمال الطلب

يؤكد العميل إكمال طلب الخدمة.

**Method:** `POST`  
**Endpoint:** `/services/customer/:id/complete`  
**Auth Required:** ✅ نعم

> ⚠️ **مهم:** العميل هو من يؤكد إكمال الخدمة بعد أن ينفذ المهندس العمل.

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  }
}
```

> ℹ️ القيم المحتملة عند الفشل تشمل `{ "error": "NOT_OWNER" }` أو `{ "error": "INVALID_STATUS" }`.

#### Response - خطأ (400) - ليس صاحب الطلب

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "NOT_OWNER"
    }
  }
}
```

#### Response - خطأ (400) - حالة غير صالحة

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "INVALID_STATUS"
    }
  }
}
```

> ⚠️ **مهم:** يمكن تأكيد الإكمال فقط إذا كانت حالة الطلب `ASSIGNED`.

#### كود Flutter

```dart
Future<bool> completeServiceRequest(String requestId) async {
  final response = await _dio.post('/services/customer/$requestId/complete');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    
    if (result != null && result.containsKey('error')) {
      final error = result['error'] as String;
      switch (error) {
        case 'NOT_OWNER':
          throw ApiException('أنت لست صاحب هذا الطلب');
        case 'INVALID_STATUS':
          throw ApiException('لا يمكن إكمال هذا الطلب في حالته الحالية');
        default:
          throw ApiException('حدث خطأ أثناء إكمال الطلب');
      }
    }
    
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## للمهندسين (Engineers)

### 10. الطلبات القريبة

يسترجع الطلبات القريبة من موقع المهندس.

**Method:** `GET`  
**Endpoint:** `/services/engineer/requests/nearby`  
**Auth Required:** ✅ نعم (Engineer)

#### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `lat` | `number` | ✅ | خط العرض |
| `lng` | `number` | ✅ | خط الطول |
| `radiusKm` | `number` | ❌ | نصف القطر بالكيلومتر (افتراضي: 10) |

> ℹ️ **فلترة تلقائية:** يتم تطبيق فلترة حسب المدينة تلقائياً بناءً على مدينة المهندس.

#### الطلبات في مدينتي

- **Method:** `GET`
- **Endpoint:** `/services/engineer/requests/city`
- يعيد جميع الطلبات المتاحة في نفس مدينة المهندس (حالة `OPEN` أو `OFFERS_COLLECTING`) بدون فلترة حسب المسافة.

#### جميع الطلبات المتاحة

- **Method:** `GET`
- **Endpoint:** `/services/engineer/requests/all`
- يعيد كل الطلبات المتاحة بغض النظر عن المدينة أو المسافة.

---

### 11. تفاصيل طلب خدمة

يسترجع المهندس تفاصيل طلب خدمة محدد بما في ذلك معلومات العميل والعنوان وعرضه إن وجد.

**Method:** `GET`  
**Endpoint:** `/services/engineer/requests/:id`  
**Auth Required:** ✅ نعم (Engineer)

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64service123",
      "title": "إصلاح جهاز تلفزيون",
      "status": "OPEN",
      "statusLabel": "بانتظار العروض",
      "address": {
        "label": "المنزل",
        "line1": "شارع الملك فيصل، صنعاء",
        "city": "صنعاء"
      },
      "customer": {
        "id": "user123",
        "name": "محمد أحمد",
        "phone": "+967711234567",
        "whatsapp": "https://wa.me/967711234567"
      },
      "myOffer": {
        "_id": "offer123",
        "amount": 150.00,
        "status": "OFFERED",
        "statusLabel": "عرض مقدم"
      }
    }
  }
}
```

> ℹ️ الحقل `myOffer` يحتوي على عرض المهندس الحالي على هذا الطلب إن وجد. إذا لم يقدم المهندس عرضاً بعد، يكون `null`.

---

## حالات الطلب (Status)

### الحالات المتاحة

| الحالة | الوصف | متى تحدث |
|--------|-------|----------|
| `OPEN` | مفتوح للعروض | عند إنشاء الطلب |
| `OFFERS_COLLECTING` | تجميع العروض | عند تقديم أول عرض |
| `ASSIGNED` | تم قبول العرض | عند قبول عرض من مهندس |
| `COMPLETED` | اكتملت الخدمة | عند تأكيد العميل لإكمال الخدمة |
| `RATED` | تم التقييم | بعد تقييم العميل للخدمة |
| `CANCELLED` | ملغى | عند إلغاء الطلب |

> ⚠️ **تم إزالة:** `IN_PROGRESS` - لم تعد موجودة في النظام.

### التدفق

```
OPEN → OFFERS_COLLECTING → ASSIGNED → COMPLETED → RATED
                                    ↓
                                CANCELLED
```

---

## حقول الإلغاء

عند إلغاء الطلب، يتم حفظ:

- `cancellationReason`: سبب الإلغاء (إجباري)
- `cancelledAt`: تاريخ ووقت الإلغاء

---

## انتهاء الصلاحية

> ⚠️ **ميزة تلقائية:** يتم فحص الطلبات والعروض المنتهية الصلاحية يومياً في الساعة 2 صباحاً.

### الطلبات

- إذا كانت `OPEN` أو `OFFERS_COLLECTING` ولم يتم قبول أي عرض لمدة **5 أيام** → `CANCELLED`
- يتم تعيين `cancellationReason` تلقائياً: "انتهت صلاحية الطلب (5 أيام بدون قبول عرض)"

### العروض

- إذا كانت `OFFERED` ولم يتم قبولها لمدة **5 أيام** → `EXPIRED`
- يتم إرسال إشعار للمهندس

---

## Models في Flutter

### ServiceRequestStatus Enum

```dart
enum ServiceRequestStatus {
  OPEN,
  OFFERS_COLLECTING,
  ASSIGNED,
  COMPLETED,
  RATED,
  CANCELLED,
}
```

> ⚠️ **تم إزالة:** `IN_PROGRESS` من enum.

### ServiceRequest Model

```dart
class ServiceRequest {
  final String id;
  final String userId;
  final String title;
  final String? type;
  final String? description;
  final String city;
  final List<String> images;
  final String? addressId;
  final ServiceLocation location;
  final ServiceRequestStatus status;
  final DateTime? scheduledAt;
  final String? engineerId;
  final AcceptedOffer? acceptedOffer;
  final ServiceRating? rating;
  final String? cancellationReason; // ✅ جديد
  final DateTime? cancelledAt; // ✅ جديد
  final List<AdminNote> adminNotes;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Helper methods
  bool get canBeCancelled => status == ServiceRequestStatus.ASSIGNED; // ✅ محدث
  bool get canAcceptOffers => status == ServiceRequestStatus.OPEN || 
                              status == ServiceRequestStatus.OFFERS_COLLECTING;
  bool get canBeCompleted => status == ServiceRequestStatus.ASSIGNED; // ✅ جديد - العميل يمكنه تأكيد الإكمال
  bool get canBeRated => status == ServiceRequestStatus.COMPLETED;
  bool get isCancelled => status == ServiceRequestStatus.CANCELLED;
  bool get hasCancellationReason => cancellationReason != null && cancellationReason!.isNotEmpty;
}
```

---

## ملاحظات مهمة

1. **الإلغاء:**
   - السبب إجباري
   - حد أقصى 3 إلغاءات للعميل
   - مسموح فقط من حالة `ASSIGNED`

2. **حالات الطلب:**
   - تم إزالة `IN_PROGRESS`
   - التدفق: `OPEN` → `OFFERS_COLLECTING` → `ASSIGNED` → `COMPLETED` → `RATED`
   - **إكمال الطلب:** العميل هو من يؤكد إكمال الخدمة بعد تنفيذ المهندس للعمل

3. **انتهاء الصلاحية:**
   - الطلبات: 5 أيام بدون قبول عرض → `CANCELLED`
   - العروض: 5 أيام بدون قبول → `EXPIRED`

4. **قبول العرض:**
   - عند قبول عرض، يتم تحديث العروض الأخرى إلى `OUTBID`
   - يتم إرسال إشعارات للمهندسين

---

## ملفات Backend المرجعية

- `backend/src/modules/services/customer.controller.ts` - customer endpoints
- `backend/src/modules/services/engineer.controller.ts` - engineer endpoints
- `backend/src/modules/services/schemas/service-request.schema.ts` - ServiceRequest Schema
- `backend/src/modules/services/services.service.ts` - Services Service

