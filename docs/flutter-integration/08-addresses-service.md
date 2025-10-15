# 📍 خدمة العناوين (Addresses Service)

خدمة العناوين توفر endpoints لإدارة عناوين التوصيل.

---

## Endpoints

### 1. قائمة العناوين
- **GET** `/addresses`
- **Auth:** ✅ Required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "addr_123",
      "userId": "user_456",
      "fullName": "أحمد محمد",
      "phone": "777123456",
      "city": "صنعاء",
      "district": "الحصبة",
      "street": "شارع الزبيري",
      "building": "عمارة 10",
      "floor": "الطابق الثالث",
      "notes": "بجانب مسجد الرحمن",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2025-10-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. العناوين النشطة فقط
- **GET** `/addresses/active`
- **Auth:** ✅ Required

### 3. العنوان الافتراضي
- **GET** `/addresses/default`
- **Auth:** ✅ Required

### 4. عنوان محدد
- **GET** `/addresses/:id`
- **Auth:** ✅ Required

### 5. إنشاء عنوان جديد
- **POST** `/addresses`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "fullName": "أحمد محمد",
  "phone": "777123456",
  "city": "صنعاء",
  "district": "الحصبة",
  "street": "شارع الزبيري",
  "building": "عمارة 10",
  "floor": "الطابق الثالث",
  "notes": "بجانب مسجد الرحمن",
  "isDefault": true
}
```

### 6. تحديث عنوان
- **PATCH** `/addresses/:id`
- **Auth:** ✅ Required

### 7. حذف عنوان
- **DELETE** `/addresses/:id`
- **Auth:** ✅ Required

### 8. تعيين كعنوان افتراضي
- **POST** `/addresses/:id/set-default`
- **Auth:** ✅ Required

### 9. استعادة عنوان محذوف
- **POST** `/addresses/:id/restore`
- **Auth:** ✅ Required

---

## Models في Flutter

```dart
class Address {
  final String id;
  final String userId;
  final String fullName;
  final String phone;
  final String city;
  final String district;
  final String street;
  final String? building;
  final String? floor;
  final String? notes;
  final bool isDefault;
  final bool isActive;
  final DateTime createdAt;

  Address({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.phone,
    required this.city,
    required this.district,
    required this.street,
    this.building,
    this.floor,
    this.notes,
    required this.isDefault,
    required this.isActive,
    required this.createdAt,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['_id'],
      userId: json['userId'],
      fullName: json['fullName'],
      phone: json['phone'],
      city: json['city'],
      district: json['district'],
      street: json['street'],
      building: json['building'],
      floor: json['floor'],
      notes: json['notes'],
      isDefault: json['isDefault'] ?? false,
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  String get fullAddress {
    final parts = [
      city,
      district,
      street,
      if (building != null) building,
      if (floor != null) floor,
    ];
    return parts.join(', ');
  }
}
```

---

**التالي:** [خدمة البنرات (Banners)](./09-banners-service.md)

