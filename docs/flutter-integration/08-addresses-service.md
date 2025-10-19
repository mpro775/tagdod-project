# 📍 خدمة العناوين (Addresses Service)

خدمة العناوين توفر endpoints لإدارة عناوين التوصيل مع دعم الإحداثيات والأنواع المختلفة.

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
  "data": [
    {
      "_id": "64addr123",
      "userId": "64user456",
      "label": "المنزل",
      "addressType": "home",
      "recipientName": "أحمد محمد",
      "recipientPhone": "773123456",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "line2": "الدور الثالث، شقة 12",
      "city": "صنعاء",
      "region": "حي السبعين",
      "country": "Yemen",
      "postalCode": "12345",
      "coords": {
        "lat": 15.3694,
        "lng": 44.1910
      },
      "notes": "يرجى الاتصال عند الوصول",
      "isDefault": true,
      "isActive": true,
      "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
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

  final apiResponse = ApiResponse<List<Address>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Address.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
  "data": [
    {
      "_id": "64addr123",
      "userId": "64user456",
      "label": "المنزل",
      "addressType": "home",
      "recipientName": "أحمد محمد",
      "recipientPhone": "773123456",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "line2": "الدور الثالث، شقة 12",
      "city": "صنعاء",
      "region": "حي السبعين",
      "country": "Yemen",
      "postalCode": "12345",
      "coords": {
        "lat": 15.3694,
        "lng": 44.1910
      },
      "notes": "يرجى الاتصال عند الوصول",
      "isDefault": true,
      "isActive": true,
      "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
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

  final apiResponse = ApiResponse<List<Address>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Address.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
  "data": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "addressType": "home",
    "recipientName": "أحمد محمد",
    "recipientPhone": "773123456",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "line2": "الدور الثالث، شقة 12",
    "city": "صنعاء",
    "region": "حي السبعين",
    "country": "Yemen",
    "postalCode": "12345",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
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
  "success": false,
  "message": "No addresses found. Please add an address first.",
  "data": null,
  "requestId": "req_addr_003"
}
```

### كود Flutter

```dart
Future<Address?> getDefaultAddress() async {
  final response = await _dio.get('/addresses/default');

  final apiResponse = ApiResponse<Address?>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'] != null
        ? Address.fromJson((json as Map<String, dynamic>)['data'])
        : null,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data;
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
  "data": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "addressType": "home",
    "recipientName": "أحمد محمد",
    "recipientPhone": "773123456",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "line2": "الدور الثالث، شقة 12",
    "city": "صنعاء",
    "region": "حي السبعين",
    "country": "Yemen",
    "postalCode": "12345",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
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

  final apiResponse = ApiResponse<Address>.fromJson(
    response.data,
    (json) => Address.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
  "addressType": "home",
  "recipientName": "أحمد محمد",
  "recipientPhone": "773123456",
  "line1": "شارع الستين، بجوار مطعم السلطان",
  "line2": "الدور الثالث، شقة 12",
  "city": "صنعاء",
  "region": "حي السبعين",
  "country": "Yemen",
  "postalCode": "12345",
  "coords": {
    "lat": 15.3694,
    "lng": 44.1910
  },
  "notes": "يرجى الاتصال عند الوصول",
  "isDefault": true,
  "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA"
}
```

### Response - نجاح

```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "addressType": "home",
    "recipientName": "أحمد محمد",
    "recipientPhone": "773123456",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "line2": "الدور الثالث، شقة 12",
    "city": "صنعاء",
    "region": "حي السبعين",
    "country": "Yemen",
    "postalCode": "12345",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
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
  required String recipientName,
  required String recipientPhone,
  required String line1,
  required String city,
  String? addressType,
  String? line2,
  String? region,
  String? country,
  String? postalCode,
  AddressCoords? coords,
  String? notes,
  bool isDefault = false,
  String? placeId,
}) async {
  final response = await _dio.post('/addresses', data: {
    'label': label,
    'addressType': addressType ?? 'home',
    'recipientName': recipientName,
    'recipientPhone': recipientPhone,
    'line1': line1,
    if (line2 != null) 'line2': line2,
    'city': city,
    if (region != null) 'region': region,
    if (country != null) 'country': country,
    if (postalCode != null) 'postalCode': postalCode,
    if (coords != null) 'coords': coords.toJson(),
    if (notes != null) 'notes': notes,
    'isDefault': isDefault,
    if (placeId != null) 'placeId': placeId,
  });

  final apiResponse = ApiResponse<Address>.fromJson(
    response.data,
    (json) => Address.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
  "recipientName": "أحمد محمد",
  "recipientPhone": "773123456",
  "line1": "شارع الستين، بجوار مطعم السلطان",
  "line2": "الدور الثالث، شقة 12",
  "city": "صنعاء",
  "region": "حي السبعين",
  "notes": "يرجى الاتصال عند الوصول",
  "isDefault": true
}
```

### Response - نجاح

```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل الجديد",
    "addressType": "home",
    "recipientName": "أحمد محمد",
    "recipientPhone": "773123456",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "line2": "الدور الثالث، شقة 12",
    "city": "صنعاء",
    "region": "حي السبعين",
    "country": "Yemen",
    "postalCode": "12345",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
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
  String? addressType,
  String? recipientName,
  String? recipientPhone,
  String? line1,
  String? line2,
  String? city,
  String? region,
  String? country,
  String? postalCode,
  AddressCoords? coords,
  String? notes,
  bool? isDefault,
  bool? isActive,
  String? placeId,
}) async {
  final data = <String, dynamic>{};
  if (label != null) data['label'] = label;
  if (addressType != null) data['addressType'] = addressType;
  if (recipientName != null) data['recipientName'] = recipientName;
  if (recipientPhone != null) data['recipientPhone'] = recipientPhone;
  if (line1 != null) data['line1'] = line1;
  if (line2 != null) data['line2'] = line2;
  if (city != null) data['city'] = city;
  if (region != null) data['region'] = region;
  if (country != null) data['country'] = country;
  if (postalCode != null) data['postalCode'] = postalCode;
  if (coords != null) data['coords'] = coords.toJson();
  if (notes != null) data['notes'] = notes;
  if (isDefault != null) data['isDefault'] = isDefault;
  if (isActive != null) data['isActive'] = isActive;
  if (placeId != null) data['placeId'] = placeId;

  final response = await _dio.patch('/addresses/$id', data: data);

  final apiResponse = ApiResponse<Address>.fromJson(
    response.data,
    (json) => Address.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
  "data": {
    "deleted": true,
    "addressId": "64addr123"
  },
  "requestId": "req_addr_007"
}
```

### كود Flutter

```dart
Future<bool> deleteAddress(String id) async {
  final response = await _dio.delete('/addresses/$id');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['deleted'] ?? false;
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
  "data": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "addressType": "home",
    "recipientName": "أحمد محمد",
    "recipientPhone": "773123456",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "line2": "الدور الثالث، شقة 12",
    "city": "صنعاء",
    "region": "حي السبعين",
    "country": "Yemen",
    "postalCode": "12345",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": true,
    "isActive": true,
    "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
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

  final apiResponse = ApiResponse<Address>.fromJson(
    response.data,
    (json) => Address.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
  "data": {
    "_id": "64addr123",
    "userId": "64user456",
    "label": "المنزل",
    "addressType": "home",
    "recipientName": "أحمد محمد",
    "recipientPhone": "773123456",
    "line1": "شارع الستين، بجوار مطعم السلطان",
    "line2": "الدور الثالث، شقة 12",
    "city": "صنعاء",
    "region": "حي السبعين",
    "country": "Yemen",
    "postalCode": "12345",
    "coords": {
      "lat": 15.3694,
      "lng": 44.1910
    },
    "notes": "يرجى الاتصال عند الوصول",
    "isDefault": false,
    "isActive": true,
    "placeId": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
    "lastUsedAt": "2025-01-15T10:00:00.000Z",
    "usageCount": 15,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  },
  "requestId": "req_addr_009"
}
```

### كود Flutter

```dart
Future<Address> restoreAddress(String id) async {
  final response = await _dio.post('/addresses/$id/restore');

  final apiResponse = ApiResponse<Address>.fromJson(
    response.data,
    (json) => Address.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
    (json) => (json as Map<String, dynamic>)['data'],
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
enum AddressType {
  home,
  work,
  other,
}

class Address {
  final String id;
  final String userId;
  final String label;
  final AddressType addressType;
  final String recipientName;
  final String recipientPhone;
  final String line1;
  final String? line2;
  final String city;
  final String? region;
  final String country;
  final String? postalCode;
  final AddressCoords? coords;
  final String? notes;
  final bool isDefault;
  final bool isActive;
  final String? placeId;
  final DateTime? lastUsedAt;
  final int usageCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Address({
    required this.id,
    required this.userId,
    required this.label,
    required this.addressType,
    required this.recipientName,
    required this.recipientPhone,
    required this.line1,
    this.line2,
    required this.city,
    this.region,
    required this.country,
    this.postalCode,
    this.coords,
    this.notes,
    required this.isDefault,
    required this.isActive,
    this.placeId,
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
      addressType: AddressType.values.firstWhere(
        (e) => e.name == json['addressType'],
        orElse: () => AddressType.home,
      ),
      recipientName: json['recipientName'] ?? '',
      recipientPhone: json['recipientPhone'] ?? '',
      line1: json['line1'] ?? '',
      line2: json['line2'],
      city: json['city'] ?? '',
      region: json['region'],
      country: json['country'] ?? 'Yemen',
      postalCode: json['postalCode'],
      coords: json['coords'] != null 
          ? AddressCoords.fromJson(json['coords']) 
          : null,
      notes: json['notes'],
      isDefault: json['isDefault'] ?? false,
      isActive: json['isActive'] ?? true,
      placeId: json['placeId'],
      lastUsedAt: json['lastUsedAt'] != null 
          ? DateTime.parse(json['lastUsedAt']) 
          : null,
      usageCount: json['usageCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String get fullAddress {
    final parts = [
      line1,
      if (line2 != null) line2,
      city,
      if (region != null) region,
      country,
    ];
    return parts.join(', ');
  }

  String get shortAddress {
    final parts = [
      line1,
      city,
    ];
    return parts.join(', ');
  }

  bool get hasCoords => coords != null;
  bool get hasPlaceId => placeId != null && placeId!.isNotEmpty;
  bool get isRecentlyUsed => lastUsedAt != null && 
      DateTime.now().difference(lastUsedAt!).inDays < 7;
  bool get isFrequentlyUsed => usageCount > 10;
  bool get hasNotes => notes != null && notes!.isNotEmpty;
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

1. **أنواع العناوين:**
   - `home`: المنزل
   - `work`: المكتب
   - `other`: أخرى
   - استخدم `AddressType` enum للتحقق من النوع

2. **هيكل العنوان:**
   - `label`: تسمية العنوان (مثل: "المنزل", "المكتب")
   - `line1`: العنوان الرئيسي (الشارع، رقم المبنى)
   - `line2`: تفاصيل إضافية (رقم الشقة، الدور)
   - `city`: المدينة
   - `region`: المنطقة/الحي
   - `country`: الدولة (افتراضي: Yemen)

3. **الإحداثيات:**
   - `coords`: الإحداثيات الجغرافية (lat, lng)
   - `placeId`: Google Place ID للموقع
   - استخدم `hasCoords` للتحقق من وجود الإحداثيات
   - استخدم `hasPlaceId` للتحقق من وجود Place ID

4. **المعلومات الشخصية:**
   - `recipientName`: اسم المستلم
   - `recipientPhone`: رقم هاتف المستلم
   - `notes`: ملاحظات/تعليمات التسليم

5. **الإحصائيات:**
   - `usageCount`: عدد مرات الاستخدام
   - `lastUsedAt`: آخر مرة استخدم فيها
   - `isRecentlyUsed`: استخدم مؤخراً (أقل من 7 أيام)
   - `isFrequentlyUsed`: مستخدم بكثرة (أكثر من 10 مرات)

6. **الحالة:**
   - `isDefault`: العنوان الافتراضي
   - `isActive`: نشط أم لا
   - `hasNotes`: يحتوي على ملاحظات

7. **العرض في التطبيق:**
   - استخدم `fullAddress` للعنوان الكامل
   - استخدم `shortAddress` للعنوان المختصر
   - اعرض `isRecentlyUsed` للمستخدم مؤخراً
   - اعرض `isFrequentlyUsed` للمستخدم بكثرة
   - اعرض `hasNotes` للملاحظات

8. **التحقق من الملكية:**
   - استخدم `validateAddressOwnership()` قبل التعديل
   - تأكد من أن العنوان يخص المستخدم

9. **الحذف والاستعادة:**
   - الحذف ناعم (soft delete)
   - يمكن استعادة العناوين المحذوفة
   - استخدم `includeDeleted: true` لعرض المحذوفة

10. **الأداء:**
    - جميع الـ endpoints تتطلب مصادقة
    - لا يوجد cache للعناوين (بيانات شخصية)
    - استخدم `getActiveAddresses()` للعناوين النشطة فقط

---

**التالي:** [خدمة البنرات (Banners)](./09-banners-service.md)

