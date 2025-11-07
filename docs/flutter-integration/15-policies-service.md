# 📜 خدمة السياسات (Policies Service)

> ✅ **تم التحقق**: متطابقة مع الكود الفعلي في `backend/src/modules/policies`  
> 📅 **آخر تحديث**: نوفمبر 2025  
> 👥 **مخاطبة لـ**: المستخدمين، التجار، والمهندسين (بدون أي صلاحيات إدارية)

خدمة السياسات توفر endpoints عامة لعرض أحدث النسخ النشطة من الأحكام والشروط وسياسة الخصوصية. لا توجد عمليات إنشاء/تعديل هنا؛ هي القراءة فقط لاستهلاك تطبيقات Flutter / الويب.

> ℹ️ **هيكل الاستجابة**: جميع الاستجابات الناجحة تُغلّف تلقائياً بواسطة `ResponseEnvelopeInterceptor` وتعود بالشكل `{ success, data, requestId }`. البيانات الفعلية موجودة داخل `data['data']`. راجع `docs/flutter-integration/01-response-structure.md`.

---

## 📋 جدول المحتويات

1. [الأحكام والشروط](#1-الأحكام-والشروط)
2. [سياسة الخصوصية](#2-سياسة-الخصوصية)
3. [سياسة بحسب النوع](#3-سياسة-بحسب-النوع)
4. [نماذج Flutter](#نماذج-flutter)
5. [ملاحظات مهمة](#📝-ملاحظات-مهمة)

---

## 1. الأحكام والشروط

يعيد آخر نسخة نشطة من سياسة الأحكام والشروط.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/policies/public/terms`
- **Auth Required:** ❌ لا
- **Cache:** ❌ لا (النتيجة تتغير عند تحديث السياسة)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64pol123",
      "type": "terms",
      "titleAr": "الأحكام والشروط",
      "titleEn": "Terms & Conditions",
      "contentAr": "<h1>الأحكام والشروط</h1> ...",
      "contentEn": "<h1>Terms & Conditions</h1> ...",
      "isActive": true,
      "lastUpdatedBy": "64admin001",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### أخطاء محتملة

| الحالة | الوصف | الشكل |
|--------|-------|-------|
| 404 | لا توجد سياسة نشطة من هذا النوع | `{ "error": { "code": "HTTP_404", "message": "لا توجد سياسة نشطة من نوع terms" } }` |

### كود Flutter

```dart
Future<Policy> getTermsPolicy() async {
  final response = await _dio.get('/policies/public/terms');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Policy.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. سياسة الخصوصية

يعيد آخر نسخة نشطة من سياسة الخصوصية.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/policies/public/privacy`
- **Auth Required:** ❌ لا
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64pol456",
      "type": "privacy",
      "titleAr": "سياسة الخصوصية",
      "titleEn": "Privacy Policy",
      "contentAr": "<h1>سياسة الخصوصية</h1> ...",
      "contentEn": "<h1>Privacy Policy</h1> ...",
      "isActive": true,
      "lastUpdatedBy": "64admin001",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-01-18T09:45:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### أخطاء محتملة

| الحالة | الوصف | الشكل |
|--------|-------|-------|
| 404 | لا توجد سياسة نشطة من هذا النوع | `{ "error": { "code": "HTTP_404", "message": "لا توجد سياسة نشطة من نوع privacy" } }` |

### كود Flutter

```dart
Future<Policy> getPrivacyPolicy() async {
  final response = await _dio.get('/policies/public/privacy');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Policy.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. سياسة بحسب النوع

Endpoint عام يمكن استخدامه للحصول على أي سياسة موجودة في النظام، طالما أنها نشطة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/policies/public/:type`
- **Path Param:** `type` (قيمة من `PolicyType`)
- **Auth Required:** ❌ لا
- **Cache:** ❌ لا

### PolicyType المدعومة

| القيمة | الوصف |
|--------|-------|
| `terms` | الأحكام والشروط |
| `privacy` | سياسة الخصوصية |

> ⚠️ إذا تمت إضافة أنواع جديدة في الـ Backend، سيتم دعمها تلقائياً عبر نفس الـ endpoint بدون تعديل إضافي.

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64pol789",
      "type": "terms",
      "titleAr": "الأحكام والشروط",
      "titleEn": "Terms & Conditions",
      "contentAr": "<h1>...</h1>",
      "contentEn": "<h1>...</h1>",
      "isActive": true,
      "lastUpdatedBy": "64admin001",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-01-20T12:15:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### أخطاء محتملة

| الحالة | الوصف | الشكل |
|--------|-------|-------|
| 404 | النوع المطلوب غير موجود أو السياسة غير مفعّلة | `{ "error": { "code": "HTTP_404", "message": "لا توجد سياسة نشطة من نوع someType" } }` |

### كود Flutter

```dart
Future<Policy> getPolicyByType(String type) async {
  final response = await _dio.get('/policies/public/$type');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Policy.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## نماذج Flutter

### نموذج `Policy`

```dart
class Policy {
  final String id;
  final String type;
  final String titleAr;
  final String titleEn;
  final String contentAr;
  final String contentEn;
  final bool isActive;
  final String lastUpdatedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Policy({
    required this.id,
    required this.type,
    required this.titleAr,
    required this.titleEn,
    required this.contentAr,
    required this.contentEn,
    required this.isActive,
    required this.lastUpdatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Policy.fromJson(Map<String, dynamic> json) {
    return Policy(
      id: json['_id'],
      type: json['type'],
      titleAr: json['titleAr'],
      titleEn: json['titleEn'],
      contentAr: json['contentAr'],
      contentEn: json['contentEn'],
      isActive: json['isActive'] ?? false,
      lastUpdatedBy: json['lastUpdatedBy'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
```

### مزود الخدمة

```dart
class PoliciesService {
  final Dio _dio;

  PoliciesService(this._dio);

  Future<Policy> fetchTerms() => getPolicyByType('terms');

  Future<Policy> fetchPrivacy() => getPolicyByType('privacy');

  Future<Policy> getPolicyByType(String type) async {
    final response = await _dio.get('/policies/public/$type');

    final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
      response.data,
      (json) => json as Map<String, dynamic>,
    );

    if (apiResponse.isSuccess) {
      return Policy.fromJson(apiResponse.data!['data']);
    } else {
      throw ApiException(apiResponse.error!);
    }
  }
}
```

---

## 📝 ملاحظات مهمة

1. **عام بالكامل:** جميع الـ endpoints مفتوحة للاستخدام العام (`/policies/public/...`). لا حاجة للـ JWT لأي من العملاء أو التجار أو المهندسين.
2. **سياسة واحدة لكل نوع:** لا يمكن إنشاء أكثر من سياسة واحدة لكل نوع. يتم استرجاع السياسة النشطة فقط.
3. **محتوى HTML:** الحقول `contentAr` و `contentEn` تُخزن HTML، لذا استخدم مصفّي HTML في الواجهة (مثل `flutter_html`).
4. **لغة العرض:** اختر بين `contentAr` أو `contentEn` حسب لغة الواجهة. العناوين متاحة في كلا اللغتين.
5. **حالة النشر:** لا يتم إرجاع إلا السياسات التي تحمل `isActive = true`. أي سياسة غير مفعّلة لن تظهر عبر هذه الـ endpoints.
6. **التخزين المحلي:** يمكن تخزين السياسة محلياً (cache) مع التحقق من `updatedAt` لتقليل الاستدعاءات.
7. **التوسّع لاحقاً:** إذا أضيفت أنواع سياسات جديدة (مثل سياسة الشحن أو الاسترجاع)، سيتم دعمها عبر نفس endpoint دون أي تغييرات من جهة العميل.

---

**التالي:** [خدمة الطلبات الهندسية (Engineering Services)](./14-services-service.md)


