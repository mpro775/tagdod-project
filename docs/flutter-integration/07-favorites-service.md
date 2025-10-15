# ⭐ خدمة المفضلات (Favorites Service)

خدمة المفضلات توفر endpoints لإدارة المنتجات المفضلة للمستخدم.

---

## Endpoints

### 1. قائمة المفضلات
- **GET** `/favorites`
- **Auth:** ✅ Required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "fav_123",
      "userId": "user_456",
      "variantId": "var_789",
      "product": {
        "name": {"ar": "لوح شمسي 550 واط", "en": "Solar Panel 550W"},
        "image": "https://cdn.example.com/products/solar-panel.jpg",
        "price": 135000
      },
      "tags": ["urgent", "compare"],
      "notes": "للمشروع الجديد",
      "createdAt": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

### 2. إضافة للمفضلة
- **POST** `/favorites`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "variantId": "var_789",
  "tags": ["urgent"],
  "notes": "للمشروع الجديد"
}
```

### 3. إزالة من المفضلة
- **DELETE** `/favorites`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "variantId": "var_789"
}
```

### 4. تحديث مفضلة
- **PATCH** `/favorites/:id`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "tags": ["urgent", "compare"],
  "notes": "ملاحظات محدثة"
}
```

### 5. حذف جميع المفضلات
- **DELETE** `/favorites/clear/all`
- **Auth:** ✅ Required

### 6. عدد المفضلات
- **GET** `/favorites/count`
- **Auth:** ✅ Required
- **Response:**
```json
{
  "success": true,
  "data": {"count": 5}
}
```

### 7. مزامنة المفضلات
- **POST** `/favorites/sync`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "deviceId": "device_abc123"
}
```

---

## Models في Flutter

```dart
class Favorite {
  final String id;
  final String userId;
  final String variantId;
  final FavoriteProduct product;
  final List<String> tags;
  final String? notes;
  final DateTime createdAt;

  Favorite({
    required this.id,
    required this.userId,
    required this.variantId,
    required this.product,
    required this.tags,
    this.notes,
    required this.createdAt,
  });

  factory Favorite.fromJson(Map<String, dynamic> json) {
    return Favorite(
      id: json['_id'],
      userId: json['userId'],
      variantId: json['variantId'],
      product: FavoriteProduct.fromJson(json['product']),
      tags: List<String>.from(json['tags'] ?? []),
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class FavoriteProduct {
  final LocalizedString name;
  final String image;
  final double price;

  FavoriteProduct({
    required this.name,
    required this.image,
    required this.price,
  });

  factory FavoriteProduct.fromJson(Map<String, dynamic> json) {
    return FavoriteProduct(
      name: LocalizedString.fromJson(json['name']),
      image: json['image'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
    );
  }
}
```

---

**التالي:** [خدمة العناوين (Addresses)](./08-addresses-service.md)

