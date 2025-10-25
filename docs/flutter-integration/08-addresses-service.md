# 📍 خدمة العناوين (Addresses Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة العناوين توفر endpoints لإدارة عناوين التوصيل مع دعم الإحداثيات (**coords إجباري**).

---

## 📋 جدول المحتويات

1. [قائمة العناوين](#1-قائمة-العناوين)
2. [العناوين النشطة](#2-العناوين-النشطة)
3. [العنوان الافتراضي](#3-العنوان-الافتراضي)
4. [عنوان محدد](#4-عنوان-محدد)
5. [إنشاء عنوان جديد](#5-إنشاء-عنوان-جديد)
6. [تحديث عنوان](#6-تحديث-عنوان)
7. [حذف عنوان](#7-حذف-عنوان)
8. [تعيين كعنوان افتراضي](#8-تعيين-كعنوان-افتراضي)
9. [استعادة عنوان محذوف](#9-استعادة-عنوان-محذوف)
10. [التحقق من الملكية](#10-التحقق-من-الملكية)
11. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة العناوين

يسترجع جميع عناوين المستخدم مع إمكانية تضمين المحذوفة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/addresses`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `includeDeleted` | `boolean` | ❌ | تضمين العناوين المحذوفة |

### Response - نجاح

```json
{
  "success": true,
  "addresses": [
    {
      "_id": "64addr123",
      "userId": "64user456",
      "label": "المنزل",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "city": "صنعاء",
      "coords": {
        "lat": 15.3694,
        "lng": 44.1910
      },
      "notes": "يرجى الاتصال عند الوصول",
      "isDefault": true,
      "isActive": true,
      "lastUsedAt": "2025-01-15T10:00:00.000Z",
      "usageCount": 15,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "count": 1,
  "requestId": "req_addr_001"
}
```

### كود Flutter

```dart
Future<List<Address>> getAddresses({bool includeDeleted = false}) async {
  final response = await _dio.get(
    '/addresses',
    queryParameters: {
      if (includeDeleted) 'includeDeleted': 'true',
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final addresses = (apiResponse.data!['addresses'] as List)
        .map((item) => Address.fromJson(item))
        .toList();
    return addresses;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. العناوين النشطة

يسترجع العناوين النشطة فقط (غير المحذوفة).

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/addresses/active`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "addresses": [
    {
      "_id": "64addr123",
      "userId": "64user456",
      "label": "المنزل",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "city": "صنعاء",
      "coords": {
        "lat": 15.3694,
        "lng": 44.1910
      },
      "notes": "يرجى الاتصال عند الوصول",
      "isDefault": true,
      "isActive": true,
      "lastUsedAt": "2025-01-15T10:00:00.000Z",
      "usageCount": 15,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "count": 1,
  "requestId": "req_addr_002"
}
```

### كود Flutter

```dart
Future<List<Address>> getActiveAddresses() async {
  final response = await _dio.get('/addresses/active');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final addresses = (apiResponse.data!['addresses'] as List)
        .map((item) => Address.fromJson(item))
        .toList();
    return addresses;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. العنوان الافتراضي

يسترجع العنوان الافتراضي للمستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/addresses/default`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "address": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "city": "صنعاء",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "lastUsedAt": "2025-01-15T10:00:00.000Z",
    "usageCount": 15,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_addr_003"
}
```

### Response - لا يوجد عنوان افتراضي

```json
{
  "success": true,
  "address": null,
  "message": "No addresses found. Please add an address first.",
  "requestId": "req_addr_003"
}
```

### كود Flutter

```dart
Future<Address?> getDefaultAddress() async {
  final response = await _dio.get('/addresses/default');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final addressData = apiResponse.data!['address'];
    return addressData != null ? Address.fromJson(addressData) : null;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. عنوان محدد

يسترجع عنوان محدد بالـ ID.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/addresses/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "address": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "city": "صنعاء",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "lastUsedAt": "2025-01-15T10:00:00.000Z",
    "usageCount": 15,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_addr_004"
}
```

### كود Flutter

```dart
Future<Address> getAddress(String id) async {
  final response = await _dio.get('/addresses/$id');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Address.fromJson(apiResponse.data!['address']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. إنشاء عنوان جديد

ينشئ عنوان جديد للمستخدم.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/addresses`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "label": "المنزل",
  "line1": "شارع الستين، بجوار مطعم السلطان",
  "city": "صنعاء",
  "coords": {
    "lat": 15.3694,
    "lng": 44.1910
  },
  "notes": "يرجى الاتصال عند الوصول",
  "isDefault": true
}
```

**ملاحظة مهمة:**
- `coords` إجباري (required)
- `label`, `line1`, `city` إجبارية
- `notes`, `isDefault` اختيارية

### Response - نجاح

```json
{
  "success": true,
  "message": "Address created successfully",
  "address": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "city": "صنعاء",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "usageCount": 0,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_addr_005"
}
```

### كود Flutter

```dart
Future<Address> createAddress({
  required String label,
  required String line1,
  required String city,
  required AddressCoords coords,
  String? notes,
  bool isDefault = false,
}) async {
  final response = await _dio.post('/addresses', data: {
    'label': label,
    'line1': line1,
    'city': city,
    'coords': coords.toJson(),
    if (notes != null) 'notes': notes,
    'isDefault': isDefault,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Address.fromJson(apiResponse.data!['address']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 6. تحديث عنوان

يحدث عنوان موجود.

### معلومات الطلب

- **Method:** `PATCH`
- **Endpoint:** `/addresses/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "label": "المنزل الجديد",
  "line1": "شارع الستين، بجوار مطعم السلطان",
  "city": "صنعاء",
  "coords": {
    "lat": 15.3694,
    "lng": 44.1910
  },
  "notes": "يرجى الاتصال عند الوصول",
  "isDefault": true,
  "isActive": true
}
```

**جميع الحقول اختيارية** - يمكنك إرسال الحقول التي تريد تحديثها فقط.

### Response - نجاح

```json
{
  "success": true,
  "message": "Address updated successfully",
  "address": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل الجديد",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "city": "صنعاء",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "lastUsedAt": "2025-01-15T10:00:00.000Z",
    "usageCount": 15,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  },
  "requestId": "req_addr_006"
}
```

### كود Flutter

```dart
Future<Address> updateAddress({
  required String id,
  String? label,
  String? line1,
  String? city,
  AddressCoords? coords,
  String? notes,
  bool? isDefault,
  bool? isActive,
}) async {
  final data = <String, dynamic>{};
  if (label != null) data['label'] = label;
  if (line1 != null) data['line1'] = line1;
  if (city != null) data['city'] = city;
  if (coords != null) data['coords'] = coords.toJson();
  if (notes != null) data['notes'] = notes;
  if (isDefault != null) data['isDefault'] = isDefault;
  if (isActive != null) data['isActive'] = isActive;

  final response = await _dio.patch('/addresses/$id', data: data);

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Address.fromJson(apiResponse.data!['address']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 7. حذف عنوان

يحذف عنوان (حذف ناعم).

### معلومات الطلب

- **Method:** `DELETE`
- **Endpoint:** `/addresses/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "message": "Address deleted successfully",
  "result": {
    "deleted": true
  },
  "requestId": "req_addr_007"
}
```

### Errors

| Code | HTTP Status | الوصف |
|------|-------------|-------|
| `Address not found` | 404 | العنوان غير موجود |
| `Cannot delete your only address` | 400 | لا يمكن حذف العنوان الوحيد |

### كود Flutter

```dart
Future<bool> deleteAddress(String id) async {
  final response = await _dio.delete('/addresses/$id');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['result']['deleted'] ?? false;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 8. تعيين كعنوان افتراضي

يعين عنوان كافتراضي للمستخدم.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/addresses/:id/set-default`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "message": "Default address set successfully",
  "address": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "city": "صنعاء",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "lastUsedAt": "2025-01-15T10:00:00.000Z",
    "usageCount": 15,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  },
  "requestId": "req_addr_008"
}
```

### كود Flutter

```dart
Future<Address> setDefaultAddress(String id) async {
  final response = await _dio.post('/addresses/$id/set-default');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Address.fromJson(apiResponse.data!['address']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 9. استعادة عنوان محذوف

يستعيد عنوان محذوف (حذف ناعم).

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/addresses/:id/restore`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "message": "Address restored successfully",
  "address": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "city": "صنعاء",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": false,
    "isActive": true,
    "lastUsedAt": "2025-01-15T10:00:00.000Z",
    "usageCount": 15,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  },
  "requestId": "req_addr_009"
}
```

### Errors

| Code | HTTP Status | الوصف |
|------|-------------|-------|
| `Address not found` | 404 | العنوان غير موجود |
| `Address is not deleted` | 400 | العنوان ليس محذوفاً |

### كود Flutter

```dart
Future<Address> restoreAddress(String id) async {
  final response = await _dio.post('/addresses/$id/restore');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Address.fromJson(apiResponse.data!['address']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 10. التحقق من الملكية

يتحقق من أن العنوان يخص المستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/addresses/validate/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "valid": true
  },
  "requestId": "req_addr_010"
}
```

### كود Flutter

```dart
Future<bool> validateAddressOwnership(String id) async {
  final response = await _dio.get('/addresses/validate/$id');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['valid'] ?? false;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/address/address_models.dart`

```dart
class Address {
  final String id;
  final String userId;
  final String label;
  final String line1;
  final String city;
  final AddressCoords coords;
  final String? notes;
  final bool isDefault;
  final bool isActive;
  final DateTime? lastUsedAt;
  final int usageCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Address({
    required this.id,
    required this.userId,
    required this.label,
    required this.line1,
    required this.city,
    required this.coords,
    this.notes,
    required this.isDefault,
    required this.isActive,
    this.lastUsedAt,
    required this.usageCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['_id'],
      userId: json['userId'],
      label: json['label'] ?? '',
      line1: json['line1'] ?? '',
      city: json['city'] ?? '',
      coords: AddressCoords.fromJson(json['coords']),
      notes: json['notes'],
      isDefault: json['isDefault'] ?? false,
      isActive: json['isActive'] ?? true,
      lastUsedAt: json['lastUsedAt'] != null 
          ? DateTime.parse(json['lastUsedAt']) 
          : null,
      usageCount: json['usageCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String get fullAddress => '$line1, $city';
  String get shortAddress => city;

  bool get hasNotes => notes != null && notes!.isNotEmpty;
  bool get isRecentlyUsed => lastUsedAt != null && 
      DateTime.now().difference(lastUsedAt!).inDays < 7;
  bool get isFrequentlyUsed => usageCount > 10;
}

class AddressCoords {
  final double lat;
  final double lng;

  AddressCoords({
    required this.lat,
    required this.lng,
  });

  factory AddressCoords.fromJson(Map<String, dynamic> json) {
    return AddressCoords(
      lat: (json['lat'] ?? 0).toDouble(),
      lng: (json['lng'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lng': lng,
    };
  }

  bool get isValid => lat != 0 && lng != 0;
  String get displayString => '${lat.toStringAsFixed(6)}, ${lng.toStringAsFixed(6)}';
}
```

---

## 📝 ملاحظات مهمة

1. **هيكل العنوان (مبسط):**
   - `label`: تسمية العنوان (مثل: "المنزل", "المكتب") - **إجباري**
   - `line1`: العنوان الرئيسي (الشارع، رقم المبنى، التفاصيل) - **إجباري**
   - `city`: المدينة - **إجباري**
   - `coords`: الإحداثيات الجغرافية (lat, lng) - **إجباري**
   - `notes`: ملاحظات/تعليمات التسليم - **اختياري**

2. **الإحداثيات (coords) إجباري:**
   - يجب إرسال `coords` مع كل عنوان جديد
   - لا يمكن حفظ عنوان بدون إحداثيات
   - استخدم Google Maps API أو خدمة مماثلة للحصول على الإحداثيات

3. **الإحصائيات:**
   - `usageCount`: عدد مرات الاستخدام
   - `lastUsedAt`: آخر مرة استخدم فيها
   - `isRecentlyUsed`: استخدم مؤخراً (أقل من 7 أيام)
   - `isFrequentlyUsed`: مستخدم بكثرة (أكثر من 10 مرات)

4. **الحالة:**
   - `isDefault`: العنوان الافتراضي (أول عنوان يصبح افتراضي تلقائياً)
   - `isActive`: نشط أم لا
   - `hasNotes`: يحتوي على ملاحظات

5. **العرض في التطبيق:**
   - استخدم `fullAddress` للعنوان الكامل (line1, city)
   - استخدم `shortAddress` للعنوان المختصر (city فقط)
   - اعرض `isRecentlyUsed` للعناوين المستخدمة مؤخراً
   - اعرض `isFrequentlyUsed` للعناوين المستخدمة بكثرة

6. **التحقق من الملكية:**
   - استخدم `validateAddressOwnership()` قبل التعديل
   - تأكد من أن العنوان يخص المستخدم

7. **الحذف والاستعادة:**
   - الحذف ناعم (soft delete)
   - **لا يمكن حذف العنوان الوحيد** - يجب أن يكون لديك على الأقل عنوان واحد
   - يمكن استعادة العناوين المحذوفة
   - استخدم `includeDeleted: true` لعرض المحذوفة

8. **الأداء:**
   - جميع الـ endpoints تتطلب مصادقة
   - لا يوجد cache للعناوين (بيانات شخصية)
   - استخدم `getActiveAddresses()` للعناوين النشطة فقط

9. **⚠️ تغييرات مهمة عن الإصدار السابق:**
   - **تم إزالة**: `addressType`, `recipientName`, `recipientPhone`, `line2`, `region`, `country`, `postalCode`, `placeId`
   - **الآن إجباري**: `coords` (كان اختيارياً في السابق)
   - **البنية مبسطة**: فقط الحقول الأساسية (label, line1, city, coords, notes)

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تم تصحيح جميع الـ responses - النموذج الموحد: `{ success, address/addresses, count?, message?, requestId }`
2. ✅ تم تبسيط نموذج `Address` - إزالة جميع الحقول غير الموجودة في Backend
3. ✅ تم جعل `coords` إجباري في الـ create
4. ✅ تم تصحيح الـ delete response (result بدلاً من data)
5. ✅ تم إضافة error codes الفعلية (Cannot delete your only address, Address is not deleted)
6. ✅ تم تحديث جميع أكواد Flutter لتعكس البنية الصحيحة

**ملفات Backend المرجعية:**
- `backend/src/modules/addresses/addresses.controller.ts` - جميع endpoints
- `backend/src/modules/addresses/addresses.service.ts` - المنطق والـ validations
- `backend/src/modules/addresses/dto/address.dto.ts` - CreateAddressDto, UpdateAddressDto
- `backend/src/modules/addresses/schemas/address.schema.ts` - Address Schema

---

**التالي:** [خدمة البنرات (Banners)](./09-banners-service.md)

